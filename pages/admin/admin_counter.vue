<template>
  <div class="counter-page">
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
      <div class="stat-card">
        <div class="stat-icon bg-success">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-info">
          <h3>{{ deliveredTodayCount }}</h3>
          <p>دستگاه‌های تحویل داده شده امروز</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-warning">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-info">
          <h3>{{ pendingDeliveryCount }}</h3>
          <p>در انتظار تحویل</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-info">
          <i class="fas fa-money-bill-wave"></i>
        </div>
        <div class="stat-info">
          <h3>{{ todayIncome.toLocaleString() }} تومان</h3>
          <p>درآمد امروز</p>
        </div>
      </div>
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
        <div class="filter-actions">
          <select class="form-select" v-model="sortBy">
            <option value="date">مرتب‌سازی بر اساس تاریخ</option>
            <option value="amount">مرتب‌سازی بر اساس مبلغ</option>
          </select>
          <button class="btn btn-outline-secondary" @click="clearSearch">
            <i class="fas fa-times"></i>
            پاک کردن جستجو
          </button>
        </div>
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
                <button 
                  class="btn btn-sm btn-success me-2" 
                  @click="markAsReadyForDelivery(repair)"
                  v-if="!repair.readyForDelivery"
                >
                  <i class="fas fa-check"></i>
                  آماده تحویل
                </button>
                <template v-else>
                  <button 
                    class="btn btn-sm btn-warning me-2" 
                    @click="cancelReadyForDelivery(repair)"
                    v-if="!repair.deliveredToCustomer"
                  >
                    <i class="fas fa-times"></i>
                    لغو آماده تحویل
                  </button>
                  <button 
                    class="btn btn-sm btn-primary me-2" 
                    @click="goToVerification(repair)"
                    v-if="checkDeliveryStatus(repair)"
                  >
                    <i class="fas fa-handshake"></i>
                    تحویل به مشتری
                  </button>
                  <button 
                    class="btn btn-sm btn-info me-2" 
                    @click="moveToArchive(repair)"
                    v-if="repair.deliveredToCustomer"
                  >
                    <i class="fas fa-archive"></i>
                    ارسال به بایگانی
                  </button>
                </template>
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
 const deliveredTodayCount = ref(0);
 const todayIncome = ref(0);
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
    repair.status === 'fixed' && !repair.readyForDelivery
  ).length;
 });

 const clearSearch = () => {
  searchQuery.value = '';
 };

 const loadRepairs = async () => {
  console.log('Attempting to load repairs...');
  try {
    const token = localStorage.getItem('token');
    console.log('Using token:', token ? 'Token found' : 'Token not found');
    const response = await $axios.get('/device/fixed-devices', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('API response received:', response);
    console.log('Repairs data:', response.data);
    repairs.value = response.data;
    if (!response.data || response.data.length === 0) {
      console.log('No repairs data returned from API.');
    }
  } catch (error) {
    console.error('Error loading repairs:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    alert('خطا در بارگذاری لیست تعمیرات.');
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

    deliveredTodayCount.value = deliveredTodayResponse.data.count;
    todayIncome.value = incomeTodayResponse.data.income;

  } catch (error) {
    console.error('Error loading dashboard stats:', error);
    alert('خطا در بارگذاری آمارهای داشبورد.');
  }
 };

 onMounted(() => {
  console.log('Component mounted. Checking user role...');
  const userRole = localStorage.getItem('role');
  console.log('User role from localStorage:', userRole);
  if (userRole === 'admin' || userRole === 'super-admin' || userRole === 'counter' || userRole === '1') {
    loadRepairs();
    loadDashboardStats();
  }
 });

 const checkDeliveryStatus = (repair) => {
  return repair.readyForDelivery && !repair.deliveredToCustomer;
 };

 const goToVerification = (repair) => {
  localStorage.setItem('deliveryVerificationInfo', JSON.stringify({
    repairId: repair.id,
    expectedCode: repair.verification_code,
    returnUrl: '/admin/admin_counter'
  }));
  const { $router } = useNuxtApp();
  $router.push('/admin/delivery_verification');
 };

 const markAsReadyForDelivery = async (repair) => {
  if (!repair.verification_code) {
    alert('خطا: کد رهگیری برای این دستگاه وجود ندارد و نمی‌توان پیامک ارسال کرد.');
    return;
  }

  console.log('Sending v_code to API:', repair.verification_code);

  if (confirm(`آیا از آماده تحویل کردن دستگاه با شماره پیگیری ${repair.verification_code} اطمینان دارید؟`)) {
    try {
      const { $axios } = useNuxtApp();
      
      await $axios.patch(`/device/repair/${repair.id}`, {
        readyForDelivery: true
      });

      const token = localStorage.getItem('token');
      const smsApi = axios.create({
        baseURL: 'http://localhost:8000/api',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      await smsApi.post('/delivery/v_code', { 
        v_code: repair.verification_code
      });
      
      alert('پیامک کد تایید برای مشتری ارسال شد. دستگاه آماده تحویل است.');

      const index = repairs.value.findIndex(r => r.id === repair.id);
      if (index !== -1) {
        repairs.value.splice(index, 1);
      }

    } catch (error) {
      console.error('Error in delivery process:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.errors?.v_code?.[0] || error.message || 'خطا در فرآیند آماده‌سازی برای تحویل.';
      alert(`خطا: ${errorMessage}`);
    }
  }
 };

 const cancelReadyForDelivery = (repair) => {
  if (confirm('آیا از لغو وضعیت آماده تحویل این دستگاه اطمینان دارید؟')) {
    const repairToUpdate = repairs.value.find(r => r.id === repair.id);
    if (repairToUpdate) {
      repairToUpdate.readyForDelivery = false;
      repairs.value = [...repairs.value];
      alert('وضعیت آماده تحویل لغو شد.');
    }
  }
 };

 const moveToArchive = async (repair) => {
  if (confirm('آیا از انتقال این دستگاه به بایگانی اطمینان دارید؟')) {
    try {
      const { $api } = useNuxtApp();
      await $api.post(`/repairs/${repair.id}/archive`);
      repairs.value = repairs.value.filter(r => r.id !== repair.id);
      alert('دستگاه با موفقیت به بایگانی منتقل شد.');
    } catch (error) {
      console.error('Error moving to archive:', error);
      alert('خطا در ارسال به بایگانی.');
    }
  }
 };
</script>

<style scoped>
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
