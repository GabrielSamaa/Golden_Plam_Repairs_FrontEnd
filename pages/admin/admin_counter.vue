<template>
  <div class="counter-page">
    <!-- لودینگ Overlay برای بارگذاری اولیه -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
      <p class="loading-text">در حال بارگذاری اطلاعات...</p>
    </div>


    <div class="page-header">
      <h2>تحویل دستگاه‌ها</h2>
    </div>

    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon bg-primary">
          <i class="fas fa-tools"></i>
        </div>
        <div class="stat-info">
          <h3>{{ completedRepairs.length }}</h3>
          <p>دستگاه‌های آماده تحویل</p>
        </div>
      </div>
      <!-- <div class="stat-card">
        <div class="stat-icon bg-success">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-info">
          <h3>{{ deliveredTodayCount }}</h3>
          <p>دستگاه‌های تحویل داده شده امروز</p>
        </div>
      </div> -->
      <div class="stat-card">
        <div class="stat-icon bg-warning">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-info">
          <h3>{{ pendingDeliveryCount }}</h3>
          <p>در انتظار تحویل به مشتری</p>
        </div>
      </div>
      <!-- <div class="stat-card">
        <div class="stat-icon bg-info">
          <i class="fas fa-money-bill-wave"></i>
        </div>
        <div class="stat-info">
          <h3>{{ todayIncome.toLocaleString() }} تومان</h3>
          <p>درآمد امروز</p>
        </div>
      </div> -->
    </div>

    <div class="delivery-list">
      <h3>لیست دستگاه‌های آماده تحویل</h3>
      <div class="filters">
        <div class="search-box">
          <input 
            type="text" 
            class="form-control" 
            v-model="searchQuery" 
            placeholder="جستجو در شماره پیگیری، مشتری، دستگاه، شماره تماس..."
          >
        </div>
        <!-- <div class="filter-actions">
          <select class="form-select" v-model="sortBy">
            <option value="date">مرتب‌سازی بر اساس تاریخ</option>
            <option value="amount">مرتب‌سازی بر اساس مبلغ</option>
          </select>
          <button class="btn btn-outline-secondary" @click="clearSearch">
            <i class="fas fa-times"></i>
            پاک کردن جستجو
          </button>
        </div> -->
      </div>
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>شماره پیگیری</th>
              <th>نام مشتری</th>
              <th>نام دستگاه</th>
              <th>کد رهگیری</th>
              <th>تاریخ دریافت</th>
              <th>تاریخ تکمیل</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="repair in filteredRepairs" :key="repair.id">
              <td>{{ repair.verification_code }}</td>
              <td>{{ repair.customer ? repair.customer.name : 'نامشخص' }}</td>
              <td>{{ repair.device_name }}</td>
              <td>{{ repair.verification_code }}</td>
              <td>{{ repair.received_at ? new Date(repair.received_at).toLocaleDateString('fa-IR') : 'نامشخص' }}</td>
              <td>{{ repair.updated_at ? new Date(repair.updated_at).toLocaleDateString('fa-IR') : 'نامشخص' }}</td>
              <td>
                <span class="badge" :class="statusClass(repair.status)">{{ statusText(repair.status) }}</span>
              </td>
              <td>
                <!-- دکمه تایید برای تحویل -->
                <button 
                  class="btn btn-sm btn-success me-2"
                  @click="markAsConfirmed(repair)"
                  v-if="repair.status === 'fixed'"
                >
                  <i class="fas fa-check"></i>
                  تایید برای تحویل
                </button>

                <!-- دکمه های مربوط به وضعیت تایید شده -->
                <template v-if="repair.status === 'confirmed'">
                  <button 
                    class="btn btn-sm btn-primary me-2" 
                    @click="initiateDelivery(repair)"
                  >
                    <i class="fas fa-truck"></i>
                    تحویل به مشتری
                  </button>
                  <button 
                    class="btn btn-sm btn-warning me-2" 
                    @click="cancelConfirmation(repair)"
                  >
                    <i class="fas fa-times"></i>
                    لغو تایید
                  </button>
                </template>

                <!-- دکمه بایگانی برای دستگاه های تحویل شده -->
                <button 
                  class="btn btn-sm btn-secondary" 
                  @click="moveToArchive(repair)"
                  v-if="repair.status === 'delivered'"
                >
                  <i class="fas fa-archive"></i>
                  ارسال به بایگانی
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
 import { ref, computed, onMounted } from 'vue';
 import { useNuxtApp } from '#app';
 import axios from 'axios';

 definePageMeta({
  layout: 'admin',
  middleware: ['admin']
 });

 const searchQuery = ref('');
 const sortBy = ref('date');
 const repairs = ref([]);
 const isLoading = ref(false);
//  const deliveredTodayCount = ref(0);
//  const todayIncome = ref(0);
 const { $axios } = useNuxtApp();

 const filteredRepairs = computed(() => {
  if (!searchQuery.value) {
    return repairs.value;
  }
  const lowerCaseQuery = searchQuery.value.toLowerCase();
  return repairs.value.filter(repair => {
    return (
      (repair.verification_code && repair.verification_code.toLowerCase().includes(lowerCaseQuery)) ||
      (repair.customer && repair.customer.name.toLowerCase().includes(lowerCaseQuery)) ||
      (repair.device_name && repair.device_name.toLowerCase().includes(lowerCaseQuery)) ||
      (repair.customer && repair.customer.mobile.toLowerCase().includes(lowerCaseQuery))
    );
  });
 });

 const completedRepairs = computed(() => {
  return repairs.value.filter(repair => repair.status === 'fixed');
 });

 const pendingDeliveryCount = computed(() => {
  return repairs.value.filter(repair => 
    repair.status === 'confirmed' && !repair.readyForDelivery
  ).length;
 });

 const clearSearch = () => {
  searchQuery.value = '';
 };

 const loadRepairs = async () => {
  try {
    isLoading.value = true
    const { $api } = useNuxtApp();
    const response = await $api.get('/device/fixed-devices');
    // فیلتر کردن دستگاه‌هایی که وضعیت delivered ندارند
    repairs.value = response.data.filter(device => device.status !== 'delivered');
  } catch (error) {
   
    Command: toastr["error"]("خطا در بارگذاری لیست دستگاه ها", "خطا")

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
  "timeOut": "3000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}
  }

  finally {
    isLoading.value = false
  }
 };

 const loadDashboardStats = async () => {
  try {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    const [
      deliveredTodayResponse,
      incomeTodayResponse
    ] = await Promise.all([
      $axios.get('/device/count-delivered-today', { headers }),
      $axios.get('/financial/income-today', { headers })
    ]);

    // deliveredTodayCount.value = deliveredTodayResponse.data.count;
    // todayIncome.value = incomeTodayResponse.data.income;

  } catch (error) {
   
    Command: toastr["error"]("خطا در بارگذاری آمارهای داشبورد", "خطا")

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
  "timeOut": "3000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}
  }
 };

 onMounted(() => {
  
  const userRole = localStorage.getItem('role');
  
  if (userRole === 'admin' || userRole === 'super-admin' || userRole === 'counter' || userRole === '1') {
    loadRepairs();
    loadDashboardStats();
  }
 });

 const goToVerification = (repair) => {
  const router = useRouter();
  router.push(`/admin/verify-delivery-code?v_code=${repair.verification_code}`);
 };

 // مرحله ۱: تغییر وضعیت به 'confirmed'
 const markAsConfirmed = async (repair) => {
  if (confirm(`آیا از تایید دستگاه با شماره پیگیری ${repair.verification_code} برای تحویل اطمینان دارید؟`)) {
    try {
      const { $api } = useNuxtApp();
      await $api.patch(`/device/repair/${repair.id}`, {
        status: 'confirmed'
      });
      const index = repairs.value.findIndex(r => r.id === repair.id);
      if (index !== -1) {
        repairs.value[index].status = 'confirmed';
      }
      Command: toastr["success"]("دستگاه برای تحویل تایید و پیامک ارسال شد", "تایید تحویل")

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
  "timeOut": "3000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}
    } catch (error) {
      
      Command: toastr["error"]("خطا در تایید دستگاه", "خطا")

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
  "timeOut": "3000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}
    }
  }
 };

 // مرحله ۲: شروع فرآیند تح Delivery و ارسال پیامک
 const initiateDelivery = async (repair) => {
  if (confirm(`پیامک کد تایید برای مشتری ارسال شود؟`)) {
    try {
      const { $api } = useNuxtApp();
      await $api.post('/delivery/v_code', { 
        v_code: repair.verification_code
      });
      Command: toastr["info"]("پیامک کد تایید برای مشتری ارسال شد")

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
  "timeOut": "3000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}
      goToVerification(repair);
    } catch (error) {
      
      Command: toastr["error"]("خطا در ارسال پیامک کد تایید", "خطا")

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
  "timeOut": "3000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}
    }
  }
 };

 // مرحله ۳: لغو وضعیت تایید و بازگشت به 'fixed'
 const cancelConfirmation = async (repair) => {
  if (confirm('آیا از لغو وضعیت تایید این دستگاه اطمینان دارید؟')) {
    try {
      const { $api } = useNuxtApp();
      await $api.patch(`/device/repair/${repair.id}`, {
        status: 'fixed'
      });
      const index = repairs.value.findIndex(r => r.id === repair.id);
      if (index !== -1) {
        repairs.value[index].status = 'fixed';
      }
      Command: toastr["warning"]("وضعیت تایید لغو شد و به حالت تعمیر شده بازگشت", "هشدار")

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
  "timeOut": "3000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}
    } catch (error) {
      
      Command: toastr["error"]("خطا در لغو وضعیت تایید", "خطا")

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
  "timeOut": "3000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}
    }
  }
 };

 const moveToArchive = async (repair) => {
  if (confirm('آیا از انتقال این دستگاه به بایگانی اطمینان دارید؟')) {
    try {
      const { $api } = useNuxtApp();
      await $api.post(`/repairs/${repair.id}/archive`);
      repairs.value = repairs.value.filter(r => r.id !== repair.id);
      Command: toastr["success"]("دستگاه با موفقیت به بایگانی منتقل شد", "انتقال موفق")

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
  "timeOut": "3000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}
    } catch (error) {
      
      Command: toastr["error"]("خطا در ارسال به بایگانی", "انتقال ناموفق")

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
  "timeOut": "3000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}
    }
  }
 };

 const statusText = (status) => {
  const statuses = {
    'fixed': 'تعمیر شده',
    'confirmed': 'تایید شده برای تحویل',
    'delivered': 'تحویل داده شده'
  };
  return statuses[status] || status;
 };

 const statusClass = (status) => {
  const classes = {
    'fixed': 'badge-info',
    'confirmed': 'badge-success',
    'delivered': 'badge-secondary'
  };
  return classes[status] || '';
 };
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


.counter-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  margin-left: 15px;
}

.stat-icon.bg-primary { background: #3498db; }
.stat-icon.bg-success { background: #2ecc71; }
.stat-icon.bg-warning { background: #f39c12; }
.stat-icon.bg-danger { background: #e74c3c; }
.stat-icon.bg-info { background: #3498db; }

.stat-info h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #2c3e50;
}

.stat-info p {
  margin: 5px 0 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.delivery-list {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  margin-top: 20px;
}

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 300px;
}

.filter-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.form-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  min-width: 200px;
}

.btn-outline-secondary {
  background: transparent;
  border: 1px solid #95a5a6;
  color: #7f8c8d;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-outline-secondary:hover {
  background: #95a5a6;
  color: white;
}

.table-responsive {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 12px;
  text-align: right;
  border-bottom: 1px solid #eee;
}

.table th {
  background: #f8f9fa;
  font-weight: 500;
  color: #2c3e50;
}

.badge {
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.badge-success {
  background: #d4edda;
  color: #155724;
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
  background: #ffc107;
  color: #000;
}

.btn-warning:hover {
  background: #e0a800;
  color: #000;
}

.me-2 {
  margin-left: 0.5rem;
  margin-right: 0;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.badge-info {
  background: #17a2b8;
  color: white;
}

.badge-secondary {
  background: #6c757d;
  color: white;
}

@media (max-width: 768px) {
  .counter-page {
    padding: 10px;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 15px;
  }

  .delivery-list {
    padding: 15px;
  }

  .filters {
    flex-direction: column;
  }
  
  .search-box {
    width: 100%;
    min-width: unset;
  }
  
  .filter-actions {
    width: 100%;
    flex-direction: column;
  }
  
  .form-select {
    width: 100%;
  }
  
  .btn-outline-secondary {
    width: 100%;
    justify-content: center;
  }
  
  .table th,
  .table td {
    padding: 8px;
    font-size: 0.9rem;
  }
  
  .btn-sm {
    padding: 4px 8px;
    font-size: 0.8rem;
  }
}
</style>
