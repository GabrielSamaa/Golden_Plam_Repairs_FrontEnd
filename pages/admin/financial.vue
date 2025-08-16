<template>
  <div class="financial-page">
    <!-- لودینگ Overlay برای بارگذاری اولیه -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
      <p class="loading-text">در حال بارگذاری اطلاعات...</p>
    </div>

    <div class="page-header">
      <h2>مدیریت مالی</h2>
    </div>

    <div class="filters-section">
      <div class="row">
        <div class="col-md-3">
          <label>از تاریخ:</label>
          <PersianDatePicker v-model="fromDate" placeholder="تاریخ را انتخاب کنید" />
        </div>
        <div class="col-md-3">
          <label>تا تاریخ:</label>
          <PersianDatePicker v-model="toDate" placeholder="تاریخ را انتخاب کنید" />
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
          <input type="text" class="form-control" v-model="searchQuery" placeholder="شماره پیگیری، مشتری یا دستگاه..." />
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
            <h3>کل درآمد</h3>
            <p class="amount">{{ formatCurrency(totalIncome) }}</p>
          </div>
        </div>
        <div class="col-md-3">
          <div class="summary-card expense">
            <h3>کل هزینه قطعات</h3>
            <p class="amount">{{ formatCurrency(totalPartsCost) }}</p>
          </div>
        </div>
        <div class="col-md-3">
          <div class="summary-card labor">
            <h3>دستمزد تعمیرات</h3>
            <p class="amount">{{ formatCurrency(totalLaborCost) }}</p>
          </div>
        </div>
        <div class="col-md-3">
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
            <td>{{ formatCurrency(record.totalPartsCost + record.laborCost + record.initialStatement) }}</td>
            <td>{{ formatCurrency(record.initialStatement) }}</td>
            <td>
              <span :class="'status-' + record.status">{{ getStatusText(record.status) }}</span>
            </td>
            <td>
              <button class="btn btn-sm btn-info" @click="viewDetails(record)" title="مشاهده جزئیات">
                <i class="fas fa-eye"></i>
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="transactions-section" v-if="hasDebts">
      <h3>بدهی تکنسین‌ها</h3>
      <div v-for="(group, technician) in groupedDebts" :key="technician" class="technician-group">
        <div class="d-flex" style="justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h4>{{ technician || 'نامشخص' }}</h4>
          <div class="d-flex" style="gap:10px; align-items:center;">
            <div><strong>جمع بدهی قطعات:</strong> {{ formatCurrency(groupTotalDebt(technician)) }}</div>
            <button class="btn btn-primary" @click="openConfirmModal(() => settleGroup(technician), 'تسویه همه بدهی‌های ' + technician)" :disabled="group.settling">
              <span v-if="group.settling" class="local-spinner"></span>
              تسویه همه
            </button>
          </div>
        </div>
        <table class="table">
          <thead>
          <tr>
            <th>نام دستگاه</th>
            <th>کد رهگیری</th>
            <th>نام تعمیرکننده</th>
            <th>بدهی (هزینه قطعات)</th>
            <th>عملیات</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="row in group.rows" :key="row.id">
            <td>{{ row.deviceType }}</td>
            <td>{{ row.trackingNumber }}</td>
            <td>{{ row.repairerName || '-' }}</td>
            <td>{{ formatCurrency(row.debt) }}</td>
            <td class="d-flex" style="gap:8px;">
              <button class="btn btn-sm btn-info" @click="viewDevice(row)"><i class="fas fa-eye"></i></button>
              <button class="btn btn-sm btn-primary" @click="openConfirmModal(() => settle(row), 'تسویه بدهی برای ' + row.trackingNumber)" :disabled="row._loading">
                <span v-if="row._loading" class="local-spinner"></span>
                <i class="fas fa-money-bill"></i>
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="transactions-section" v-else>
      <h3>بدهی تکنسین‌ها</h3>
      <div class="text-center" style="padding: 16px; color: #2ecc71;">همه‌چیز تسویه شده ✅</div>
    </div>

    <!-- مودال جزئیات -->
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
                  <label @click="togglePaymentMode" style="cursor:pointer; user-select:none;">{{ isPaymentMode ? 'مبلغ پرداختی' : 'دستمزد تعمیر' }}</label>
                  <div class="labor-cost-input">
                    <input
                        type="number"
                        class="form-control"
                        v-model.number="priceInput"
                        :placeholder="isPaymentMode ? 'مبلغ پرداختی را وارد کنید' : 'دستمزد تعمیر را وارد کنید'"
                        step="10000"
                        min="0"
                        @input="onPriceInput"
                    />
                    <button
                        class="btn btn-sm btn-success"
                        @click="savePrice"
                        :disabled="!isPriceChanged || isSaving"
                    >
                      <span v-if="isSaving" class="local-spinner"></span>
                      <i class="fas fa-save"></i>
                      {{ saveBtnText }}
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

    <!-- مودال تایید -->
    <div class="modal" :class="{ show: showConfirmModal }" @click.self="closeConfirmModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>تایید عملیات</h3>
          <button class="close-btn" @click="closeConfirmModal">&times;</button>
        </div>
        <div class="modal-body">
          <p>{{ confirmMessage }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeConfirmModal">لغو</button>
          <button class="btn btn-primary" @click="executeConfirmAction">تایید</button>
        </div>
      </div>
    </div>

    <!-- مودال پیام (موفقیت/خطا) -->
    <div class="modal" :class="{ show: showMessageModal }" @click.self="closeMessageModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ messageTitle }}</h3>
          <button class="close-btn" @click="closeMessageModal">&times;</button>
        </div>
        <div class="modal-body">
          <p>{{ messageText }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="closeMessageModal">بستن</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import PersianDatePicker from '~/components/PersianDatePicker.vue'
import { useNuxtApp } from '#app'

definePageMeta({ layout: 'admin', middleware: ['admin'] })

const { $api } = useNuxtApp()

const fromDate = ref('')
const toDate = ref('')
const transactionType = ref('all')
const searchQuery = ref('')

const financialRecords = ref([])
const showDetailsModal = ref(false)
const selectedRecord = ref(null)

const isPaymentMode = ref(false)
const priceInput = ref('')
const isPriceChanged = ref(false)
const originalPrice = ref(null)
const isSaving = ref(false)

const debts = ref([])
const isLoading = ref(false)

const showConfirmModal = ref(false)
const confirmMessage = ref('')
const confirmAction = ref(null)

const showMessageModal = ref(false)
const messageTitle = ref('')
const messageText = ref('')

const route = useRoute()

onMounted(async () => {
  await fetchFixedDevices()
  buildDebts()
  const deviceId = route.query.open_modal_device
  if (deviceId) {
    const rec = financialRecords.value.find((d) => String(d.id) === String(deviceId))
    if (rec) viewDetails(rec)
  }
})

async function fetchFixedDevices() {
  try {
    isLoading.value = true
    const res = await $api.get('/device/fixed-devices')
    if (res.data && Array.isArray(res.data)) {
      financialRecords.value = res.data.map((item) => {
        let partsArr = []
        let totalPartsCost = 0
        if (item.repair_details) {
          try {
            const parsed = JSON.parse(item.repair_details)
            partsArr = parsed.map(([name, price]) => {
              const p = Number(price) || 0
              totalPartsCost += p
              return { name, price: p }
            })
          } catch (_) {}
        }
        const price = item.price != null ? Number(item.price) : item.repair_price != null ? Number(item.repair_price) : null
        return {
          id: String(item.id),
          trackingNumber: item.verification_code || '',
          date: item.delivered_at || '',
          customerName: item.customer?.name || '',
          deviceType: item.device_name || '',
          totalPartsCost,
          laborCost: Number(item.repair_price) || 0,
          initialStatement: Number(item.prepaid) || 0,
          totalCost: (Number(item.prepaid) || 0) + (Number(item.repair_price) || 0),
          parts: partsArr,
          status: item.status || '',
          type: 'repair',
          description: item.appearance_details || '',
          repair_status: item.repair_status || '',
          technicianName: item.technician?.name || item.repairer?.name || '',
          repairerName: item.repairer?.name || '',
          priceField: price,
        }
      })
    }
  } catch (_) {
    showMessage('خطا', 'خطا در بارگذاری اطلاعات')
  } finally {
    isLoading.value = false
  }
}

const filteredRecords = computed(() => {
  let result = financialRecords.value
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter((record) =>
        record.trackingNumber.toLowerCase().includes(query) ||
        record.customerName.toLowerCase().includes(query) ||
        record.deviceType.toLowerCase().includes(query) ||
        record.description.toLowerCase().includes(query) ||
        record.id.toLowerCase().includes(query)
    )
  }
  if (transactionType.value !== 'all') {
    result = result.filter((t) => t.type === transactionType.value)
  }
  if (fromDate.value) {
    result = result.filter((t) => new Date(t.date) >= new Date(fromDate.value))
  }
  if (toDate.value) {
    result = result.filter((t) => new Date(t.date) <= new Date(toDate.value))
  }
  return result
})

const totalIncome = computed(() => financialRecords.value.reduce((s, r) => s + r.totalCost, 0))
const totalPartsCost = computed(() => financialRecords.value.reduce((s, r) => s + r.totalPartsCost, 0))
const totalLaborCost = computed(() => financialRecords.value.reduce((s, r) => s + r.laborCost, 0))
const netProfit = computed(() => totalLaborCost.value)

const formatCurrency = (amount) => new Intl.NumberFormat('fa-IR').format(Number(amount || 0)) + ' تومان'

const getStatusText = (status) => {
  const statusMap = { pending: 'در انتظار', completed: 'تکمیل شده', cancelled: 'لغو شده', delivered: 'تحویل شده', unpaid: 'پرداخت نشده', pay: 'تسویه شده' }
  return statusMap[status] || status
}

const viewDetails = (record) => {
  selectedRecord.value = { ...record }
  showDetailsModal.value = true
  if (record.priceField != null) {
    priceInput.value = record.priceField
    originalPrice.value = record.priceField
  } else {
    priceInput.value = ''
    originalPrice.value = null
  }
  isPaymentMode.value = false
  isPriceChanged.value = false
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedRecord.value = null
  priceInput.value = ''
  isPriceChanged.value = false
}

const togglePaymentMode = () => {
  isPaymentMode.value = !isPaymentMode.value
}

const finalPayment = computed(() => {
  if (!selectedRecord.value) return 0
  const prepaid = Number(selectedRecord.value.initialStatement) || 0
  const parts = Number(selectedRecord.value.totalPartsCost) || 0
  const val = priceInput.value === '' ? 0 : Number(priceInput.value) || 0
  if (isPaymentMode.value) {
    return val - prepaid
  } else {
    return val + parts - prepaid
  }
})

const onPriceInput = () => {
  const current = priceInput.value === '' ? null : Number(priceInput.value) || 0
  isPriceChanged.value = current !== (originalPrice.value == null ? null : Number(originalPrice.value))
}

const saveBtnText = computed(() => (originalPrice.value != null ? 'ویرایش' : 'ذخیره'))

const savePrice = async () => {
  if (!selectedRecord.value) return
  const id = selectedRecord.value.id
  const parts = Number(selectedRecord.value.totalPartsCost) || 0
  const inputVal = Number(priceInput.value) || 0
  const priceToSave = isPaymentMode.value ? inputVal : inputVal + parts
  try {
    isSaving.value = true
    await $api.put(`/device/repair/${id}`, { price: priceToSave })
    originalPrice.value = priceToSave
    isPriceChanged.value = false
    selectedRecord.value.priceField = priceToSave
    const idx = financialRecords.value.findIndex((x) => x.id === id)
    if (idx > -1) {
      financialRecords.value[idx].priceField = priceToSave
    }
    showMessage('موفقیت', 'اطلاعات مالی با موفقیت ذخیره شد')
  } catch (_) {
    showMessage('خطا', 'خطا در ذخیره اطلاعات')
  } finally {
    isSaving.value = false
  }
}

function buildDebts() {
  debts.value = financialRecords.value
      .filter((r) => r.repair_status !== 'pay')
      .map((r) => ({ id: r.id, technicianName: r.technicianName || r.repairerName || '', repairerName: r.repairerName || '', deviceType: r.deviceType, trackingNumber: r.trackingNumber, debt: Number(r.totalPartsCost) || 0, _loading: false }))
}

const groupedDebts = computed(() => {
  const groups = {}
  debts.value.forEach((row) => {
    const key = row.technicianName || 'نامشخص'
    if (!groups[key]) {
      groups[key] = { rows: [], settling: false }
    }
    groups[key].rows.push(row)
  })
  return groups
})

const hasDebts = computed(() => Object.keys(groupedDebts.value).length > 0)

const groupTotalDebt = (technician) => {
  const group = groupedDebts.value[technician]
  if (!group) return 0
  return group.rows.reduce((s, d) => s + (Number(d.debt) || 0), 0)
}

const viewDevice = (row) => {
  const rec = financialRecords.value.find((x) => x.id === row.id)
  if (rec) viewDetails(rec)
}

const settle = async (row) => {
  try {
    row._loading = true
    await $api.patch(`/device/repair/${row.id}`, { repair_status: 'pay' })
    const idx = financialRecords.value.findIndex((x) => x.id === row.id)
    if (idx > -1) financialRecords.value[idx].repair_status = 'pay'
    buildDebts()
    showMessage('موفقیت', 'تسویه با موفقیت انجام شد')
  } catch (_) {
    showMessage('خطا', 'خطا در تسویه')
  } finally {
    row._loading = false
  }
}

const settleGroup = async (technician) => {
  const group = groupedDebts.value[technician]
  if (!group) return
  try {
    group.settling = true
    const copy = [...group.rows]
    for (const row of copy) {
      await $api.patch(`/device/repair/${row.id}`, { repair_status: 'pay' })
      const idx = financialRecords.value.findIndex((x) => x.id === row.id)
      if (idx > -1) financialRecords.value[idx].repair_status = 'pay'
    }
    buildDebts()
    showMessage('موفقیت', 'تسویه همه با موفقیت انجام شد')
  } catch (_) {
    showMessage('خطا', 'خطا در تسویه همه')
  } finally {
    group.settling = false
  }
}

const applyFilters = () => {
  console.log('فیلترهای مالی اعمال شد:', { fromDate: fromDate.value, toDate: toDate.value, type: transactionType.value })
}

const openConfirmModal = (action, message) => {
  confirmAction.value = action
  confirmMessage.value = message + '؟'
  showConfirmModal.value = true
}

const closeConfirmModal = () => {
  showConfirmModal.value = false
  confirmAction.value = null
  confirmMessage.value = ''
}

const executeConfirmAction = () => {
  if (confirmAction.value) {
    confirmAction.value()
  }
  closeConfirmModal()
}

const showMessage = (title, text) => {
  messageTitle.value = title
  messageText.value = text
  showMessageModal.value = true
}

const closeMessageModal = () => {
  showMessageModal.value = false
  messageTitle.value = ''
  messageText.value = ''
}
</script>

<style scoped>
.financial-page { padding: 20px; }
.page-header { margin-bottom: 20px; }

.filters-section { background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.summary-section { margin-bottom: 20px; }

.summary-card { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); text-align: center; }
.summary-card h3 { margin: 0 0 10px; font-size: 1.1rem; color: #7f8c8d; }
.summary-card .amount { font-size: 1.5rem; font-weight: 500; margin: 0; }
.summary-card.income .amount { color: #2ecc71; }
.summary-card.expense .amount { color: #e74c3c; }
.summary-card.profit .amount { color: #3498db; }
.summary-card.labor .amount { color: #9b59b6; }

.transactions-section { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-top: 20px; }
.transactions-section h3 { margin: 0 0 20px; font-size: 1.2rem; }

.transactions-table { overflow-x: auto; margin-top: 20px; }
.table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; }
.table th, .table td { padding: 12px; text-align: right; border-bottom: 1px solid #eee; }
.table th { background: #f8f9fa; font-weight: 500; color: #2c3e50; }
.table tr:hover { background: #f8f9fa; }

.btn { padding: 8px 15px; border-radius: 4px; border: none; cursor: pointer; transition: all 0.3s; }
.btn-primary { background: #3498db; color: #fff; }
.btn-primary:hover { background: #2980b9; }
.btn-info { background: #16a085; color: #fff; }
.btn-info:hover { opacity: 0.9; }
.btn-secondary { background: #95a5a6; color: #fff; }
.btn-secondary:hover { background: #7f8c8d; }

.form-control { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; transition: all 0.3s; }
.form-control:focus { outline: none; border-color: #3498db; box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2); }

.status-pending { color: #f39c12; font-weight: 500; }
.status-completed { color: #2ecc71; font-weight: 500; }
.status-cancelled { color: #e74c3c; font-weight: 500; }
.status-delivered { color: #3498db; font-weight: 500; }
.status-unpaid { color: #e67e22; font-weight: 500; }
.status-pay { color: #2ecc71; font-weight: 600; }

.modal { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; opacity: 0; visibility: hidden; transition: all 0.3s; }
.modal.show { opacity: 1; visibility: visible; }
.modal-content { background: #fff; border-radius: 8px; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
.modal-header { padding: 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { margin: 0; color: #2c3e50; }
.close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #7f8c8d; }
.modal-body { padding: 20px; }
.modal-footer { padding: 20px; border-top: 1px solid #eee; display: flex; justify-content: flex-end; gap: 10px; }

.detail-section { margin-bottom: 30px; }
.detail-section h4 { color: #2c3e50; margin-bottom: 15px; }
.detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
.detail-item { display: flex; flex-direction: column; gap: 5px; }
.detail-item label { color: #7f8c8d; font-size: 0.9rem; }

.parts-list { background: #f8f9fa; border-radius: 8px; overflow: hidden; }
.parts-header { display: grid; grid-template-columns: 2fr 1fr; padding: 12px; background: #e9ecef; font-weight: 500; }
.part-item { display: grid; grid-template-columns: 2fr 1fr; padding: 12px; border-bottom: 1px solid #dee2e6; }
.parts-summary { padding: 15px; background: #fff; }
.summary-item { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 10px; }
.summary-item.total { margin-top: 15px; padding-top: 15px; border-top: 2px solid #dee2e6; font-weight: 500; font-size: 1.1rem; }
.summary-item.expense { color: #e74c3c; }
.summary-item.expense span { color: #e74c3c; }
.final-amount { color: #2ecc71; font-weight: bold; font-size: 1.2rem; }

.labor-cost-input { display: flex; gap: 10px; align-items: center; }
.labor-cost-input input { width: 220px; text-align: left; direction: ltr; font-family: monospace; }
.labor-cost-input input::placeholder { color: #95a5a6; font-style: italic; }
.labor-cost-input .btn { white-space: nowrap; }
.labor-cost-input .btn:disabled { opacity: 0.6; cursor: not-allowed; }

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

.local-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 5px;
}

.technician-group {
  margin-bottom: 30px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .modal-content { width: 95%; margin: 10px; }
  .detail-grid { grid-template-columns: 1fr; }
  .parts-header, .part-item { grid-template-columns: 1fr; gap: 5px; }
}
</style>