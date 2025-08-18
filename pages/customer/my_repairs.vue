<template>
  <div class="repairs-page">
    <!-- Loading Spinner -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
      <p class="loading-text">در حال بارگذاری اطلاعات...</p>
    </div>

    <div class="page-header">
      <h2>تعمیرات من</h2>
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
        @click="viewRepairDetails(repair)"
      >
        <div class="card-header">
          <span class="tracking-number">{{ repair.trackingNumber }}</span>
          <span :class="['status-badge', repair.readyForDelivery ? 'ready-for-delivery' : repair.status]">
            {{ repair.readyForDelivery ? 'آماده تحویل' : getStatusText(repair.status) }}
          </span>
        </div>
        <div class="card-body">
          <div class="info-row">
            <i class="fas fa-mobile-alt"></i>
            <span>{{ repair.deviceType }}</span>
          </div>
          <!-- <div class="info-row">
            <i class="fas fa-tag"></i>
            <span>{{ repair.category }}</span>
          </div> -->
          <!-- <div class="info-row">
            <i class="fas fa-money-bill-wave"></i>
            <span>{{ repair.statement.toLocaleString() }} تومان</span>
          </div> -->
        </div>
        <div class="card-footer">
          <div class="date-info">
            <div class="date-item">
              <i class="fas fa-calendar-plus"></i>
              <span>تاریخ پذیرش: {{ repair.receptionDate || repair.date }}</span>
            </div>
            <div class="date-item" v-if="repair.deliveryDate">
              <i class="fas fa-calendar-check"></i>
              <span>تاریخ تحویل: {{ repair.deliveryDate }}</span>
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
            <h4>اطلاعات مشتری</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>شماره پیگیری:</label>
                <span>{{ selectedRepair.trackingNumber }}</span>
              </div>
              <div class="detail-item">
                <label>نام مشتری:</label>
                <span>{{ selectedRepair.customerName }}</span>
              </div>
              <div class="detail-item">
                <label>شماره تماس:</label>
                <span>{{ selectedRepair.phone }}</span>
              </div>
              <div class="detail-item">
                <label>تاریخ ثبت:</label>
                <span>{{ selectedRepair.date }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>اطلاعات دستگاه</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>نوع دستگاه:</label>
                <span>{{ selectedRepair.deviceType }}</span>
              </div>
              <div class="detail-item">
                <label>دسته‌بندی:</label>
                <span>{{ selectedRepair.category }}</span>
              </div>
              <div class="detail-item">
                <label>بیانه:</label>
                <span>{{ selectedRepair.statement.toLocaleString() }} تومان</span>
              </div>
              <div class="detail-item">
                <label>وضعیت:</label>
                <span :class="['status-badge', selectedRepair.status]">
                  {{ getStatusText(selectedRepair.status) }}
                </span>
              </div>
            </div>
          </div>
          <!-- دکمه مشاهده جزئیات کامل -->
          <!-- تغییر در دکمه مشاهده جزئیات کامل -->
          <div class="detail-actions">
            <button class="btn btn-primary" @click="viewFullDetails(selectedRepair)">
              <i class="fas fa-external-link-alt me-2"></i>
              مشاهده جزئیات کامل
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useNuxtApp } from '#app'

const router = useRouter()
const route = useRoute()
const repairs = ref([])
const searchQuery = ref('')
const statusFilter = ref('all')
const showModal = ref(false)
const selectedRepair = ref(null)
const isLoading = ref(true)

// Load repairs from API
onMounted(async () => {
  const customerPhone = route.query.phone
  if (!customerPhone) {
    router.push('/customer/login')
    return
  }

  try {
    const { $axios } = useNuxtApp()
    const response = await $axios.get(`/user-device`)
    console.log(response)
    // تبدیل داده‌های API به فرمت مورد نیاز
    repairs.value = response.data.map(repair => ({
      id: repair.id,
      trackingNumber: repair.verification_code,
      customerName: repair.customer?.name,
      phone: repair.customer?.mobile,
      deviceType: repair.device_name,
      category: repair.category.name,
      status: repair.status,
      statement: Math.round(repair.prepaid) || 0,
      date: repair.created_at.substring(0, 10),
      deliveryDate: repair.delivery_date,
      readyForDelivery: repair.status === 'confirmed',
      repair_details: repair.repair_details
    }))

  } catch (error) {
    console.error('Error fetching repairs:', error)
    Command: toastr["error"]("خطا در دریافت اطلاعات تعمیرات", "خطا")

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
    router.push('/customer/login')
  } finally {
    isLoading.value = false
  }
})

// اضافه کردن loading spinner به template
const filteredRepairs = computed(() => {
  if (isLoading.value) return []
  
  return repairs.value.filter(repair => {
    const matchesSearch = 
      repair.trackingNumber?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      repair.deviceType?.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesStatus = statusFilter.value === 'all' || repair.status === statusFilter.value
    
    return matchesSearch && matchesStatus
  }).sort((a, b) => {
    // Sort by status and date
    const statusOrder = { 'pending': 0, 'in-progress': 1, 'completed': 2 }
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status]
    }
    return new Date(b.date || '') - new Date(a.date || '')
  })
})

// بروزرسانی status mapping
const getStatusText = (status) => {
  const statusMap = {
    'pending': 'در انتظار بررسی',
    'in_progress': 'در حال تعمیر',
    'fixed': 'تعمیر شده',
    'confirmed': 'آماده تحویل',
    'delivered': 'تحویل داده شده'
  }
  return statusMap[status] || status
}

const viewRepairDetails = (repair) => {
  selectedRepair.value = repair
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedRepair.value = null
}

// اصلاح تابع viewFullDetails
const viewFullDetails = (repair) => {
  if (!repair) {
    Command: toastr["error"]("اطلاعات تعمیر نامعتبر است", "خطا")

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
    return;
  }
  const trackingNumber = repair.trackingNumber;
  if (!trackingNumber) {
    Command: toastr["error"]("شماره پیگیری  نامعتبر است", "خطا")

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
    return;
  }

  router.push(`/Follow_up?tracking=${trackingNumber}`);
}
</script>

<style scoped>
.repairs-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
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
.status-badge.ready-for-delivery { 
  background: #e8f5e9; 
  color: #2e7d32; 
}

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

.search-tabs, .search-tab {
  display: none;
}

.detail-actions {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: center;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
  transform: translateY(-2px);
}

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

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }
  
  .search-box {
    max-width: 100%;
  }
  
  .repairs-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95%;
    margin: 10px;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>