<template>
  <div class="form-page">
    <div class="page-header">
      <h2>فرم ثبت اطلاعات</h2>
    </div>

    <div class="form-container">
      <div class="form-card">
        <div class="form-header">
          <h3>اطلاعات مشتری</h3>
          <p class="text-muted">لطفا اطلاعات خود را با دقت وارد کنید</p>
        </div>

        <form @submit.prevent="submitForm" class="form-body">
          <div class="form-group">
            <label for="fullName">نام و نام خانوادگی</label>
            <input 
              v-model="form.fullName" 
              type="text" 
              class="form-control" 
              id="fullName" 
              required 
              placeholder="نام و نام خانوادگی خود را وارد کنید"
            >
          </div>

          <div class="form-group">
            <label for="phone">شماره همراه</label>
            <input 
              v-model="form.phone" 
              type="tel" 
              class="form-control" 
              id="phone" 
              required 
              placeholder="09xxxxxxxxx" 
              pattern="09[0-9]{9}" 
              maxlength="11"
            >
          </div>

          <div class="form-group">
            <label for="deviceName">نام دستگاه</label>
            <input 
              v-model="form.deviceName" 
              type="text" 
              class="form-control" 
              id="deviceName" 
              required 
              placeholder="نام دستگاه را وارد کنید"
            >
          </div>

          <div class="form-group">
            <label for="category">دسته بندی</label>
            <select v-model="form.category" class="form-control" id="category" required>
              <option value="" disabled selected>لطفا انتخاب کنید</option>
              <option v-for="cat in deviceCategories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="repairman">تعمیرکار</label>
            <select v-model="form.repairmanId" class="form-control" id="repairman" required>
              <option value="" disabled selected>لطفا تعمیرکار را انتخاب کنید</option>
              <option v-for="repairman in activeRepairmen" :key="repairman.id" :value="repairman.id">
                {{ repairman.fullName || repairman.name }}<span v-if="repairman.specialty"> ({{ repairman.specialty }})</span>
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="receptionDate">تاریخ پذیرش</label>
            <PersianDatePicker
              v-model="form.receptionDate"
              placeholder="تاریخ پذیرش را انتخاب کنید"
            />
          </div>

          <div class="form-group">
            <label for="deliveryDate">تاریخ تحویل پیش‌بینی شده</label>
            <PersianDatePicker
              v-model="form.deliveryDate"
              placeholder="تاریخ تحویل را انتخاب کنید"
            />
          </div>

          <div class="form-group">
            <label for="statement">بیانه</label>
            <div class="statement-input">
              <button type="button" class="btn btn-outline-secondary" @click="decreaseStatement">
                <i class="fas fa-minus"></i>
              </button>
              <input
                :value="formattedStatement"
                @input="onStatementInput($event.target.value)"
                type="text"
                inputmode="numeric"
                class="form-control"
                id="statement"
                required
                placeholder="مبلغ بیانه را وارد کنید"
              >
              <button type="button" class="btn btn-outline-secondary" @click="increaseStatement">
                <i class="fas fa-plus"></i>
              </button>
              <span class="input-group-text">تومان</span>
            </div>
            <div class="quick-amounts">
              <button
                v-for="amount in quickAmounts"
                :key="amount"
                type="button"
                class="btn btn-outline-primary btn-sm"
                @click="form.statement = amount"
              >
                {{ amount.toLocaleString() }} تومان
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="description">توضیحات ظاهری</label>
            <textarea 
              v-model="form.description" 
              class="form-control" 
              id="description" 
              rows="4" 
              placeholder="توضیحات ظاهری را وارد کنید"
            ></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="resetForm">
              <i class="fas fa-undo"></i>
              پاک کردن فرم
            </button>
            <button type="submit" class="btn btn-primary">
              <span v-if="isSendingCode">
              <i class="fas fa-spinner fa-spin"></i>
              </span>
              ثبت اطلاعات
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import moment from 'moment-jalaali'
import PersianDatePicker from '~/components/PersianDatePicker.vue'
import { useRouter } from 'nuxt/app'
import { useNuxtApp } from '#app'
const isSendingCode = ref(false)
const { $axios } = useNuxtApp()

const router = useRouter()

definePageMeta({
  layout: 'admin',
  middleware: [
    function (to, from) {
      // Only run on client-side
      if (process.client) {
        try {
          // Check if user is logged in as admin
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null')
          const role = localStorage.getItem('role')
          
          // If not logged in or not an admin, redirect to login
          if (!currentUser || role !== '1') {
            return navigateTo('/login')
          }
        } catch (error) {
          // If any error occurs (like localStorage not available), redirect to login
          return navigateTo('/login')
        }
      }
      // Allow access on server-side, the check will happen on client-side
      return true
    }
  ]
})

const quickAmounts = [100000, 200000, 300000, 400000]

const form = ref({
  fullName: "",
  phone: "",
  deviceName: "",
  category: "",
  statement: 0,
  description: "",
  repairmanId: "",
  receptionDate: moment().format('jYYYY/jMM/jDD'),
  deliveryDate: moment().add(3, 'days').format('jYYYY/jMM/jDD'),
})

// Add editingReceptionId ref
const editingReceptionId = ref(null)

// Add activeRepairmen ref
const activeRepairmen = ref([])

// Add deviceCategories ref
const deviceCategories = ref([])

// Load reception data if editing
onMounted(async () => {
  const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token')

  // Fetch technicians from API
  try {
    const res = await $axios.get('/user/technician', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (res.data && Array.isArray(res.data)) {
      activeRepairmen.value = res.data
    }
  } catch (e) {
    
  }

  // Load editing reception if exists
  const editingReception = JSON.parse(localStorage.getItem('editingReception') || 'null')
  if (editingReception) {
    
    form.value = {
      fullName: editingReception.customerName,
      phone: editingReception.phone,
      deviceName: editingReception.deviceType,
      category: editingReception.category,
      statement: editingReception.statement,
      description: editingReception.issue,
      repairmanId: editingReception.repairmanId || "",
      receptionDate: editingReception.receptionDate || moment().format('jYYYY/jMM/jDD'),
      deliveryDate: editingReception.deliveryDate || "",
    }
    editingReceptionId.value = editingReception.id
  }

  // بررسی وضعیت کلی localStorage
  // const receptions = JSON.parse(localStorage.getItem('receptions') || '[]')
  // console.log('Debug - Current localStorage state:', {
  //   receptionsCount: receptions.length,
  //   receptions: receptions.map(r => ({
  //     id: r.id,
  //     trackingNumber: r.trackingNumber,
  //     phone: r.phone,
  //     customerName: r.customerName
  //   }))
  // })

  // Fetch device categories from API
  try {
    const res = await $axios.get('/device/category', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (res.data && Array.isArray(res.data)) {
      deviceCategories.value = res.data
    }
  } catch (e) {
    
  }
})

const increaseStatement = () => {
  form.value.statement = Math.min((parseInt(form.value.statement) || 0) + 50000, 1000000000)
}

const decreaseStatement = () => {
  form.value.statement = Math.max((parseInt(form.value.statement) || 0) - 50000, 0)
}

const formattedStatement = computed(() => {
  const val = parseInt(form.value.statement) || 0
  return val.toLocaleString()
})

const onStatementInput = (val) => {
  const num = parseInt(val.replace(/,/g, "")) || 0
  form.value.statement = num
}

const submitForm = async () => {
  // نرمال‌سازی شماره تلفن قبل از ذخیره
  const normalizedPhone = form.value.phone.toString().trim().replace(/[^0-9]/g, '')
  if (!normalizedPhone.startsWith('09')) {
    Command: toastr["warning"]("شماره تلفن باید با 09 شروع شود", "هشدار")

toastr.options = {
  "closeButton": false,
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
    return
  }

  // console.log('Debug - Submitting form:', {
  //   formData: {
  //     ...form.value,
  //     phone: normalizedPhone
  //   },
  //   editingReceptionId: editingReceptionId.value
  // })

  if (editingReceptionId.value) {
    // Update existing reception
    const receptions = JSON.parse(localStorage.getItem('receptions') || '[]')
    const index = receptions.findIndex(r => r.id === editingReceptionId.value)
    
    if (index !== -1) {
      const updatedReception = {
        ...receptions[index],
        customerName: form.value.fullName,
        phone: normalizedPhone,
        deviceType: form.value.deviceName,
        category: form.value.category,
        statement: form.value.statement,
        issue: form.value.description,
        repairmanId: form.value.repairmanId,
        receptionDate: form.value.receptionDate,
        deliveryDate: form.value.deliveryDate,
        date: form.value.receptionDate
      }
      
      receptions[index] = updatedReception
      // console.log('Debug - Updating reception:', updatedReception)
      
      localStorage.setItem('receptions', JSON.stringify(receptions))
      localStorage.removeItem('editingReception')
      // ثبت اطلاعات دستگاه در دیتابیس
      
      
    }
  } else {
    // Create new reception
    // const newReception = {
    //   id: Date.now(),
    //   trackingNumber: `GP-${Math.floor(Math.random() * 1000000)}`,
    //   date: form.value.receptionDate,
    //   customerName: form.value.fullName,
    //   deviceType: form.value.deviceName,
    //   issue: form.value.description,
    //   status: 'pending',
    //   phone: normalizedPhone,
    //   category: form.value.category,
    //   statement: form.value.statement,
    //   repairmanId: form.value.repairmanId,
    //   receptionDate: form.value.receptionDate,
    //   deliveryDate: form.value.deliveryDate,
    // }

    // console.log('Debug - Creating new reception:', newReception)

    // const receptions = JSON.parse(localStorage.getItem('receptions') || '[]')
    // receptions.unshift(newReception)
    // localStorage.setItem('receptions', JSON.stringify(receptions))
    
    // ثبت اطلاعات دستگاه در دیتابیس
    isSendingCode.value = true
    try {
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // // تبدیل تاریخ‌های فارسی به میلادی
      // const receivedAt = form.value.receptionDate ? 
      //   moment(form.value.receptionDate, 'jYYYY/jMM/jDD').format('YYYY-MM-DD HH:mm:ss') : null
      // const deliveredAt = form.value.deliveryDate ? 
      //   moment(form.value.deliveryDate, 'jYYYY/jMM/jDD').format('YYYY-MM-DD HH:mm:ss') : null
      
      const response = await $axios.post('/device/repair', {
        name: form.value.fullName,
        mobile: normalizedPhone,
        technician_id: form.value.repairmanId || null,
        device_category_id: form.value.category,
        device_name: form.value.deviceName,
        device_problem: null,
        appearance_details: form.value.description, // توضیحات ظاهری
        repair_details: null,
        prepaid: form.value.statement,
        repair_price: 0,
        price: 0,
        status: form.value.status || 'pending',
        repair_status: 'not_started',
        verification_code: verificationCode,
        received_at: form.value.receptionDate,
        delivered_at: form.value.deliveryDate,
        delivered_real_at: null,
      }, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.data && response.data.success) {
        Command: toastr["success"]("فرم پذیرش با موفقیت ثبت و پیامک به مشتری ارسال شد", "ثبت فرم")

toastr.options = {
  "closeButton": false,
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
      } else {
        Command: toastr["warning"]("مشکلی در ارسال پیامک به مشتری پیش آمده  است", "هشدار")

toastr.options = {
  "closeButton": false,
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
    } catch (e) {
     
      Command: toastr["error"]("فرم ثبت نشد", "خطا")

toastr.options = {
  "closeButton": false,
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
isSendingCode.value = false
    }
    // بررسی نهایی داده‌های ذخیره شده
    // const savedReceptions = JSON.parse(localStorage.getItem('receptions') || '[]')
    // console.log('Debug - Saved receptions:', {
    //   count: savedReceptions.length,
    //   latest: savedReceptions[0]
    // })
    
    
    navigateTo('/admin/reception')
    // console.error('response')
  }
}

const resetForm = () => {
  form.value = {
    fullName: "",
    phone: "",
    deviceName: "",
    category: "",
    statement: 0,
    description: "",
    repairmanId: "",
    receptionDate: moment().format('jYYYY/jMM/jDD'),
    deliveryDate: moment().add(3, 'days').format('jYYYY/jMM/jDD'),
  }
  editingReceptionId.value = null
  localStorage.removeItem('editingReception')
}
</script>

<style scoped>
.form-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.form-container {
  max-width: 800px;
  margin: 0 auto;
}

.form-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  overflow: hidden;
}

.form-header {
  background: #3498db;
  color: white;
  padding: 20px;
  text-align: center;
}

.form-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.form-header p {
  margin: 5px 0 0;
  opacity: 0.8;
}

.form-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
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

.statement-input {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.statement-input .form-control {
  text-align: center;
}

.statement-input .btn {
  padding: 8px 12px;
}

.quick-amounts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-amounts .btn {
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
}

.btn {
  padding: 8px 15px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
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

.btn-outline-secondary {
  background: transparent;
  border: 1px solid #95a5a6;
  color: #95a5a6;
}

.btn-outline-secondary:hover {
  background: #95a5a6;
  color: white;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .form-page {
    padding: 10px;
  }

  .form-header {
    padding: 15px;
  }

  .form-body {
    padding: 15px;
  }

  .statement-input {
    flex-wrap: wrap;
  }

  .statement-input .form-control {
    order: -1;
    width: 100%;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>