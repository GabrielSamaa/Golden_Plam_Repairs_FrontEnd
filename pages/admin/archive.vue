<template>
  <div class="archive-page">

    <!-- لودینگ Overlay برای بارگذاری اولیه -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
      <p class="loading-text">در حال بارگذاری اطلاعات...</p>
    </div>


    <div class="page-header">
      <h2>بایگانی درخواست‌ها</h2>
    </div>

    <div class="filters-section">
      <div class="row">
        <div class="col-md-3">
          <label>جستجو:</label>
          <input type="text" class="form-control" placeholder="شماره پیگیری یا نام مشتری" v-model="archiveSearch">
        </div>
        <!-- <div class="col-md-3">
          <label>وضعیت:</label>
          <select class="form-control" v-model="archiveStatus">
            <option value="all">همه</option>
            <option value="completed">تکمیل شده</option>
            <option value="cancelled">لغو شده</option>
          </select>
        </div> -->
        <div class="col-md-3">
          <label>از تاریخ:</label>
          <PersianDatePicker
            v-model="archiveFromDate"
            placeholder="تاریخ را انتخاب کنید"
          />
        </div>
        <div class="col-md-3">
          <button class="btn btn-primary" @click="applyArchiveFilters">جستجو</button>
        </div>
        <div class="col-md-3">
          <button class="btn btn-secondary" @click="refreshArchive" title="به‌روزرسانی بایگانی">
            <i class="fas fa-sync-alt"></i> به‌روزرسانی
          </button>
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
            <!-- <th>مشکل</th> -->
            <th>تاریخ تحویل</th>
            <!-- <th>مبلغ کل</th> -->
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredArchive" :key="item.id">
            <td>{{ item.trackingNumber }}</td>
            <td>{{ item.date }}</td>
            <td>{{ item.customerName }}</td>
            <td>{{ item.deviceType }}</td>
            <!-- <td>{{ item.issue }}</td> -->
            <td>{{ item.archiveDate }}</td>
            <!-- <td>{{ item.statement.toLocaleString() }} تومان</td> -->
            <td>
              <button class="btn btn-sm btn-outline-primary" @click="viewArchiveItem(item.id)">
                <i class="fas fa-eye"></i>
              </button>
              <button class="btn btn-sm btn-outline-info" @click="viewFinancialDetails(item.id)" title="مشاهده جزئیات مالی">
                <i class="fas fa-dollar-sign"></i>
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

    <!-- مودال جزئیات مالی -->
    <div class="modal" :class="{ show: showFinancialModal }" @click.self="closeFinancialModal">
      <div class="modal-content" v-if="selectedFinancialRecord">
        <div class="modal-header">
          <h3>جزئیات مالی تعمیر</h3>
          <button class="close-btn" @click="closeFinancialModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="detail-section">
            <h4>اطلاعات مشتری</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>شماره پیگیری:</label>
                <span>{{ selectedFinancialRecord.trackingNumber }}</span>
              </div>
              <div class="detail-item">
                <label>نام مشتری:</label>
                <span>{{ selectedFinancialRecord.customerName }}</span>
              </div>
              <div class="detail-item">
                <label>دستگاه:</label>
                <span>{{ selectedFinancialRecord.deviceType }}</span>
              </div>
              <div class="detail-item">
                <label>تاریخ:</label>
                <span>{{ selectedFinancialRecord.date }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>جزئیات هزینه‌ها</h4>
            <div class="parts-list">
              <div class="parts-header">
                <span>نام قطعه</span>
                <span>قیمت</span>
              </div>
              <div v-for="part in selectedFinancialRecord.parts" :key="part.name" class="part-item">
                <span>{{ part.name }}</span>
                <span>{{ formatCurrency(part.price) }}</span>
              </div>
              <div class="parts-summary">
                <div class="summary-item">
                  <label>مبلغ بیانه:</label>
                  <span>{{ formatCurrency(selectedFinancialRecord.initialStatement) }}</span>
                </div>
                <div class="summary-item">
                  <label>دستمزد تعمیر:</label>
                  <span>{{ formatCurrency(selectedFinancialRecord.laborCost) }}</span>
                </div>
                <div class="summary-item expense">
                  <label>هزینه قطعات:</label>
                  <span>{{ formatCurrency(selectedFinancialRecord.totalPartsCost) }}</span>
                </div>
                <div class="summary-item total">
                  <label>مبلغ قابل پرداخت:</label>
                  <span class="final-amount">{{ formatCurrency(selectedFinancialRecord.totalCost) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PersianDatePicker from '~/components/PersianDatePicker.vue'
import { useNuxtApp } from '#app'

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const archiveSearch = ref('')
const archiveStatus = ref('all')
const archiveFromDate = ref('')
const showArchiveModal = ref(false)
const showFinancialModal = ref(false)
const isLoading = ref(false);
const selectedArchiveItem = ref(null)
const selectedFinancialRecord = ref(null)

const archiveItems = ref([])

// Load archive items from localStorage
onMounted(() => {
  loadArchiveItems()
})

const loadArchiveItems = async () => {
  try {
    isLoading.value = true
    const { $api } = useNuxtApp();
    const response = await $api.get('/device/fixed-devices');
    // فیلتر کردن فقط دستگاه‌های paid شده (که باید در بایگانی باشند)
    archiveItems.value = response.data.filter(item => item.repair_status === 'paid')
      .map(item => ({
        id: item.id,
        trackingNumber: item.verification_code,
        date: new Date(item.created_at).toLocaleDateString('fa-IR'),
        customerName: item.customer?.name || 'نامشخص',
        deviceType: item.device_name,
        issue: item.description,
        status: 'completed',
        statement: item.total_cost || 0,
        parts: item.parts || [],
        archiveDate: new Date(item.updated_at).toLocaleDateString('fa-IR')
      }));
  } catch (error) {
    
    archiveItems.value = [];
  }
  finally {
    isLoading.value = false
  }
};

const filteredArchive = computed(() => {
  let result = archiveItems.value
  if (archiveStatus.value !== 'all') {
    result = result.filter(r => r.status === archiveStatus.value)
  }
  if (archiveSearch.value) {
    const search = archiveSearch.value.toLowerCase()
    result = result.filter(r => 
      r.trackingNumber.toLowerCase().includes(search) || 
      r.customerName.toLowerCase().includes(search) ||
      r.deviceType.toLowerCase().includes(search) ||
      r.issue.toLowerCase().includes(search) ||
      r.date.toLowerCase().includes(search) ||
      (r.parts && r.parts.some(part => part.name.toLowerCase().includes(search)))
    )
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

const formatCurrency = (amount) => new Intl.NumberFormat('fa-IR').format(Number(amount || 0)) + ' تومان'

const applyArchiveFilters = () => {
  // در واقعیت اینجا درخواست به سرور ارسال می‌شود

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

const viewFinancialDetails = async (id) => {
  try {
    const { $api } = useNuxtApp()
    const response = await $api.get(`/device/repair/${id}`)
    const device = response.data
    
    // پارس کردن repair_details
    let partsArr = []
    let totalPartsCost = 0
    if (device.repair_details) {
      try {
        const parsed = Array.isArray(device.repair_details) 
          ? device.repair_details 
          : JSON.parse(device.repair_details)
        
        partsArr = parsed.map((part) => ({
          name: part.part_name || part.name || '',
          price: Number(part.part_price || part.price || 0) || 0
        }))
        totalPartsCost = partsArr.reduce((sum, part) => sum + part.price, 0)
      } catch (_) {}
    }
    
    // محاسبه مبالغ
    const laborCost = Number(device.repair_price) || 0
    const initialStatement = Number(device.prepaid) || 0
    const totalCost =  laborCost + totalPartsCost - initialStatement
    
    selectedFinancialRecord.value = {
      id: String(device.id),
      trackingNumber: device.verification_code || '',
      date: device.delivered_at || device.created_at || '',
      customerName: device.customer?.name || '',
      deviceType: device.device_name || '',
      totalPartsCost,
      laborCost,
      initialStatement,
      totalCost,
      parts: partsArr
    }
    
    showFinancialModal.value = true
  } catch (error) {
   
  }
}

const closeFinancialModal = () => {
  showFinancialModal.value = false
  selectedFinancialRecord.value = null
}

const deleteArchiveItem = (id) => {
  if (confirm('آیا از حذف این مورد از بایگانی اطمینان دارید؟')) {
    try {
      // Remove from archive
      archiveItems.value = archiveItems.value.filter(item => item.id !== id)
      localStorage.setItem('archiveItems', JSON.stringify(archiveItems.value))
      
    } catch (error) {
     
    }
  }
}

const refreshArchive = async () => {
  await loadArchiveItems()
}

// تابع برای به‌روزرسانی خودکار بایگانی
const refreshArchiveIfNeeded = () => {
  // هر 30 ثانیه یکبار بایگانی را به‌روزرسانی کن
  setInterval(async () => {
    await loadArchiveItems()
  }, 30000)
}

onMounted(() => {
  loadArchiveItems()
  refreshArchiveIfNeeded()
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

/* استایل‌های مودال مالی */
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

.parts-header {
  display: grid;
  grid-template-columns: 2fr 1fr;
  padding: 12px;
  background: #e9ecef;
  font-weight: 500;
}

.parts-summary {
  padding: 15px;
  background: #fff;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.summary-item.total {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 2px solid #dee2e6;
  font-weight: 500;
  font-size: 1.1rem;
}

.summary-item.expense {
  color: #e74c3c;
}

.summary-item.expense span {
  color: #e74c3c;
}

.final-amount {
  color: #2ecc71;
  font-weight: bold;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
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

.date-input {
  position: relative;
  width: 100%;
}

.date-input :deep(.persian-date-picker) {
  width: 100%;
}

.date-input :deep(.form-control) {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  transition: all 0.3s;
}

.date-input :deep(.form-control:focus) {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}
</style>
