<template>
  <div class="repairman-page">
    <div class="page-header">
      <button class="btn btn-light" @click="goBack">
        <i class="fas fa-arrow-right me-2"></i>
        بازگشت
      </button>
      <h2>پنل تعمیرکار: {{ repairman.fullName }}</h2>
      <div style="width: 100px"></div>
    </div>

    <div class="stats-section">
      <div class="row">
        <div class="col-md-3">
          <div class="stat-card">
            <h3>تعمیرات در انتظار</h3>
            <p class="stat-number">{{ pendingRepairs.length }}</p>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stat-card">
            <h3>تعمیرات در حال انجام</h3>
            <p class="stat-number">{{ inProgressRepairs.length }}</p>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stat-card">
            <h3>تعمیرات تکمیل شده</h3>
            <p class="stat-number">{{ completedRepairs.length }}</p>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stat-card">
            <h3>مجموع درآمد</h3>
            <p class="stat-number">{{ formatCurrency(totalIncome) }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="repairs-section">
      <div class="section-header">
        <h3>تعمیرات اختصاص داده شده</h3>
        <div class="filters">
          <select class="form-control" v-model="statusFilter">
            <option value="all">همه</option>
            <option value="pending">در انتظار</option>
            <option value="in-progress">در حال انجام</option>
            <option value="completed">تکمیل شده</option>
          </select>
        </div>
      </div>

      <div class="repairs-grid">
        <div v-for="repair in filteredRepairs" :key="repair.id" class="repair-card">
          <div class="card-header">
            <span class="tracking-number">{{ repair.trackingNumber }}</span>
            <span :class="'status-badge ' + repair.status">
              {{ getStatusText(repair.status) }}
            </span>
          </div>
          <div class="card-body">
            <div class="info-item">
              <label>نام مشتری:</label>
              <span>{{ repair.customerName }}</span>
            </div>
            <div class="info-item">
              <label>نوع دستگاه:</label>
              <span>{{ repair.deviceType }}</span>
            </div>
            <div class="info-item">
              <label>مشکل:</label>
              <span>{{ repair.issue }}</span>
            </div>
            <div class="info-item">
              <label>تاریخ ثبت:</label>
              <span>{{ repair.date }}</span>
            </div>
          </div>
          <div class="card-actions">
            <button 
              class="btn btn-primary" 
              v-if="repair.status === 'pending'"
              @click="startRepair(repair.id)"
            >
              شروع تعمیر
            </button>
            <button 
              class="btn btn-success" 
              v-if="repair.status === 'in-progress'"
              @click="continueRepair(repair.id)"
            >
              ادامه تعمیر
            </button>
            <button 
              class="btn btn-warning" 
              v-if="repair.status === 'completed'"
              @click="viewRepairDetails(repair.id)"
            >
              مشاهده جزئیات
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const repairman = ref({})
const repairs = ref([])
const statusFilter = ref('all')

// Load repairman data
onMounted(() => {
  const repairmen = JSON.parse(localStorage.getItem('repairmen') || '[]')
  const foundRepairman = repairmen.find(r => r.id === Number(route.params.id))
  
  if (foundRepairman) {
    repairman.value = foundRepairman
    loadRepairs()
  } else {
    router.push('/admin/admins')
  }
})

// Load repairs assigned to this repairman
const loadRepairs = () => {
  const allRepairs = JSON.parse(localStorage.getItem('receptions') || '[]')
  repairs.value = allRepairs.filter(repair => repair.repairmanId === repairman.value.id)
}

const goBack = () => {
  router.push('/admin/admins')
}

const getStatusText = (status) => {
  const statusMap = {
    'pending': 'در انتظار',
    'in-progress': 'در حال انجام',
    'completed': 'تکمیل شده'
  }
  return statusMap[status] || status
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان'
}

// Filtered repairs based on status
const filteredRepairs = computed(() => {
  if (statusFilter.value === 'all') return repairs.value
  return repairs.value.filter(repair => repair.status === statusFilter.value)
})

// Statistics
const pendingRepairs = computed(() => 
  repairs.value.filter(repair => repair.status === 'pending')
)

const inProgressRepairs = computed(() => 
  repairs.value.filter(repair => repair.status === 'in-progress')
)

const completedRepairs = computed(() => 
  repairs.value.filter(repair => repair.status === 'completed')
)

const totalIncome = computed(() => {
  return completedRepairs.value.reduce((sum, repair) => {
    return sum + (repair.statement || 0)
  }, 0)
})

// Actions
const startRepair = (repairId) => {
  router.push(`/repairman/start_repairs?id=${repairId}`)
}

const continueRepair = (repairId) => {
  router.push(`/repairman/start_repairs?id=${repairId}`)
}

const viewRepairDetails = (repairId) => {
  // Implement view details functionality
 
}
</script>

<style scoped>
.repairman-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.stats-section {
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  text-align: center;
}

.stat-card h3 {
  margin: 0 0 10px 0;
  font-size: 1rem;
  color: #7f8c8d;
}

.stat-number {
  font-size: 2rem;
  font-weight: 500;
  margin: 0;
  color: #2c3e50;
}

.repairs-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.repairs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.repair-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.card-header {
  padding: 15px;
  background: #f8f9fa;
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

.card-body {
  padding: 15px;
}

.info-item {
  margin-bottom: 10px;
}

.info-item label {
  color: #7f8c8d;
  margin-left: 5px;
}

.card-actions {
  padding: 15px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 8px 15px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-success {
  background: #2ecc71;
  color: white;
}

.btn-warning {
  background: #f1c40f;
  color: white;
}

.btn-light {
  background: #f8f9fa;
  color: #2c3e50;
}

.me-2 {
  margin-left: 0.5rem;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }

  .stats-section .row {
    flex-direction: column;
    gap: 10px;
  }

  .stats-section .col-md-3 {
    width: 100%;
  }

  .section-header {
    flex-direction: column;
    gap: 10px;
  }

  .repairs-grid {
    grid-template-columns: 1fr;
  }
}
</style>