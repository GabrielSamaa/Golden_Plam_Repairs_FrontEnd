<template>
  <div class="repairs-page">

    <!-- لودینگ Overlay برای بارگذاری اولیه -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
      <p class="loading-text">در حال بارگذاری اطلاعات...</p>
    </div>


    <!-- Desktop User Icon -->
    <div class="desktop-user-icon" @click="toggleSidebar" v-if="currentRepairman">
      <i class="fas fa-user-circle"></i>
      <span class="user-icon-tooltip">پنل تعمیرکار</span>
    </div>

    <!-- Hamburger Menu Button (Mobile Only) -->
    <button class="menu-toggle" @click="toggleSidebar">
      <i class="fas fa-bars"></i>
    </button>

    <!-- Sidebar -->
    <div class="sidebar" :class="{ 'sidebar-open': isSidebarOpen }">
      <div class="sidebar-header">
        <h2>پنل تعمیرکار</h2>
        <button class="close-sidebar" @click="toggleSidebar">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="sidebar-content" v-if="currentRepairman">
        <div class="profile-section">
          <div class="profile-avatar">
            <i class="fas fa-user-circle"></i>
          </div>
          <div class="profile-info">
            <h3>{{ currentRepairman.fullName }}</h3>
            <div class="profile-details">
              <div class="detail-item">
                <i class="fas fa-phone"></i>
                <span>{{ currentRepairman.phone }}</span>
              </div>
              <div class="detail-item">
                <i class="fas fa-tools"></i>
                <span>{{ getSpecialtyText(currentRepairman.specialty) }}</span>
              </div>
              <div class="detail-item">
                <i class="fas fa-circle" :class="'status-' + currentRepairman.status"></i>
                <span>{{ getStatusText(currentRepairman.status) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="sidebar-actions">
          <button class="btn btn-danger logout-btn" @click="handleLogout">
            <i class="fas fa-sign-out-alt"></i>
            خروج از حساب کاربری
          </button>
        </div>
      </div>
    </div>

    <!-- Overlay for mobile -->
    <div class="sidebar-overlay" v-if="isSidebarOpen" @click="toggleSidebar"></div>

    <div class="page-header">
      <div class="header-content">
        <h2>لیست تعمیرات</h2>
      </div>
      <div class="filters">
        <div class="search-box">
          <input 
            type="text" 
            class="form-control" 
            v-model="searchQuery" 
            placeholder="جستجو در تعمیرات..."
          >
        </div>
        <select class="form-select" v-model="statusFilter">
          <option value="all">همه وضعیت‌ها</option>
          <option value="pending">در انتظار بررسی</option>
          <option value="in-progress">در حال انجام</option>
          <option value="completed">تکمیل شده</option>
        </select>
      </div>
    </div>

    <div class="repairs-grid">
      <div 
        v-for="repair in filteredRepairs" 
        :key="repair.id" 
        class="repair-card"
        @click="openRepairDetails(repair)"
      >
        <div class="card-header">
          <span class="tracking-number">{{ repair.verification_code || '---' }}</span>
          <span :class="['status-badge', repair.status]">{{ getStatusText(repair.status) }}</span>
        </div>
        <div class="card-body">
          <div class="info-row">
            <i class="fas fa-user"></i>
            <span>نامشخص</span>
          </div>
          <div class="info-row">
            <i class="fas fa-mobile-alt"></i>
            <span>{{ repair.device_name || 'نامشخص' }}</span>
          </div>
          <div class="info-row">
            <i class="fas fa-tag"></i>
            <span>{{ repair.device_problem || 'ندارد' }}</span>
          </div>
          <div class="info-row">
            <i class="fas fa-money-bill-wave"></i>
            <span>{{ (Number(repair.prepaid) || 0).toLocaleString() }} تومان</span>
          </div>
        </div>
        <div class="card-footer">
          <div class="date-info">
            <div class="date-item">
              <i class="fas fa-calendar-plus"></i>
              <span>تاریخ پذیرش: {{ repair.received_at || 'نامشخص' }}</span>
            </div>
            <div class="date-item">
              <i class="fas fa-calendar-check"></i>
              <span>تاریخ تحویل: {{ repair.delivered_at || 'نامشخص' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Repair Details Modal -->
    <div class="modal" :class="{ show: showModal }" @click.self="closeModal">
      <div class="modal-content" v-if="selectedRepair">
        <div class="modal-header">
          <h3>جزئیات تعمیر</h3>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="detail-section">
            <h4>اطلاعات دستگاه</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>نوع دستگاه:</label>
                <span>{{ selectedRepair.device_name || 'نامشخص' }}</span>
              </div>
              <div class="detail-item">
                <label>بیانه:</label>
                <span>{{ (Number(selectedRepair.prepaid) || 0).toLocaleString() }} تومان</span>
              </div>
              <div class="detail-item">
                <label>وضعیت:</label>
                <span :class="['status-badge', selectedRepair.status]">
                  {{ getStatusText(selectedRepair.status) }}
                </span>
              </div>
              <div class="detail-item">
                <label>تاریخ تحویل:</label>
                <span>{{ selectedRepair.delivered_at || 'نامشخص' }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>توضیحات</h4>
            <p class="description">{{ selectedRepair.device_problem || 'ندارد' }}</p>
          </div>

          <div class="modal-actions">
            <button 
              v-for="action in modalActions" 
              :key="action.text"
              :class="['btn', action.class]"
              @click="action.action"
            >
              <i :class="action.icon"></i>
              {{ action.text }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Parts List Modal -->
    <div class="modal" :class="{ show: showPartsModal }" @click.self="closePartsModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>لیست قطعات تعویض شده</h3>
          <button class="close-btn" @click="closePartsModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="parts-list" v-if="selectedRepairParts.length > 0">
            <div class="part-item" v-for="part in selectedRepairParts" :key="part.id">
              <div class="part-info">
                <span class="part-name">{{ part.name }}</span>
                <span class="part-price">{{ part.price.toLocaleString() }} تومان</span>
              </div>
              <div class="part-description">{{ part.description }}</div>
            </div>
          </div>
          <div class="no-parts" v-else>
            <i class="fas fa-tools"></i>
            <p>هیچ قطعه‌ای ثبت نشده است</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Customer Details Modal -->
    <div class="modal" :class="{ show: showCustomerModal }" @click.self="closeCustomerModal">
      <div class="modal-content" v-if="selectedRepair">
        <div class="modal-header">
          <h3>مشخصات مشتری</h3>
          <button class="close-btn" @click="closeCustomerModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="customer-details">
            <div class="detail-item">
              <label>نام مشتری:</label>
              <span>{{ selectedRepair?.customerName || 'نامشخص' }}</span>
            </div>
            <div class="detail-item">
              <label>شماره تماس:</label>
              <span>{{ selectedRepair?.phone || 'نامشخص' }}</span>
            </div>
            <div class="detail-item">
              <label>نوع دستگاه:</label>
              <span>{{ selectedRepair?.deviceType || 'نامشخص' }}</span>
            </div>
            <div class="detail-item">
              <label>دسته‌بندی:</label>
              <span>{{ selectedRepair?.category || 'نامشخص' }}</span>
            </div>
            <div class="detail-item">
              <label>تاریخ پذیرش:</label>
              <span>{{ selectedRepair?.receptionDate || selectedRepair?.date || 'نامشخص' }}</span>
            </div>
            <div class="detail-item">
              <label>تاریخ تکمیل:</label>
              <span>{{ selectedRepair?.completionDate || 'نامشخص' }}</span>
            </div>
            <div class="detail-item full-width">
              <label>توضیحات:</label>
              <p class="description">{{ selectedRepair?.issue || 'توضیحاتی ثبت نشده است' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { navigateTo, useRouter } from 'nuxt/app'
import { useAuth } from '~/composables/useAuth'

const repairs = ref([])
const searchQuery = ref('')
const statusFilter = ref('all')
const showModal = ref(false)
const selectedRepair = ref(null)
const currentRepairman = ref(null)
const router = useRouter()
const { clearAuth } = useAuth()
const isSidebarOpen = ref(false)
const isLoading = ref(false);

// Add new refs for modals
const showPartsModal = ref(false)
const showCustomerModal = ref(false)
const selectedRepairParts = ref([])

// Load repairs from localStorage
onMounted(async () => {
  const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
  const currentRepairmanId = localStorage.getItem('currentRepairmanId');
  if (!token || !currentRepairmanId) {
    router.push('/login');
    return;
  }

  // مقداردهی اطلاعات تعمیرکار برای پنل
  const repairmen = JSON.parse(localStorage.getItem('repairmen') || '[]');
  const foundRepairman = repairmen.find(r => r.id == currentRepairmanId);
  if (foundRepairman) {
    currentRepairman.value = {
      id: foundRepairman.id,
      fullName: foundRepairman.fullName || foundRepairman.name,
      phone: foundRepairman.phone,
      specialty: foundRepairman.specialty || 'general',
      status: foundRepairman.status || 'active'
    }
  }

  try {
    isLoading.value = true
    // دریافت لیست تعمیرات از API (آدرس باید با /api/ شروع شود)
    const { $axios } = useNuxtApp ? useNuxtApp() : { $axios: null };
    if ($axios) {
      const response = await $axios.get('/technician-device', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      repairs.value = Array.isArray(response.data) ? response.data : (response.data?.data || response.data?.result || []);
      console.log('داده دریافتی از API:', repairs.value);
    }
  } catch (error) {
    console.error('خطا در دریافت لیست تعمیرات:', error, error?.response?.data);
    Command: toastr["error"]("خطا در دریافت لیست تعمیرات از سرور ", "خطا در دریافت")

toastr.options = {
  "closeButton": true,
  "debug": false,
  "newestOnTop": false,
  "progressBar": false,
  "positionClass": "toast-top-center",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "3000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}
    repairs.value = [];
  }

  finally {
    isLoading.value = false
  }


});

// Add a watch to monitor repairs changes
watch(repairs, (newRepairs) => {
  console.log('Repairs updated:', newRepairs)
}, { deep: true })

const filteredRepairs = computed(() => {
  try {
    let result = repairs.value.filter(repair => {
      // اگر جستجویی انجام نشده، همه را نمایش بده
      if (!searchQuery.value) {
        return statusFilter.value === 'all' || repair.status === statusFilter.value
      }

      const searchLower = searchQuery.value.toLowerCase()
      const matchesSearch = 
        repair.customerName?.toLowerCase().includes(searchLower) ||
        repair.trackingNumber?.toLowerCase().includes(searchLower) ||
        repair.deviceType?.toLowerCase().includes(searchLower) ||
        repair.phone?.toLowerCase().includes(searchLower) ||
        repair.category?.toLowerCase().includes(searchLower) ||
        repair.issue?.toLowerCase().includes(searchLower)
      
      const matchesStatus = statusFilter.value === 'all' || repair.status === statusFilter.value
      
      return matchesSearch && matchesStatus
    })

    // Sort repairs based on status and dates
    return result.sort((a, b) => {
      // First priority: status (pending > in-progress > completed)
      const statusOrder = { 'pending': 0, 'in-progress': 1, 'completed': 2 }
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status]
      }

      // Second priority: admin marked ready
      if (a.adminMarkedReady !== b.adminMarkedReady) {
        return a.adminMarkedReady ? 1 : -1
      }

      // Third priority: dates
      const getDate = (repair) => {
        return repair.completionDate || repair.receptionDate || repair.date || ''
      }
      return getDate(b).localeCompare(getDate(a))
    })
  } catch (error) {
    console.error('Error filtering repairs:', error)
    return repairs.value
  }
})

const getStatusText = (status) => {
  const statusMap = {
    'received': 'دریافت شده',
    'in_progress': 'در حال انجام',
    'fixed': 'تعمیر شده',
    'delivered': 'تحویل داده شده',
    'canceled': 'لغو شده'
  }
  return statusMap[status] || status
}

const getSpecialtyText = (specialty) => {
  const specialtyMap = {
    'mobile': 'موبایل',
    'laptop': 'لپ‌تاپ',
    'tablet': 'تبلت',
    'general': 'عمومی'
  }
  return specialtyMap[specialty] || specialty
}

const openRepairDetails = (repair) => {
  selectedRepair.value = repair
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  showPartsModal.value = false
  showCustomerModal.value = false
  selectedRepairParts.value = []
  // Only reset selectedRepair when closing the main modal
  selectedRepair.value = null
}

const updateStatus = (newStatus) => {
  if (selectedRepair.value) {
    selectedRepair.value.status = newStatus
    // Update in localStorage
    const index = repairs.value.findIndex(r => r.id === selectedRepair.value.id)
    if (index !== -1) {
      repairs.value[index] = selectedRepair.value
      localStorage.setItem('receptions', JSON.stringify(repairs.value))
    }
  }
}

const startRepair = async () => {
  if (selectedRepair.value) {
    try {
      const { $axios } = useNuxtApp ? useNuxtApp() : { $axios: null };
      if ($axios) {
        const response = await $axios.patch(`/device/repair/${selectedRepair.value.id}`, {
          status: 'in_progress'
        });
        // اگر موفق بود، وضعیت را در فرانت هم تغییر بده
        selectedRepair.value.status = 'in_progress';
        const index = repairs.value.findIndex(r => r.id === selectedRepair.value.id);
        if (index !== -1) {
          repairs.value[index] = { ...repairs.value[index], status: 'in_progress' };
        }
        // به صفحه شروع تعمیر برو
        navigateTo(`/repairman/start_repairs?id=${selectedRepair.value.id}`);
      }
    } catch (error) {
      Command: toastr["error"]("خطا در بروزرسانی وضعیت در سرور ", "خطا در بروزرسانی")

toastr.options = {
  "closeButton": true,
  "debug": false,
  "newestOnTop": false,
  "progressBar": false,
  "positionClass": "toast-top-center",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "3000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}
    }
  }
}

const continueRepair = () => {
  if (selectedRepair.value) {
    // Navigate to start_repairs page with the repair ID
    navigateTo(`/repairman/start_repairs?id=${selectedRepair.value.id}`)
  }
}

const completeRepair = async () => {
  if (selectedRepair.value) {
    try {
      const { $axios } = useNuxtApp();
      
      // بررسی وجود قطعات در دیتابیس
      const repairResponse = await $axios.get(`/device/repair/${selectedRepair.value.id}`);
      const repairDetails = repairResponse.data.repair_details;
      
      // اگر قطعات وجود نداشت یا آرایه خالی بود
      if (!repairDetails || (Array.isArray(repairDetails) && repairDetails.length === 0)) {
        Command: toastr["warning"]("لطفا ابتدا قطعات تعمیر را ثبت کنید", "هشدار ")

toastr.options = {
  "closeButton": false,
  "debug": false,
  "newestOnTop": false,
  "progressBar": false,
  "positionClass": "toast-top-center",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "5000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}
        // هدایت به صفحه ثبت قطعات
        navigateTo(`/repairman/start_repairs?id=${selectedRepair.value.id}`);
        return;
      }

      // آپدیت وضعیت به تعمیر شده
      await $axios.patch(`/device/repair/${selectedRepair.value.id}`, {
        status: 'fixed'
      });

      // بروزرسانی وضعیت در فرانت
      selectedRepair.value.status = 'fixed';
      const index = repairs.value.findIndex(r => r.id === selectedRepair.value.id);
      if (index !== -1) {
        repairs.value[index].status = 'fixed';
      }
      
      Command: toastr["success"]("وضعیت دستگاه با موفقیت به تعمیر شده تغییر کرد", "موفق")

toastr.options = {
  "closeButton": false,
  "debug": false,
  "newestOnTop": false,
  "progressBar": false,
  "positionClass": "toast-top-center",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "5000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}
      closeModal();
      
    } catch (error) {
      console.error('خطا در تکمیل تعمیر:', error);
      Command: toastr["error"]("خطا در بروزرسانی وضعیت", "خطا")

toastr.options = {
  "closeButton": false,
  "debug": false,
  "newestOnTop": false,
  "progressBar": false,
  "positionClass": "toast-top-center",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "5000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}
    }
  }
};

const revertToInProgress = () => {
  if (selectedRepair.value) {
    selectedRepair.value.status = 'in_progress'
    const index = repairs.value.findIndex(r => r.id === selectedRepair.value.id)
    if (index !== -1) {
      repairs.value[index] = selectedRepair.value
      localStorage.setItem('receptions', JSON.stringify(repairs.value))
    }
    closeModal()
  }
}

const handleLogout = async () => {
  // Ask for confirmation before logout
  if (confirm('آیا از خروج از حساب کاربری خود اطمینان دارید؟')) {
    // Clear all login-related data using the auth composable
    clearAuth()
    
    // Clear any repair-related temporary data
    const repairmanId = currentRepairman.value?.id
    if (repairmanId) {
      localStorage.removeItem(`repair_parts_${repairmanId}`)
    }
    
    // Clear the current repairman data from memory
    currentRepairman.value = null
    
    // Redirect to login page
    await router.replace('/login')
  }
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

// Add new methods for handling parts list and customer details
const showPartsList = () => {
  if (selectedRepair.value) {
    const parts = JSON.parse(localStorage.getItem(`repair_parts_${selectedRepair.value.id}`) || '[]')
    selectedRepairParts.value = parts
    showPartsModal.value = true
  }
}

const closePartsModal = () => {
  showPartsModal.value = false
  selectedRepairParts.value = []
}

const showCustomerDetails = () => {
  if (!selectedRepair.value) {
    console.error('No repair selected')
    return
  }
  showCustomerModal.value = true
}

const closeCustomerModal = () => {
  showCustomerModal.value = false
  // Don't reset selectedRepair here as it might be needed for other modals
}

// Update the modal actions section in template
const modalActions = computed(() => {
  if (!selectedRepair.value) return []
  
  const actions = []
  // هماهنگ با مقادیر واقعی status از API
  if (selectedRepair.value.status === 'received') {
    actions.push({
      text: 'شروع تعمیر',
      icon: 'fas fa-tools',
      class: 'btn-primary',
      action: startRepair
    })
  }
  
  if (selectedRepair.value.status === 'in_progress') {
    actions.push(
      {
        text: 'ادامه تعمیر',
        icon: 'fas fa-wrench',
        class: 'btn-info',
        action: continueRepair
      },
      {
        text: 'تکمیل تعمیر',
        icon: 'fas fa-check',
        class: 'btn-success',
        action: completeRepair
      }
    )
  }
  
  if (selectedRepair.value.status === 'fixed') {
    actions.push({
      text: 'بازگشت به حالت در حال انجام',
      icon: 'fas fa-undo',
      class: 'btn-warning',
      action: revertToInProgress
    })
  }
  
  // delivered و canceled معمولاً دکمه ندارند
  return actions
})
</script>

<style scoped>

.loading-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        }
        .spinner {
            width: 50px;
            height: 50px;
            border: 5px solid #f3f3f3;
            border-top: 5px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        .loading-text {
            color: #fff;
            font-size: 1.2rem;
            margin-top: 10px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }


.repairs-page {
  padding: 20px;
  position: relative;
  min-height: 100vh;
  background: #f8f9fa;
  transition: margin-right 0.3s ease;
}

.page-header {
  margin-bottom: 30px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 1rem;
}

.filters {
  display: flex;
  gap: 15px;
  margin-top: 15px;
}

.search-box {
  flex: 1;
  max-width: 300px;
}

.repairs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.repair-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.repair-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.card-header {
  padding: 15px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tracking-number {
  font-weight: 500;
  color: #2c3e50;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.status-badge.pending { background: #fff3cd; color: #856404; }
.status-badge.in-progress { background: #cce5ff; color: #004085; }
.status-badge.completed { background: #d4edda; color: #155724; }
.status-badge.delivered { background: #d4edda; color: #155724; }

.card-body {
  padding: 15px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  color: #2c3e50;
}

.info-row i {
  width: 20px;
  color: #7f8c8d;
}

.card-footer {
  padding: 10px 15px;
  border-top: 1px solid #eee;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.date-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.date-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.date-item i {
  width: 16px;
  color: #3498db;
}

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s;
}

.modal.show {
  opacity: 1;
  visibility: visible;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  min-height: 200px;
}

.modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.modal-content.loading::before {
  opacity: 1;
  visibility: visible;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
}

.modal-body {
  padding: 20px;
}

.detail-section {
  margin-bottom: 30px;
}

.detail-section h4 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-item label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.description {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  color: #2c3e50;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn {
  padding: 8px 15px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-success {
  background: #2ecc71;
  color: white;
}

.btn-success:hover {
  background: #27ae60;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-info:hover {
  background: #138496;
}

.btn-warning {
  background: #f1c40f;
  color: #2c3e50;
}

.btn-warning:hover {
  background: #f39c12;
}

/* Menu Toggle Button */
.menu-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 45px;
  height: 45px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
  transition: all 0.3s ease;
}

.menu-toggle:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(52, 152, 219, 0.4);
}

.menu-toggle i {
  font-size: 1.3rem;
}

/* Sidebar */
.sidebar {
  position: fixed;
  top: 0;
  right: -320px;
  width: 320px;
  height: 100vh;
  background: white;
  box-shadow: -5px 0 25px rgba(0,0,0,0.1);
  z-index: 1001;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  border-left: 1px solid rgba(0,0,0,0.05);
}

.sidebar-open {
  right: 0;
}

.sidebar-header {
  padding: 25px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to right, #f8f9fa, #ffffff);
}

.sidebar-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.4rem;
  font-weight: 600;
}

.close-sidebar {
  background: none;
  border: none;
  color: #7f8c8d;
  cursor: pointer;
  font-size: 1.3rem;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-sidebar:hover {
  color: #2c3e50;
  background: #f8f9fa;
}

.sidebar-content {
  padding: 25px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-section {
  text-align: center;
  margin-bottom: 20px;
  padding: 25px;
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.profile-avatar {
  font-size: 4.5rem;
  color: #3498db;
  margin-bottom: 20px;
  text-shadow: 0 2px 4px rgba(52, 152, 219, 0.2);
}

.profile-info h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 15px;
  text-align: right;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #2c3e50;
  padding: 12px 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.detail-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.detail-item i {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3498db;
  font-size: 1.1rem;
}

.detail-item i.status-active {
  color: #2ecc71;
}

.detail-item i.status-inactive {
  color: #e74c3c;
}

.sidebar-actions {
  margin-top: auto;
  padding: 20px 0;
}

.logout-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 1.1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.2);
}

.logout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(220, 53, 69, 0.3);
}

.logout-btn i {
  font-size: 1.2rem;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.sidebar-open + .sidebar-overlay {
  opacity: 1;
  visibility: visible;
}

/* Desktop User Icon */
.desktop-user-icon {
  position: fixed;
  top: 15px;
  right: 15px;
  z-index: 1000;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  border-radius: 50%;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(52, 152, 219, 0.2);
  transition: all 0.3s ease;
}

.desktop-user-icon i {
  font-size: 1.8rem;
  color: white;
}

.desktop-user-icon:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
}

.user-icon-tooltip {
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
  white-space: nowrap;
  margin-right: 10px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.desktop-user-icon:hover .user-icon-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateY(-50%) translateX(-5px);
}

/* Update Desktop Styles */
@media (min-width: 1024px) {
  .menu-toggle {
    display: none;
  }

  .desktop-user-icon {
    display: flex;
  }

  .sidebar {
    right: -350px;
    width: 350px;
    transition: right 0.3s ease;
  }

  .sidebar.sidebar-open {
    right: 0;
  }

  .close-sidebar {
    display: flex !important;
    width: 32px;
    height: 32px;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
    border: none;
    border-radius: 50%;
    color: #7f8c8d;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .close-sidebar:hover {
    background: #e9ecef;
    color: #2c3e50;
  }

  .close-sidebar i {
    font-size: 1.2rem;
  }

  .sidebar-header {
    padding: 25px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .sidebar-overlay {
    display: none;
  }

  .repairs-page {
    margin-right: 0;
    padding-right: 20px;
    transition: margin-right 0.3s ease;
    padding-top: 70px; /* Add space for the user icon */
  }

  .sidebar-open ~ .repairs-page {
    margin-right: 350px;
    padding-right: 370px;
  }

  /* Hide user icon when sidebar is open */
  .sidebar-open ~ .desktop-user-icon {
    opacity: 0;
    visibility: hidden;
  }
}

/* Tablet Styles */
@media (min-width: 768px) and (max-width: 1023px) {
  .sidebar {
    width: 300px;
  }

  .repairs-page {
    margin-right: 300px;
    padding-right: 320px;
  }

  .profile-section {
    padding: 20px;
  }
}

/* Mobile Styles */
@media (max-width: 767px) {
  .repairs-page {
    margin-right: 0;
    padding: 20px;
    padding-top: 80px;
  }

  .page-header {
    margin-top: 0;
  }

  .sidebar {
    width: 85%;
    max-width: 320px;
  }

  .profile-section {
    padding: 20px;
  }

  .profile-avatar {
    font-size: 4rem;
  }

  .profile-info h3 {
    font-size: 1.2rem;
  }

  .detail-item {
    padding: 10px 15px;
  }

  .logout-btn {
    padding: 12px;
    font-size: 1rem;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .sidebar {
    background: #1a1a1a;
    border-left-color: rgba(255,255,255,0.1);
  }

  .sidebar-header {
    background: linear-gradient(to right, #2c2c2c, #1a1a1a);
    border-bottom-color: rgba(255,255,255,0.1);
  }

  .sidebar-header h2 {
    color: #ffffff;
  }

  .close-sidebar {
    color: #a0a0a0;
  }

  .close-sidebar:hover {
    color: #ffffff;
    background: #2c2c2c;
  }

  .profile-section {
    background: linear-gradient(135deg, #2c2c2c, #1a1a1a);
  }

  .profile-info h3 {
    color: #ffffff;
  }

  .detail-item {
    background: #2c2c2c;
    color: #ffffff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  }

  .detail-item:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }

  .detail-item i {
    color: #3498db;
  }

  .desktop-user-icon {
    background: linear-gradient(135deg, #2980b9, #1a5276);
    box-shadow: 0 2px 10px rgba(26, 82, 118, 0.3);
  }

  .desktop-user-icon:hover {
    box-shadow: 0 4px 15px rgba(26, 82, 118, 0.4);
  }

  .user-icon-tooltip {
    background: rgba(255, 255, 255, 0.9);
    color: #2c3e50;
  }
}

/* Parts List Styles */
.parts-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.part-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  border: 1px solid #eee;
}

.part-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.part-name {
  font-weight: 500;
  color: #2c3e50;
}

.part-price {
  color: #27ae60;
  font-weight: 500;
}

.part-description {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.no-parts {
  text-align: center;
  padding: 30px;
  color: #7f8c8d;
}

.no-parts i {
  font-size: 2rem;
  margin-bottom: 10px;
  color: #95a5a6;
}

/* Customer Details Styles */
.customer-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  display: block;
  color: #7f8c8d;
  margin-bottom: 5px;
  font-size: 0.9rem;
}

.detail-item span {
  color: #2c3e50;
  font-weight: 500;
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .part-item {
    background: #2c2c2c;
    border-color: rgba(255,255,255,0.1);
  }

  .part-name {
    color: #ffffff;
  }

  .part-description {
    color: #a0a0a0;
  }

  .no-parts {
    color: #a0a0a0;
  }

  .no-parts i {
    color: #7f8c8d;
  }

  .detail-item label {
    color: #a0a0a0;
  }

  .detail-item span {
    color: #ffffff;
  }
}
</style>

