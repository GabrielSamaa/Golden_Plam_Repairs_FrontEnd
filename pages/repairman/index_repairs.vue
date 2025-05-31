<template>
  <div class="repairs-page">
    <div class="page-header">
      <h2>لیست تعمیرات</h2>
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
          <span class="tracking-number">{{ repair.trackingNumber }}</span>
          <span :class="['status-badge', repair.status]">{{ getStatusText(repair.status) }}</span>
        </div>
        <div class="card-body">
          <div class="info-row">
            <i class="fas fa-user"></i>
            <span>{{ repair.customerName }}</span>
          </div>
          <div class="info-row">
            <i class="fas fa-mobile-alt"></i>
            <span>{{ repair.deviceType }}</span>
          </div>
          <div class="info-row">
            <i class="fas fa-tag"></i>
            <span>{{ repair.category }}</span>
          </div>
          <div class="info-row">
            <i class="fas fa-money-bill-wave"></i>
            <span>{{ repair.statement.toLocaleString() }} تومان</span>
          </div>
        </div>
        <div class="card-footer">
          <span class="date">{{ repair.date }}</span>
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

          <div class="detail-section">
            <h4>توضیحات</h4>
            <p class="description">{{ selectedRepair.issue }}</p>
          </div>

          <div class="modal-actions">
            <button class="btn btn-primary" @click="startRepair" v-if="selectedRepair.status === 'pending'">
              <i class="fas fa-tools"></i>
              شروع تعمیر
            </button>
            <button class="btn btn-info" @click="continueRepair" v-if="selectedRepair.status === 'in-progress'">
              <i class="fas fa-wrench"></i>
              ادامه تعمیر
            </button>
            <button class="btn btn-success" @click="completeRepair" v-if="selectedRepair.status === 'in-progress'">
              <i class="fas fa-check"></i>
              تکمیل تعمیر
            </button>
            <button class="btn btn-warning" @click="revertToInProgress" v-if="selectedRepair.status === 'completed'">
              <i class="fas fa-undo"></i>
              بازگشت به حالت در حال انجام
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { navigateTo, useRouter } from 'nuxt/app'

const repairs = ref([])
const searchQuery = ref('')
const statusFilter = ref('all')
const showModal = ref(false)
const selectedRepair = ref(null)
const currentRepairman = ref(null)
const router = useRouter()

// Load repairs from localStorage
onMounted(() => {
  // Get current repairman from localStorage
  const repairmen = JSON.parse(localStorage.getItem('repairmen') || '[]')
  const currentRepairmanId = localStorage.getItem('currentRepairmanId')
  
  if (currentRepairmanId) {
    currentRepairman.value = repairmen.find(r => r.id === Number(currentRepairmanId))
    
    if (currentRepairman.value) {
      // Load repairs and filter by current repairman
      const savedRepairs = JSON.parse(localStorage.getItem('receptions') || '[]')
      repairs.value = savedRepairs.filter(repair => repair.repairmanId === currentRepairman.value.id)
    } else {
      // If repairman not found, redirect to login
      router.push('/login')
    }
  } else {
    // If no repairman is logged in, redirect to login
    router.push('/login')
  }
})

const filteredRepairs = computed(() => {
  return repairs.value.filter(repair => {
    const matchesSearch = 
      repair.customerName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      repair.trackingNumber.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      repair.deviceType.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesStatus = statusFilter.value === 'all' || repair.status === statusFilter.value
    
    return matchesSearch && matchesStatus
  })
})

const getStatusText = (status) => {
  const statusMap = {
    'pending': 'در انتظار بررسی',
    'in-progress': 'در حال انجام',
    'completed': 'تکمیل شده'
  }
  return statusMap[status] || status
}

const openRepairDetails = (repair) => {
  selectedRepair.value = repair
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
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

const startRepair = () => {
  if (selectedRepair.value) {
    selectedRepair.value.status = 'in-progress'
    // Update in localStorage
    const index = repairs.value.findIndex(r => r.id === selectedRepair.value.id)
    if (index !== -1) {
      repairs.value[index] = selectedRepair.value
      localStorage.setItem('receptions', JSON.stringify(repairs.value))
    }
    // Navigate to start_repairs page
    navigateTo(`/repairman/start_repairs?id=${selectedRepair.value.id}`)
  }
}

const continueRepair = () => {
  if (selectedRepair.value) {
    // Navigate to start_repairs page with the repair ID
    navigateTo(`/repairman/start_repairs?id=${selectedRepair.value.id}`)
  }
}

const completeRepair = () => {
  if (selectedRepair.value) {
    // Check if parts are saved
    const savedParts = localStorage.getItem(`repair_parts_${selectedRepair.value.id}`)
    if (!savedParts) {
      alert('لطفاً ابتدا قطعات تعمیر را ثبت کنید')
      return
    }

    // Update status to completed
    selectedRepair.value.status = 'completed'
    const index = repairs.value.findIndex(r => r.id === selectedRepair.value.id)
    if (index !== -1) {
      repairs.value[index] = selectedRepair.value
      localStorage.setItem('receptions', JSON.stringify(repairs.value))
    }
    closeModal()
  }
}

const revertToInProgress = () => {
  if (selectedRepair.value) {
    selectedRepair.value.status = 'in-progress'
    const index = repairs.value.findIndex(r => r.id === selectedRepair.value.id)
    if (index !== -1) {
      repairs.value[index] = selectedRepair.value
      localStorage.setItem('receptions', JSON.stringify(repairs.value))
    }
    closeModal()
  }
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

