<template>
  <div class="financial-page">
    <div class="page-header">
      <h2>مدیریت مالی</h2>
    </div>

    <div class="filters-section">
      <div class="row">
        <div class="col-md-3">
          <label>از تاریخ:</label>
          <input type="date" class="form-control" v-model="fromDate">
        </div>
        <div class="col-md-3">
          <label>تا تاریخ:</label>
          <input type="date" class="form-control" v-model="toDate">
        </div>
        <div class="col-md-3">
          <label>نوع تراکنش:</label>
          <select class="form-control" v-model="transactionType">
            <option value="all">همه</option>
            <option value="income">درآمد</option>
            <option value="expense">هزینه</option>
          </select>
        </div>
        <div class="col-md-3">
          <button class="btn btn-primary" @click="applyFilters">اعمال فیلتر</button>
        </div>
      </div>
    </div>

    <div class="summary-section">
      <div class="row">
        <div class="col-md-4">
          <div class="summary-card income">
            <h3>کل درآمد</h3>
            <p class="amount">{{ formatCurrency(totalIncome) }}</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="summary-card expense">
            <h3>کل هزینه</h3>
            <p class="amount">{{ formatCurrency(totalExpense) }}</p>
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
              <th>توضیحات</th>
              <th>مبلغ</th>
              <th>نوع</th>
              <th>وضعیت</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="transaction in filteredTransactions" :key="transaction.id">
              <td>{{ transaction.trackingNumber }}</td>
              <td>{{ transaction.date }}</td>
              <td>{{ transaction.description }}</td>
              <td>{{ formatCurrency(transaction.amount) }}</td>
              <td>
                <span :class="'type-' + transaction.type">
                  {{ getTransactionTypeText(transaction.type) }}
                </span>
              </td>
              <td>
                <span :class="'status-' + transaction.status">
                  {{ getTransactionStatusText(transaction.status) }}
                </span>
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
  layout: 'admin'
})

const fromDate = ref('')
const toDate = ref('')
const transactionType = ref('all')

const transactions = ref([])

// Load transactions from repairs data
onMounted(() => {
  const repairs = JSON.parse(localStorage.getItem('receptions') || '[]')
  const allTransactions = []

  repairs.forEach(repair => {
    // Only process non-completed repairs
    if (repair.status !== 'completed') {
      // Add income from repair statement
      if (repair.statement) {
        allTransactions.push({
          id: `INC-${repair.id}`,
          date: repair.date,
          description: `درآمد از تعمیر ${repair.deviceType} - ${repair.customerName}`,
          amount: repair.statement,
          type: 'income',
          status: repair.status,
          repairId: repair.id,
          trackingNumber: repair.trackingNumber
        })
      }

      // Add expenses from repair parts
      if (repair.parts && repair.parts.length > 0) {
        repair.parts.forEach((part, index) => {
          allTransactions.push({
            id: `EXP-${repair.id}-${index}`,
            date: repair.date,
            description: `هزینه قطعه ${part.name} برای تعمیر ${repair.deviceType}`,
            amount: part.price,
            type: 'expense',
            status: repair.status,
            repairId: repair.id,
            trackingNumber: repair.trackingNumber
          })
        })
      }
    }
  })

  // Sort transactions by date (newest first)
  transactions.value = allTransactions.sort((a, b) => {
    return new Date(b.date) - new Date(a.date)
  })
})

const filteredTransactions = computed(() => {
  let result = transactions.value

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

const totalIncome = computed(() => {
  return transactions.value
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
})

const totalExpense = computed(() => {
  return transactions.value
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
})

const netProfit = computed(() => {
  return totalIncome.value - totalExpense.value
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان'
}

const getTransactionTypeText = (type) => {
  const typeMap = {
    'income': 'درآمد',
    'expense': 'هزینه'
  }
  return typeMap[type] || type
}

const getTransactionStatusText = (status) => {
  const statusMap = {
    'completed': 'تکمیل شده',
    'pending': 'در انتظار',
    'failed': 'ناموفق'
  }
  return statusMap[status] || status
}

const applyFilters = () => {
  // در واقعیت اینجا درخواست به سرور ارسال می‌شود
  console.log('فیلترهای مالی اعمال شد:', {
    fromDate: fromDate.value,
    toDate: toDate.value,
    type: transactionType.value
  })
}

// Add function to move completed repairs to archive
const moveToArchive = (repairId) => {
  const repairs = JSON.parse(localStorage.getItem('receptions') || '[]')
  const repairIndex = repairs.findIndex(r => r.id === repairId)
  
  if (repairIndex !== -1) {
    const repair = repairs[repairIndex]
    repair.status = 'completed'
    
    // Get existing archive items
    const archiveItems = JSON.parse(localStorage.getItem('archiveItems') || '[]')
    
    // Add to archive
    archiveItems.push({
      id: repair.id,
      trackingNumber: repair.trackingNumber,
      date: repair.date,
      customerName: repair.customerName,
      deviceType: repair.deviceType,
      issue: repair.issue,
      status: 'completed',
      parts: repair.parts,
      statement: repair.statement
    })
    
    // Save updated archive
    localStorage.setItem('archiveItems', JSON.stringify(archiveItems))
    
    // Remove from active repairs
    repairs.splice(repairIndex, 1)
    localStorage.setItem('receptions', JSON.stringify(repairs))
    
    // Refresh transactions
    onMounted()
  }
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
</style>
