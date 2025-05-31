<template>
  <div class="archive-page">
    <div class="page-header">
      <h2>بایگانی درخواست‌ها</h2>
    </div>

    <div class="filters-section">
      <div class="row">
        <div class="col-md-3">
          <label>جستجو:</label>
          <input type="text" class="form-control" placeholder="شماره پیگیری یا نام مشتری" v-model="archiveSearch">
        </div>
        <div class="col-md-3">
          <label>وضعیت:</label>
          <select class="form-control" v-model="archiveStatus">
            <option value="all">همه</option>
            <option value="completed">تکمیل شده</option>
            <option value="cancelled">لغو شده</option>
          </select>
        </div>
        <div class="col-md-3">
          <label>از تاریخ:</label>
          <input type="date" class="form-control" v-model="archiveFromDate">
        </div>
        <div class="col-md-3">
          <button class="btn btn-primary" @click="applyArchiveFilters">جستجو</button>
        </div>
      </div>
    </div>

    <div class="archive-table">
      <table class="table">
        <thead>
          <tr>
            <th>شماره پیگیری</th>
            <th>تاریخ ثبت</th>
            <th>نام مشتری</th>
            <th>نوع دستگاه</th>
            <th>مشکل</th>
            <th>وضعیت</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredArchive" :key="item.id">
            <td>{{ item.trackingNumber }}</td>
            <td>{{ item.date }}</td>
            <td>{{ item.customerName }}</td>
            <td>{{ item.deviceType }}</td>
            <td>{{ item.issue }}</td>
            <td>
              <span :class="'status-' + item.status">{{ getStatusText(item.status) }}</span>
            </td>
            <td>
              <button class="btn btn-sm btn-outline-primary" @click="viewArchiveItem(item.id)">
                <i class="fas fa-eye"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" @click="deleteArchiveItem(item.id)">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal for viewing archive item -->
    <div class="modal" :class="{ show: showArchiveModal }">
      <div class="modal-content">
        <div class="modal-header">
          <h5>جزئیات درخواست</h5>
          <button @click="showArchiveModal = false">&times;</button>
        </div>
        <div class="modal-body" v-if="selectedArchiveItem">
          <div class="archive-details">
            <div class="detail-item">
              <label>شماره پیگیری:</label>
              <span>{{ selectedArchiveItem.trackingNumber }}</span>
            </div>
            <div class="detail-item">
              <label>تاریخ ثبت:</label>
              <span>{{ selectedArchiveItem.date }}</span>
            </div>
            <div class="detail-item">
              <label>نام مشتری:</label>
              <span>{{ selectedArchiveItem.customerName }}</span>
            </div>
            <div class="detail-item">
              <label>نوع دستگاه:</label>
              <span>{{ selectedArchiveItem.deviceType }}</span>
            </div>
            <div class="detail-item">
              <label>مشکل:</label>
              <span>{{ selectedArchiveItem.issue }}</span>
            </div>
            <div class="detail-item">
              <label>وضعیت:</label>
              <span :class="'status-' + selectedArchiveItem.status">
                {{ getStatusText(selectedArchiveItem.status) }}
              </span>
            </div>
            <div class="detail-item" v-if="selectedArchiveItem.parts && selectedArchiveItem.parts.length > 0">
              <label>قطعات استفاده شده:</label>
              <div class="parts-list">
                <div v-for="(part, index) in selectedArchiveItem.parts" :key="index" class="part-item">
                  <span>{{ part.name }}</span>
                  <span>{{ part.price.toLocaleString() }} تومان</span>
                </div>
              </div>
            </div>
            <div class="detail-item" v-if="selectedArchiveItem.statement">
              <label>مبلغ کل:</label>
              <span>{{ selectedArchiveItem.statement.toLocaleString() }} تومان</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

definePageMeta({
  layout: 'admin'
})

const archiveSearch = ref('')
const archiveStatus = ref('all')
const archiveFromDate = ref('')
const showArchiveModal = ref(false)
const selectedArchiveItem = ref(null)

const archiveItems = ref([])

// Load archive items from localStorage
onMounted(() => {
  loadArchiveItems()
})

const loadArchiveItems = () => {
  try {
    const savedArchiveItems = JSON.parse(localStorage.getItem('archiveItems') || '[]')
    console.log('Loaded archive items:', savedArchiveItems) // Debug log
    archiveItems.value = savedArchiveItems
  } catch (error) {
    console.error('Error loading archive items:', error)
    archiveItems.value = []
  }
}

const filteredArchive = computed(() => {
  let result = archiveItems.value
  if (archiveStatus.value !== 'all') {
    result = result.filter(r => r.status === archiveStatus.value)
  }
  if (archiveSearch.value) {
    const search = archiveSearch.value.toLowerCase()
    result = result.filter(r => 
      r.trackingNumber.toLowerCase().includes(search) || 
      r.customerName.toLowerCase().includes(search))
  }
  return result
})

const getStatusText = (status) => {
  const statusMap = {
    'completed': 'تکمیل شده',
    'cancelled': 'لغو شده'
  }
  return statusMap[status] || status
}

const applyArchiveFilters = () => {
  // در واقعیت اینجا درخواست به سرور ارسال می‌شود
  console.log('فیلترهای بایگانی اعمال شد:', {
    search: archiveSearch.value,
    status: archiveStatus.value,
    fromDate: archiveFromDate.value
  })
}

const viewArchiveItem = (id) => {
  const item = archiveItems.value.find(item => item.id === id)
  if (item) {
    selectedArchiveItem.value = {
      ...item,
      archiveDate: item.archiveDate || item.date
    }
    showArchiveModal.value = true
  }
}

const deleteArchiveItem = (id) => {
  if (confirm('آیا از حذف این مورد از بایگانی اطمینان دارید؟')) {
    try {
      // Remove from archive
      archiveItems.value = archiveItems.value.filter(item => item.id !== id)
      localStorage.setItem('archiveItems', JSON.stringify(archiveItems.value))
      console.log('Deleted archive item:', id) // Debug log
    } catch (error) {
      console.error('Error deleting archive item:', error)
    }
  }
}

const refreshArchive = () => {
  loadArchiveItems()
}
</script>

<style scoped>
.archive-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.filters-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.archive-table {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
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
}

.status-completed { color: #2ecc71; }
.status-cancelled { color: #e74c3c; }

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

.btn-primary:hover {
  background: #2980b9;
}

.btn-outline-primary {
  background: transparent;
  border: 1px solid #3498db;
  color: #3498db;
}

.btn-outline-primary:hover {
  background: #3498db;
  color: white;
}

.btn-outline-danger {
  background: transparent;
  border: 1px solid #e74c3c;
  color: #e74c3c;
}

.btn-outline-danger:hover {
  background: #e74c3c;
  color: white;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 0.8rem;
}

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
  width: 500px;
  max-width: 95%;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h5 {
  margin: 0;
}

.modal-header button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
}

.modal-body {
  padding: 20px;
}

.archive-details {
  display: grid;
  gap: 15px;
}

.detail-item {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 10px;
  align-items: center;
}

.detail-item label {
  font-weight: 500;
  color: #7f8c8d;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  transition: all 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.parts-list {
  margin-top: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 10px;
}

.part-item {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}

.part-item:last-child {
  border-bottom: none;
}

@media (max-width: 768px) {
  .page-header {
    text-align: center;
  }

  .filters-section .row {
    flex-direction: column;
    gap: 10px;
  }

  .filters-section .col-md-3 {
    width: 100%;
  }

  .archive-table {
    padding: 10px;
  }

  .table th,
  .table td {
    padding: 8px;
  }

  .btn-sm {
    padding: 4px 8px;
  }

  .detail-item {
    grid-template-columns: 1fr;
    gap: 5px;
  }
}
</style>
