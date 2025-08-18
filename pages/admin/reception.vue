<template>
  <div class="reception-page">

    <!-- لودینگ Overlay برای بارگذاری اولیه -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
      <p class="loading-text">در حال بارگذاری اطلاعات...</p>
    </div>


    <div class="page-header">
      <h2>فرم پذیرش</h2>
     <NuxtLink to="/admin/Form">
       <button class="btn btn-primary" @click="showReceptionForm = true">
         <i class="fas fa-plus"></i> ثبت پذیرش جدید
       </button>
     </NuxtLink>
    </div>

    <div class="filters-section">
      <div class="row">
        <div class="col-md-3">
          <label>جستجو:</label>
          <input type="text" class="form-control" placeholder="شماره پیگیری یا نام مشتری" v-model="receptionSearch">
        </div>
        <div class="col-md-3">
          <label>وضعیت:</label>
          <select class="form-control" v-model="receptionStatus">
            <option value="all">همه</option>
            <option value="pending">در انتظار بررسی</option>
            <option value="in-progress">در حال انجام</option>
            <option value="completed">تکمیل شده</option>
          </select>
        </div>
        <!-- <div class="col-md-3"> 
          <label>از تاریخ:</label>
          <PersianDatePicker
            v-model="receptionFromDate"
            placeholder="تاریخ را انتخاب کنید"
          />
        </div>-->
        <div class="col-md-3">
          <button class="btn btn-primary" @click="applyReceptionFilters">جستجو</button>
        </div>
      </div>
    </div>

    <div class="reception-table">
      <table class="table">
        <thead>
          <tr>
            <th>شماره پیگیری</th>
            <th>تاریخ ثبت</th>
            <th>نام مشتری</th>
            <th>شماره تماس</th>
            <th>نوع دستگاه</th>
            <th>دسته‌بندی</th>
            <th>مشکل</th>
            <th>توضیحات ظاهری</th>
            <th>بیانه (تومان)</th>
            <th>وضعیت</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredReceptions" :key="item.id">
            <td>{{ item.trackingNumber }}</td>
            <td>{{ item.date }}</td>
            <td>{{ item.customerName }}</td>
            <td>{{ item.phone }}</td>
            <td>{{ item.deviceType }}</td>
            <td>{{ item.category }}</td>
            <td>{{ item.issue }}</td>
            <td>{{ item.appearanceDetails || '-' }}</td>
            <td>{{ item.statement ? Number(item.statement).toLocaleString() : '۰' }}</td>
            <td>
              <span :class="'status-' + item.status">{{ getStatusText(item.status) }}</span>
            </td>
            <td>
              <button class="btn btn-sm btn-outline-primary" @click="viewReception(item.id)">
                <i class="fas fa-eye"></i>
              </button>
              <button class="btn btn-sm btn-outline-success" @click="editReception(item.id)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" @click="deleteReception(item.id)">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal for new reception -->
    <div class="modal" :class="{ show: showReceptionForm }">
      <div class="modal-content">
        <div class="modal-header">
          <h5>ثبت پذیرش جدید</h5>
          <button @click="showReceptionForm = false">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitReceptionForm">
            <div class="form-group">
              <label>نام مشتری</label>
              <input type="text" class="form-control" v-model="receptionForm.customerName" required>
            </div>
            <div class="form-group">
              <label>شماره تماس</label>
              <input type="tel" class="form-control" v-model="receptionForm.phone" required>
            </div>
            <div class="form-group">
              <label>نوع دستگاه</label>
              <input type="text" class="form-control" v-model="receptionForm.deviceType" required>
            </div>
            <div class="form-group">
              <label>مشکل</label>
              <textarea class="form-control" v-model="receptionForm.issue" rows="3" required></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="showReceptionForm = false">انصراف</button>
              <button type="submit" class="btn btn-primary">ذخیره</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Card View Modal -->
    <div class="modal" :class="{ show: showCardModal }" @click.self="closeCardModal">
      <div class="modal-content" v-if="selectedReception">
        <div class="modal-header">
          <h3>جزئیات پذیرش</h3>
          <button class="close-btn" @click="closeCardModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="detail-section">
            <h4>اطلاعات مشتری</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>شماره پیگیری:</label>
                <span>{{ selectedReception.trackingNumber }}</span>
              </div>
              <div class="detail-item">
                <label>نام مشتری:</label>
                <span>{{ selectedReception.customerName }}</span>
              </div>
              <div class="detail-item">
                <label>شماره تماس:</label>
                <span>{{ selectedReception.phone }}</span>
              </div>
              <div class="detail-item">
                <label>تاریخ ثبت:</label>
                <span>{{ selectedReception.date }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>اطلاعات دستگاه</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>نوع دستگاه:</label>
                <span>{{ selectedReception.deviceType }}</span>
              </div>
              <div class="detail-item">
                <label>دسته‌بندی:</label>
                <span>{{ selectedReception.category }}</span>
              </div>
              <div class="detail-item">
                <label>بیانه:</label>
                <span>{{ selectedReception.statement ? Number(selectedReception.statement).toLocaleString() : '۰' }} تومان</span>
              </div>
              <div class="detail-item">
                <label>وضعیت:</label>
                <span :class="['status-badge', selectedReception.status]">
                  {{ getStatusText(selectedReception.status) }}
                </span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>مشکل دستگاه</h4>
            <p class="description">{{ selectedReception.issue || 'مشخص نشده' }}</p>
          </div>

          <div class="detail-section">
            <h4>توضیحات ظاهری</h4>
            <p class="description">{{ selectedReception.appearanceDetails || 'مشخص نشده' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- مدال ویرایش پذیرش -->
    <div v-if="editReceptionModal" class="modal show">
      <div class="modal-content">
        <div class="modal-header">
          <h5>ویرایش پذیرش</h5>
          <button @click="closeEditReceptionModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitEditReception">
            <div class="form-group">
              <label>نام مشتری</label>
              <input type="text" class="form-control" v-model="editingReception.customerName" required>
            </div>
            <div class="form-group">
              <label>شماره تماس</label>
              <input type="tel" class="form-control" v-model="editingReception.phone" required>
            </div>
            <div class="form-group">
              <label>نام دستگاه</label>
              <input type="text" class="form-control" v-model="editingReception.deviceType" required>
            </div>
            <div class="form-group">
              <label>دسته‌بندی</label>
              <select v-model="editingReception.category" class="form-control" required>
                <option value="" disabled>لطفا انتخاب کنید</option>
                <option v-for="cat in deviceCategories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>تعمیرکار</label>
              <select v-model="editingReception.repairmanId" class="form-control">
                <option value="" disabled>لطفا تعمیرکار را انتخاب کنید</option>
                <option v-for="repairman in activeRepairmen" :key="repairman.id" :value="repairman.id">
                  {{ repairman.fullName || repairman.name }}<span v-if="repairman.specialty"> ({{ repairman.specialty }})</span>
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>مشکل دستگاه</label>
              <textarea class="form-control" v-model="editingReception.issue" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label>توضیحات ظاهری</label>
              <textarea class="form-control" v-model="editingReception.appearanceDetails" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label>بیانه</label>
              <input type="number" class="form-control" v-model="editingReception.statement">
            </div>
            <div class="form-group">
              <label>تاریخ پذیرش</label>
              <PersianDatePicker
                v-model="editingReception.receptionDate"
                placeholder="تاریخ پذیرش را انتخاب کنید"
              />
            </div>
            <div class="form-group">
              <label>تاریخ تحویل پیش‌بینی شده</label>
              <PersianDatePicker
                v-model="editingReception.deliveryDate"
                placeholder="تاریخ تحویل را انتخاب کنید"
              />
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="closeEditReceptionModal">انصراف</button>
              <button type="submit" class="btn btn-primary">ذخیره تغییرات</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import moment from 'moment-jalaali'
import PersianDatePicker from '~/components/PersianDatePicker.vue'
import { useNuxtApp } from '#app'

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const receptionSearch = ref('')
const receptionStatus = ref('all')
const receptionFromDate = ref('')
const showReceptionForm = ref(false)
const isLoading = ref(false);

const receptionForm = ref({
  customerName: '',
  phone: '',
  deviceType: '',
  issue: ''
})

const receptions = ref([])
const activeRepairmen = ref([])
const deviceCategories = ref([])

// Load receptions from API on component mount
onMounted(async () => {
  try {
    isLoading.value = true
    const { $axios } = useNuxtApp()
    const response = await $axios.get('/device/repair/')
    // نگاشت فیلدهای API به ساختار مورد انتظار جدول
    const data = Array.isArray(response.data) ? response.data : (response.data?.data || [])
    receptions.value = data.map(item => ({
      id: item.id,
      trackingNumber: item.verification_code || item.tracking_number || '',
      date: (item.received_at || item.created_at || '').split(' ')[0],
      customerName: item.customer_name || item.name || item.customer?.name || item.customer?.full_name || '',
      deviceType: item.device_name || '',
      issue: item.device_problem || '',
      appearanceDetails: item.appearance_details || '',
      status: item.status || '',
      phone: item.mobile || item.phone || item.customer?.mobile || item.customer?.phone || '',
      category: item.device_category_id || '',
      statement: item.prepaid || 0,
      repairmanId: item.technician_id || '',
      receptionDate: item.received_at || '',
      deliveryDate: item.delivered_at || ''
    }))
  } catch (e) {
    receptions.value = []
  }

  // Load technicians
  try {
    const { $axios } = useNuxtApp()
    const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token')
    const res = await $axios.get('/user/technician', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (res.data && Array.isArray(res.data)) {
      activeRepairmen.value = res.data
    }
  } catch (e) {
    console.error('خطا در دریافت تعمیرکاران:', e)
  }

  // Load device categories
  try {
    const { $axios } = useNuxtApp()
    const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token')
    const res = await $axios.get('/device/category', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (res.data && Array.isArray(res.data)) {
      deviceCategories.value = res.data
    }
  } catch (e) {
    console.error('خطا در دریافت دسته‌بندی دستگاه:', e)
  }

  finally {
    isLoading.value = false
  }


})

const filteredReceptions = computed(() => {
  let result = receptions.value.filter(r => r.status !== 'completed')
  
  if (receptionStatus.value !== 'all') {
    result = result.filter(r => r.status === receptionStatus.value)
  }
  if (receptionSearch.value) {
    const search = receptionSearch.value.toLowerCase()
    result = result.filter(r => 
      r.trackingNumber.toLowerCase().includes(search) || 
      r.customerName.toLowerCase().includes(search) ||
      r.phone.toLowerCase().includes(search) ||
      r.deviceType.toLowerCase().includes(search) ||
      r.category.toLowerCase().includes(search) ||
      r.issue.toLowerCase().includes(search)
    )
  }
  return result
})

const getStatusText = (status) => {
  const statusMap = {
    'pending': 'در انتظار بررسی',
    'in-progress': 'در حال انجام',
    'completed': 'تکمیل شده',
    'delivered': 'تکمیل شده'
  }
  return statusMap[status] || status
}

const applyReceptionFilters = () => {
  // در واقعیت اینجا درخواست به سرور ارسال می‌شود
  console.log('فیلترهای پذیرش اعمال شد:', {
    search: receptionSearch.value,
    status: receptionStatus.value,
    fromDate: receptionFromDate.value
  })
}

const showCardModal = ref(false)
const selectedReception = ref(null)

const viewReception = (id) => {
  const reception = receptions.value.find(r => r.id === id)
  if (reception) {
    selectedReception.value = reception
    showCardModal.value = true
  }
}

const closeCardModal = () => {
  showCardModal.value = false
  selectedReception.value = null
}

const editReceptionModal = ref(false)
const editingReception = ref(null)

const editReception = (id) => {
  const reception = receptions.value.find(r => r.id === id)
  if (reception) {
    editingReception.value = { ...reception }
    editReceptionModal.value = true
  }
}

const closeEditReceptionModal = () => {
  editReceptionModal.value = false
  editingReception.value = null
}

const submitEditReception = async () => {
  if (!editingReception.value) return
  try {
    const { $axios } = useNuxtApp()
    await $axios.patch(`/device/repair/${editingReception.value.id}`, {
      name: editingReception.value.customerName,
      mobile: editingReception.value.phone,
      technician_id: editingReception.value.repairmanId || null,
      device_category_id: editingReception.value.category,
      device_name: editingReception.value.deviceType,
      device_problem: editingReception.value.issue,
      appearance_details: editingReception.value.appearanceDetails,
      prepaid: editingReception.value.statement,
      status: editingReception.value.status,
      received_at: editingReception.value.receptionDate,
      delivered_at: editingReception.value.deliveryDate
    })
    // پس از ویرایش، لیست را دوباره از API بگیر و نگاشت کن
    const response = await $axios.get('/device/repair/')
    const data = Array.isArray(response.data) ? response.data : (response.data?.data || [])
    receptions.value = data.map(item => ({
      id: item.id,
      trackingNumber: item.verification_code || item.tracking_number || '',
      date: (item.received_at || item.created_at || '').split(' ')[0],
      customerName: item.customer_name || item.name || item.customer?.name || item.customer?.full_name || '',
      deviceType: item.device_name || '',
      issue: item.device_problem || '',
      appearanceDetails: item.appearance_details || '',
      status: item.status || '',
      phone: item.mobile || item.phone || item.customer?.mobile || item.customer?.phone || '',
      category: item.device_category_id || '',
      statement: item.prepaid || 0,
      repairmanId: item.technician_id || '',
      receptionDate: item.received_at || '',
      deliveryDate: item.delivered_at || ''
    }))
    closeEditReceptionModal()
  } catch (e) {
    Command: toastr["error"]("خطا در ویرایش پذیرش", "خطا")

toastr.options = {
  "closeButton": true,
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

const deleteReception = async (id) => {
  if (confirm('آیا از حذف این پذیرش اطمینان دارید؟')) {
    try {
      const { $axios } = useNuxtApp()
      await $axios.delete(`/device/repair/${id}`)
      const response = await $axios.get('/device/repair/')
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || [])
      receptions.value = data.map(item => ({
        id: item.id,
        trackingNumber: item.verification_code || item.tracking_number || '',
        date: (item.received_at || item.created_at || '').split(' ')[0],
        customerName: item.customer_name || item.name || item.customer?.name || item.customer?.full_name || '',
        deviceType: item.device_name || '',
        issue: item.device_problem || '',
        status: item.status || '',
        phone: item.mobile || item.phone || item.customer?.mobile || item.customer?.phone || '',
        category: item.device_category_id || '',
        statement: item.prepaid || 0,
        receptionDate: item.received_at || '',
        deliveryDate: item.delivered_at || ''
      }))
    } catch (e) {
      Command: toastr["error"]("خطا در حذف پذیرش", "خطا")

toastr.options = {
  "closeButton": true,
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
}

const submitReceptionForm = () => {
  const today = moment().format('jYYYY/jMM/jDD')
  const newReception = {
    id: Date.now(),
    trackingNumber: `GP-${Math.floor(Math.random() * 1000000)}`,
    date: today,
    customerName: receptionForm.value.customerName,
    deviceType: receptionForm.value.deviceType,
    issue: receptionForm.value.issue,
    status: 'pending',
    phone: receptionForm.value.phone,
    category: receptionForm.value.category,
    statement: receptionForm.value.statement || 0,
    receptionDate: today,
    deliveryDate: ''
  }

  receptions.value.unshift(newReception)
  localStorage.setItem('receptions', JSON.stringify(receptions.value))
  showReceptionForm.value = false
  receptionForm.value = {
    customerName: '',
    phone: '',
    deviceType: '',
    issue: ''
  }
}
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


.reception-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filters-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.reception-table {
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

.status-pending { color: #f39c12; }
.status-in-progress { color: #3498db; }
.status-completed { color: #2ecc71; }

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

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .filters-section .row {
    flex-direction: column;
    gap: 10px;
  }

  .filters-section .col-md-3 {
    width: 100%;
  }

  .reception-table {
    padding: 10px;
  }

  .table th,
  .table td {
    padding: 8px;
  }

  .btn-sm {
    padding: 4px 8px;
  }
}

/* Card View Modal Styles */
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

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  display: inline-block;
}

.status-badge.pending { background: #fff3cd; color: #856404; }
.status-badge.in-progress { background: #cce5ff; color: #004085; }
.status-badge.completed { background: #d4edda; color: #155724; }

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 10px;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>

