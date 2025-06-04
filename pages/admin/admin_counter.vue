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
          <h3>{{ deliveredCount }}</h3>
          <p>دستگاه‌های تحویل شده امروز</p>
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
          <h3>{{ todayRevenue.toLocaleString() }} تومان</h3>
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
              <th>مشتری</th>
              <th>دستگاه</th>
              <th>مبلغ</th>
              <th>تاریخ تکمیل</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="repair in filteredRepairs" :key="repair.id">
              <td>{{ repair.trackingNumber }}</td>
              <td>{{ repair.customerName }}</td>
              <td>{{ repair.deviceType }}</td>
              <td>{{ repair.statement.toLocaleString() }} تومان</td>
              <td>{{ repair.completionDate || 'نامشخص' }}</td>
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
                    v-if="!repair.deliveredToCustomer"
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
import { ref, computed, onMounted } from 'vue'

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const searchQuery = ref('')
const sortBy = ref('date')
const repairs = ref([])
const deliveredCount = ref(0)
const todayRevenue = ref(0)

// محاسبه آمار
const completedRepairs = computed(() => {
  return repairs.value.filter(repair => repair.status === 'completed')
})

const pendingDeliveryCount = computed(() => {
  return repairs.value.filter(repair => 
    repair.status === 'completed' && !repair.readyForDelivery
  ).length
})

// پاک کردن جستجو
const clearSearch = () => {
  searchQuery.value = ''
}

// فیلتر و مرتب‌سازی تعمیرات
const filteredRepairs = computed(() => {
  let result = repairs.value.filter(repair => {
    // فقط تعمیرات تکمیل شده را نمایش بده
    if (repair.status !== 'completed') {
      return false
    }

    // اگر جستجویی انجام نشده، همه را نمایش بده
    if (!searchQuery.value) {
      return true
    }

    const searchLower = searchQuery.value.toLowerCase()
    return (
      repair.trackingNumber.toLowerCase().includes(searchLower) ||
      repair.customerName.toLowerCase().includes(searchLower) ||
      repair.deviceType.toLowerCase().includes(searchLower) ||
      repair.phone.toLowerCase().includes(searchLower) ||
      repair.category.toLowerCase().includes(searchLower) ||
      repair.issue.toLowerCase().includes(searchLower) ||
      (repair.parts && repair.parts.some(part => part.name.toLowerCase().includes(searchLower))) ||
      repair.statement.toString().includes(searchLower) ||
      (repair.completionDate && repair.completionDate.toLowerCase().includes(searchLower))
    )
  })

  // مرتب‌سازی
  result.sort((a, b) => {
    if (sortBy.value === 'date') {
      return (b.completionDate || '').localeCompare(a.completionDate || '')
    } else {
      return b.statement - a.statement
    }
  })

  return result
})

// بارگذاری داده‌ها
onMounted(() => {
  loadRepairs()
  calculateTodayStats()
})

const loadRepairs = () => {
  const savedRepairs = JSON.parse(localStorage.getItem('receptions') || '[]')
  repairs.value = savedRepairs
}

const calculateTodayStats = () => {
  const today = new Date().toLocaleDateString('fa-IR')
  const todayDeliveries = repairs.value.filter(repair => 
    repair.status === 'delivered' && repair.deliveryDate === today
  )
  
  deliveredCount.value = todayDeliveries.length
  todayRevenue.value = todayDeliveries.reduce((sum, repair) => sum + repair.statement, 0)
}

const markAsReadyForDelivery = (repair) => {
  if (confirm('آیا از آماده‌سازی این دستگاه برای تحویل اطمینان دارید؟')) {
    // به‌روزرسانی در آرایه محلی
    const index = repairs.value.findIndex(r => r.id === repair.id)
    if (index !== -1) {
      const updatedRepair = {
        ...repair,
        readyForDelivery: true,
        completionDate: new Date().toLocaleDateString('fa-IR')
      }
      repairs.value[index] = updatedRepair

      // به‌روزرسانی در localStorage
      const allRepairs = JSON.parse(localStorage.getItem('receptions') || '[]')
      const globalIndex = allRepairs.findIndex(r => r.id === repair.id)
      if (globalIndex !== -1) {
        allRepairs[globalIndex] = updatedRepair
        localStorage.setItem('receptions', JSON.stringify(allRepairs))
      }
    }
  }
}

// هدایت به صفحه تأیید کد
const goToVerification = (repair) => {
  // ذخیره اطلاعات تعمیر در localStorage قبل از مسیردهی
  localStorage.setItem('currentDeliveryRepair', JSON.stringify(repair))
  const url = `/admin/verify-delivery-code?id=${repair.id}`
  window.location.href = url
}

// لغو وضعیت آماده تحویل
const cancelReadyForDelivery = (repair) => {
  if (confirm('آیا از لغو وضعیت آماده تحویل این دستگاه اطمینان دارید؟')) {
    // به‌روزرسانی در آرایه محلی
    const index = repairs.value.findIndex(r => r.id === repair.id)
    if (index !== -1) {
      const updatedRepair = {
        ...repair,
        readyForDelivery: false,
        deliveredToCustomer: false,
        deliveryDate: null
      }
      repairs.value[index] = updatedRepair

      // به‌روزرسانی در localStorage
      const allRepairs = JSON.parse(localStorage.getItem('receptions') || '[]')
      const globalIndex = allRepairs.findIndex(r => r.id === repair.id)
      if (globalIndex !== -1) {
        allRepairs[globalIndex] = updatedRepair
        localStorage.setItem('receptions', JSON.stringify(allRepairs))
      }
    }
  }
}

// ارسال به بایگانی
const moveToArchive = (repair) => {
  if (confirm('آیا از ارسال این دستگاه به بایگانی اطمینان دارید؟')) {
    try {
      const archiveItems = JSON.parse(localStorage.getItem('archiveItems') || '[]')
      const today = new Date().toLocaleDateString('fa-IR')
      
      const archiveItem = {
        ...repair,
        archiveDate: today
      }
      
      archiveItems.unshift(archiveItem)
      localStorage.setItem('archiveItems', JSON.stringify(archiveItems))
      
      // حذف از لیست تعمیرات
      const updatedRepairs = repairs.value.filter(r => r.id !== repair.id)
      repairs.value = updatedRepairs
      localStorage.setItem('receptions', JSON.stringify(updatedRepairs))
    } catch (error) {
      console.error('Error moving to archive:', error)
      alert('خطا در ارسال به بایگانی')
    }
  }
}
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
