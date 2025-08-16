<template>
  <div class="financial-page">
    <div class="page-header">
      <h2>مدیریت مالی</h2>
    </div>

    <div class="filters-section">
      <div class="row">
        <div class="col-md-3">
          <label>از تاریخ:</label>
          <PersianDatePicker
            v-model="fromDate"
            placeholder="تاریخ را انتخاب کنید"
          />
        </div>
        <div class="col-md-3">
          <label>تا تاریخ:</label>
          <PersianDatePicker
            v-model="toDate"
            placeholder="تاریخ را انتخاب کنید"
          />
        </div>
        <div class="col-md-3">
          <label>نوع تراکنش:</label>
          <select class="form-control" v-model="transactionType">
            <option value="all">همه</option>
            <option value="repair">تعمیرات</option>
            <option value="income">درآمد</option>
            <option value="expense">هزینه</option>
          </select>
        </div>
        <div class="col-md-3">
          <label>جستجو:</label>
          <input 
            type="text" 
            class="form-control" 
            v-model="searchQuery" 
            placeholder="شماره پیگیری، مشتری یا دستگاه..."
          >
        </div>
        <div class="col-md-3">
          <button class="btn btn-primary" @click="applyFilters">اعمال فیلتر</button>
        </div>
      </div>
    </div>

    <div class="summary-section">
      <div class="row">
        <div class="col-md-3">
          <div class="summary-card income">
            <h3>درآمد امروز</h3>
            <p class="amount">{{ formatCurrency(financialStats.todayIncome) }}</p>
          </div>
        </div>
        <div class="col-md-3">
          <div class="summary-card income">
            <h3>درآمد این ماه</h3>
            <p class="amount">{{ formatCurrency(financialStats.monthIncome) }}</p>
          </div>
        </div>
        <div class="col-md-3">
          <div class="summary-card income">
            <h3>درآمد سالانه</h3>
            <p class="amount">{{ formatCurrency(financialStats.yearIncome) }}</p>
          </div>
        </div>
        <div class="col-md-3">
          <div class="summary-card labor">
            <h3>دستمزد تعمیرکاران</h3>
            <p class="amount">{{ formatCurrency(financialStats.technicianIncome) }}</p>
          </div>
        </div>
      </div>
      <div class="row mt-4">
        <div class="col-md-4">
          <div class="summary-card expense">
            <h3>هزینه قطعات</h3>
            <p class="amount">{{ formatCurrency(totalPartsCost) }}</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="summary-card profit">
            <h3>سود خالص</h3>
            <p class="amount">{{ formatCurrency(netProfit) }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="transactions-section">
      <h3>تراکنش‌ها</h3>
      <div class="transactions-table">
        <table class="table">
          <thead>
            <tr>
              <th>شماره پیگیری</th>
              <th>تاریخ</th>
              <th>مشتری</th>
              <th>دستگاه</th>
              <th>هزینه قطعات</th>
              <th>مبلغ قابل پرداخت</th>
              <th>بیانه</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in filteredRecords" :key="record.id">
              <td>{{ record.trackingNumber }}</td>
              <td>{{ record.date }}</td>
              <td>{{ record.customerName }}</td>
              <td>{{ record.deviceType }}</td>
              <td>{{ formatCurrency(record.totalPartsCost) }}</td>
              <td>{{ formatCurrency(record.laborCost) }}</td>
              <td>{{ formatCurrency(record.totalCost) }}</td>
              <td>
                <span :class="'status-' + record.status">
                  {{ getStatusText(record.status) }}
                </span>
              </td>
              <td>
                <button 
                  class="btn btn-sm btn-info" 
                  @click="viewDetails(record)"
                  title="مشاهده جزئیات"
                >
                  <i class="fas fa-eye"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal for viewing details -->
    <div class="modal" :class="{ show: showDetailsModal }" @click.self="closeDetailsModal">
      <div class="modal-content" v-if="selectedRecord">
        <div class="modal-header">
          <h3>جزئیات مالی تعمیر</h3>
          <button class="close-btn" @click="closeDetailsModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="detail-section">
            <h4>اطلاعات مشتری</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>شماره پیگیری:</label>
                <span>{{ selectedRecord.trackingNumber }}</span>
              </div>
              <div class="detail-item">
                <label>نام مشتری:</label>
                <span>{{ selectedRecord.customerName }}</span>
              </div>
              <div class="detail-item">
                <label>دستگاه:</label>
                <span>{{ selectedRecord.deviceType }}</span>
              </div>
              <div class="detail-item">
                <label>تاریخ:</label>
                <span>{{ selectedRecord.date }}</span>
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
              <div v-for="part in selectedRecord.parts" :key="part.name" class="part-item">
                <span>{{ part.name }}</span>
                <span>{{ formatCurrency(part.price) }}</span>
              </div>
              <div class="parts-summary">
                <div class="summary-item">
                  <label>مبلغ بیانه:</label>
                  <span>{{ formatCurrency(selectedRecord.initialStatement) }}</span>
                </div>
                <div class="summary-item">
                  <label>دستمزد تعمیر:</label>
                  <div class="labor-cost-input">
                    <input 
                      type="number" 
                      class="form-control" 
                      v-model="selectedRecord.laborCost"
                      @input="updateLaborCost"
                      placeholder="دستمزد تعمیر را وارد کنید"
                    >
                    <button 
                      class="btn btn-sm btn-success" 
                      @click="saveLaborCost"
                      :disabled="!isLaborCostChanged"
                    >
                      <i class="fas fa-save"></i>
                      ذخیره
                    </button>
                  </div>
                </div>
                <div class="summary-item expense">
                  <label>هزینه قطعات:</label>
                  <span>{{ formatCurrency(selectedRecord.totalPartsCost) }}</span>
                </div>
                <div class="summary-item total">
                  <label>مبلغ قابل پرداخت:</label>
                  <span class="final-amount">{{ formatCurrency(finalPayment) }}</span>
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

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const fromDate = ref('')
const toDate = ref('')
const transactionType = ref('all')
const showDetailsModal = ref(false)
const selectedRecord = ref(null)
const searchQuery = ref('')

const financialRecords = ref([])

const isLaborCostChanged = ref(false)
const originalLaborCost = ref('')

// Load financial records
onMounted(() => {
  const records = JSON.parse(localStorage.getItem('financial_records') || '[]')
  financialRecords.value = records.sort((a, b) => new Date(b.date) - new Date(a.date))
})

const filteredRecords = computed(() => {
  let result = financialRecords.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(record => 
      record.trackingNumber.toLowerCase().includes(query) ||
      record.customerName.toLowerCase().includes(query) ||
      record.deviceType.toLowerCase().includes(query) ||
      record.description.toLowerCase().includes(query) ||
      record.id.toLowerCase().includes(query)
    )
  }

  // Filter by transaction type
  if (transactionType.value !== 'all') {
    result = result.filter(t => t.type === transactionType.value)
  }

  // Filter by date range
  if (fromDate.value) {
    result = result.filter(t => new Date(t.date) >= new Date(fromDate.value))
  }
  if (toDate.value) {
    result = result.filter(t => new Date(t.date) <= new Date(toDate.value))
  }

  return result
})

// اضافه کردن reactive object برای نگهداری آمار مالی
const financialStats = ref({
  todayIncome: 0,
  monthIncome: 0,
  yearIncome: 0,
  technicianIncome: 0
});

// Load financial data
const loadFinancialData = async () => {
  try {
    const { $api } = useNuxtApp();
    const [
      todayIncome,
      monthIncome,
      yearIncome,
      technicianIncome
    ] = await Promise.all([
      $api.get('/financial/income-today'),
      $api.get('/financial/income-this-month'),
      $api.get('/financial/income-this-year'),
      $api.get('/financial/technician-income')
    ]);

    financialStats.value = {
      todayIncome: todayIncome.data.income || 0,
      monthIncome: monthIncome.data.income || 0,
      yearIncome: yearIncome.data.income || 0,
      technicianIncome: technicianIncome.data.income || 0
    };

  } catch (error) {
    console.error('Error loading financial data:', error);
    alert('خطا در بارگذاری اطلاعات مالی');
  }
};

// بروزرسانی computed properties
const totalIncome = computed(() => financialStats.value.monthIncome);
const totalPartsCost = computed(() => {
  return financialRecords.value.reduce((sum, r) => sum + r.totalPartsCost, 0);
});
const totalLaborCost = computed(() => financialStats.value.technicianIncome);
const netProfit = computed(() => {
  return totalIncome.value - totalPartsCost.value - totalLaborCost.value;
});

// اضافه کردن فراخوانی تابع در onMounted
onMounted(() => {
  loadFinancialData();
});

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان'
}

const getStatusText = (status) => {
  const statusMap = {
    'pending': 'در انتظار',
    'completed': 'تکمیل شده',
    'cancelled': 'لغو شده'
  }
  return statusMap[status] || status
}

const viewDetails = (record) => {
  selectedRecord.value = { 
    ...record,
    laborCost: '',
    initialStatement: record.totalCost || 0
  }
  originalLaborCost.value = ''
  isLaborCostChanged.value = false
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedRecord.value = null
}

const updateLaborCost = () => {
  if (selectedRecord.value) {
    const currentLaborCost = selectedRecord.value.laborCost === '' ? 0 : Number(selectedRecord.value.laborCost)
    isLaborCostChanged.value = currentLaborCost !== (originalLaborCost.value === '' ? 0 : Number(originalLaborCost.value))
  }
}

const saveLaborCost = () => {
  if (!selectedRecord.value) return

  const laborCost = selectedRecord.value.laborCost === '' ? 0 : Number(selectedRecord.value.laborCost)
  const updatedRecord = {
    ...selectedRecord.value,
    laborCost,
    totalCost: selectedRecord.value.initialStatement + laborCost
  }

  const index = financialRecords.value.findIndex(r => r.id === updatedRecord.id)
  if (index !== -1) {
    financialRecords.value[index] = updatedRecord
  }

  const allRecords = JSON.parse(localStorage.getItem('financial_records') || '[]')
  const globalIndex = allRecords.findIndex(r => r.id === updatedRecord.id)
  if (globalIndex !== -1) {
    allRecords[globalIndex] = updatedRecord
    localStorage.setItem('financial_records', JSON.stringify(allRecords))
  }

  const repairs = JSON.parse(localStorage.getItem('receptions') || '[]')
  const repairIndex = repairs.findIndex(r => r.id === updatedRecord.repairId)
  if (repairIndex !== -1) {
    const repair = repairs[repairIndex]
    repair.financialStatus = {
      ...repair.financialStatus,
      initialStatement: updatedRecord.initialStatement,
      laborCost: laborCost,
      totalPartsCost: updatedRecord.totalPartsCost,
      totalCost: updatedRecord.totalCost,
      lastUpdate: new Date().toLocaleString('fa-IR')
    }
    localStorage.setItem('receptions', JSON.stringify(repairs))
  }

  isLaborCostChanged.value = false
  originalLaborCost.value = selectedRecord.value.laborCost
  alert('اطلاعات مالی با موفقیت به‌روز شد')
}

const finalPayment = computed(() => {
  if (!selectedRecord.value) return 0
  const initial = selectedRecord.value.initialStatement || 0
  const partsCost = selectedRecord.value.totalPartsCost || 0
  const laborCost = selectedRecord.value.laborCost === '' ? 0 : Number(selectedRecord.value.laborCost)
  return initial + -laborCost - partsCost
})

const applyFilters = () => {
  // در واقعیت اینجا درخواست به سرور ارسال می‌شود
  console.log('فیلترهای مالی اعمال شد:', {
    fromDate: fromDate.value,
    toDate: toDate.value,
    type: transactionType.value
  })
}
</script>

<style scoped>
.financial-page {
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

.summary-section {
  margin-bottom: 20px;
}

.summary-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  text-align: center;
}

.summary-card h3 {
  margin: 0 0 10px 0;
  font-size: 1.1rem;
  color: #7f8c8d;
}

.summary-card .amount {
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0;
}

.summary-card.income .amount {
  color: #2ecc71;
}

.summary-card.expense .amount {
  color: #e74c3c;
}

.summary-card.profit .amount {
  color: #3498db;
}

.transactions-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.transactions-section h3 {
  margin: 0 0 20px 0;
  font-size: 1.2rem;
}

.transactions-table {
  overflow-x: auto;
  margin-top: 20px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
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

.table tr:hover {
  background: #f8f9fa;
}

.type-income {
  color: #2ecc71;
  font-weight: 500;
}

.type-expense {
  color: #e74c3c;
  font-weight: 500;
}

.status-completed {
  color: #2ecc71;
  font-weight: 500;
}

.status-pending {
  color: #f39c12;
  font-weight: 500;
}

.status-failed {
  color: #e74c3c;
  font-weight: 500;
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

.btn-primary:hover {
  background: #2980b9;
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

  .summary-section .row {
    flex-direction: column;
    gap: 10px;
  }

  .summary-section .col-md-4 {
    width: 100%;
  }

  .transactions-section {
    padding: 10px;
  }

  .table th,
  .table td {
    padding: 8px;
  }
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

.parts-list {
  background: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
}

.parts-header {
  display: grid;
  grid-template-columns: 2fr 1fr;
  padding: 12px;
  background: #e9ecef;
  font-weight: 500;
}

.part-item {
  display: grid;
  grid-template-columns: 2fr 1fr;
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
}

.parts-summary {
  padding: 15px;
  background: #fff;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.summary-item.total {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 2px solid #dee2e6;
  font-weight: 500;
  font-size: 1.1rem;
}

.status-pending { color: #f39c12; }
.status-completed { color: #2ecc71; }
.status-cancelled { color: #e74c3c; }

.summary-card.labor .amount {
  color: #9b59b6;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 10px;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .parts-header,
  .part-item {
    grid-template-columns: 1fr;
    gap: 5px;
  }
}

.labor-cost-input {
  display: flex;
  gap: 10px;
  align-items: center;
}

.labor-cost-input input {
  width: 200px;
  text-align: left;
  direction: ltr;
  font-family: monospace;
}

.labor-cost-input input::placeholder {
  color: #95a5a6;
  font-style: italic;
}

.labor-cost-input .btn {
  white-space: nowrap;
}

.labor-cost-input .btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
