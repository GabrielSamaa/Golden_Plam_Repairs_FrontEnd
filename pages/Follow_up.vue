<template>
  <div v-if="load" class="loading-overlay">
    <div class="spinner"></div>
    <p class="loading-text">در حال بارگذاری اطلاعات...</p>
  </div>
  <button
      type="button"
      @click="back"
      class="btn btn-outline-dark m shadow-sm m-2 me-4 ps-2 pe-2"
  >
    بازگشت
  </button>
  <div class="min-vh-100 mt-1 mb-3 bg-light">
    <div class="container" style="max-width: 800px;">
      <div class="card shadow">
        <div class="card-header bg-primary text-white">
          <h1 class="h4 mb-0">پیگیری وضعیت تعمیرات</h1>
          <p class="mb-0 small">شماره پیگیری: {{ repairData.trackingNumber }}</p>
        </div>

        <div class="card-body">
          <!-- بخش اطلاعات مشتری -->
          <div class="mb-4">
            <h2 class="h5 mb-3 text-primary">اطلاعات مشتری</h2>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">نام و نام خانوادگی:</label>
                <div class="form-control bg-light">{{ repairData.customerName }}</div>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">شماره تماس:</label>
                <div class="form-control bg-light">{{ repairData.phone }}</div>
              </div>
            </div>
          </div>

          <!-- بخش اطلاعات دستگاه -->
          <div class="mb-4">
            <h2 class="h5 mb-3 text-primary">اطلاعات دستگاه</h2>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">نام دستگاه:</label>
                <div class="form-control bg-light">{{ repairData.deviceType }}</div>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">دسته‌بندی:</label>
                <div class="form-control bg-light">{{ repairData.category }}</div>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">بیانه:</label>
                <div class="form-control bg-light">{{ formattedStatement }} تومان</div>
              </div>
            </div>
          </div>

          <!-- بخش وضعیت تعمیرات -->
          <div class="mb-4">
            <h2 class="h5 mb-3 text-primary">وضعیت تعمیرات</h2>
            <div class="timeline">
              <div v-for="(status, index) in statuses" :key="index"
                   class="timeline-item" :class="{active: status.active, completed: status.completed}">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <h5 class="mb-1">{{ status.title }}</h5>
                  <p v-if="status.note" class="small mt-1">{{ status.note }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- بخش اطلاعات زمان‌بندی -->
          <div class="mb-4">
            <h2 class="h5 mb-3 text-primary">اطلاعات زمان‌بندی</h2>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">تاریخ پذیرش:</label>
                <div class="form-control bg-light">{{ repairData.receptionDate || repairData.date }}</div>
              </div>
              <div class="col-md-6 mb-3" v-if="repairData.deliveryDate">
                <label class="form-label">تاریخ تحویل پیش‌بینی شده:</label>
                <div class="form-control bg-light">{{ repairData.deliveryDate }}</div>
              </div>
            </div>
          </div>

          <!-- دکمه‌های اقدام -->
          <div class="d-flex justify-content-between mt-4">
            <button class="btn btn-outline-secondary" @click="printPage">
              <i class="fas fa-print me-2"></i> چاپ اطلاعات
            </button>
            <button class="btn btn-primary" @click="contactSupport">
              <i class="fas fa-headset me-2"></i> ارتباط با پشتیبانی
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
import { useNuxtApp } from '#app'

const load = ref(false)
const route = useRoute()
const router = useRouter()
const { $axios } = useNuxtApp()


const repairData = ref({
  trackingNumber: '',
  customerName: '',
  phone: '',
  deviceType: '',
  category: '',
  statement: 0,
  status: '',
  date: '',
  receptionDate: '',
  deliveryDate: '',
  readyForDelivery: false
})

// وضعیت‌های تعمیرات
const statuses = ref([
  { title: 'ثبت درخواست', date: '', completed: false, active: false, note: '' },
  { title: 'بررسی اولیه', date: '', completed: false, active: false, note: '' },
  { title: 'تعمیرات', date: '', completed: false, active: false, note: '' },
  { title: 'تست نهایی', date: '', completed: false, active: false, note: '' },
  { title: 'آماده تحویل', date: '', completed: false, active: false, note: '' }
])

// فرمت مبلغ بیانه
const formattedStatement = computed(() => {
  return (repairData.value.statement || 0).toLocaleString()
})

// به‌روزرسانی وضعیت‌ها بر اساس وضعیت فعلی
const updateStatuses = () => {
  const status = repairData.value.status
  const readyForDelivery = repairData.value.readyForDelivery
  const date = repairData.value.receptionDate || repairData.value.date || new Date().toLocaleDateString('fa-IR')

  // تعیین وضعیت فعلی
  let currentStatusIndex = 0
  let note = ''

  if (readyForDelivery) {
    currentStatusIndex = 4
    note = 'دستگاه آماده تحویل به مشتری می‌باشد'
  } else {
    switch (status) {
      case 'pending':
        currentStatusIndex = 0
        note = 'درخواست شما با موفقیت ثبت شد'
        break
      case 'in_progress':
        currentStatusIndex = 2
        note = 'در حال بررسی و تعمیر توسط کارشناس'
        break
      case 'fixed':
        currentStatusIndex = 3
        note = 'در حال تست نهایی دستگاه'
        break
      case 'confirmed':
        currentStatusIndex = 4
        note = 'دستگاه آماده تحویل به مشتری می‌باشد'
        break
      case 'delivered':
        currentStatusIndex = 4
        note = 'دستگاه تحویل داده شده است'
        break
      default:
        currentStatusIndex = 0
    }
  }

  // به‌روزرسانی وضعیت‌ها
  statuses.value = statuses.value.map((item, index) => {
    if (index < currentStatusIndex) {
      return {
        ...item,
        completed: true,
        active: false,
        date: date,
        note: item.note || 'تکمیل شده'
      }
    } else if (index === currentStatusIndex) {
      return {
        ...item,
        completed: false,
        active: true,
        date: date,
        note: note
      }
    } else {
      return {
        ...item,
        completed: false,
        active: false,
        date: '',
        note: ''
      }
    }
  })
}

// چاپ صفحه
const printPage = () => {
  window.print()
}

// ارتباط با پشتیبانی
const contactSupport = () => {
  window.location.href = `https://wa.me/989052768426?text=پیگیری تعمیرات - شماره پیگیری: ${repairData.value.trackingNumber}`
}

// بارگذاری اطلاعات از API
onMounted(async () => {
  const trackingNumber = route.query.tracking
  if (!trackingNumber) {
    Command: toastr["error"]("شماره پیگیری نامعتعبر است", "خطا")

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
  "timeOut": "5000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}
    router.push('/customer/login')
    return
  }

  try {
    load.value=true
    const response = await $axios.get(`/user-device?verification_code=${trackingNumber}`)
    const repair = response.data[0] // فرض می‌کنیم آرایه برگردانده می‌شود

    if (repair) {
      repairData.value = {
        trackingNumber: repair.verification_code,
        customerName: repair.customer?.name,
        phone: repair.customer?.mobile,
        deviceType: repair.device_name,
        category: repair.category?.name,
        statement: Math.round(repair.prepaid) || 0,
        status: repair.status,
        date: repair.created_at.substring(0, 10),
        receptionDate: repair.reception_date,
        deliveryDate: repair.delivery_date,
        readyForDelivery: repair.status === 'confirmed'
      }

      updateStatuses()
    } else {
      Command: toastr["warning"]("اطلاعاتی با این شماره پیگیری یافت نشد", "وجود ندارد")

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
  "timeOut": "5000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}
      router.push('/customer/login')
    }
  } catch (error) {
    
    Command: toastr["error"]("خطا در دریافت اطلاعات تعمیر", "خطا")

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
  "timeOut": "5000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}
    router.push('/customer/login')
  } finally {
    load.value = false
  }
})
const back = () => {
  router.push(`/customer/my_repairs?phone=${repairData.value.phone}`)
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
/* استایل‌های قبلی بدون تغییر باقی می‌مانند */
.timeline {
  position: relative;
  padding-left: 1rem;
}

.timeline-item {
  position: relative;
  padding-bottom: 1.5rem;
  padding-left: 1.5rem;
  border-left: 2px solid #dee2e6;
}

.timeline-item:last-child {
  border-left: 2px solid transparent;
}

.timeline-dot {
  position: absolute;
  left: -0.5rem;
  top: 0;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background-color: #adb5bd;
  border: 3px solid white;
}

.timeline-content {
  padding: 0.5rem 1rem;
  background-color: #f8f9fa;
  border-radius: 0.5rem;
}

.timeline-item.completed .timeline-dot {
  background-color: #198754;
}

.timeline-item.active .timeline-dot {
  background-color: #0d6efd;
  animation: pulse 1.5s infinite;
}

.timeline-item.completed .timeline-content {
  border-left: 3px solid #198754;
}

.timeline-item.active .timeline-content {
  border-left: 3px solid #0d6efd;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(13, 110, 253, 0); }
  100% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0); }
}

@media print {
  .card-header, .btn {
    display: none !important;
  }
  .card {
    border: none !important;
    box-shadow: none !important;
  }
}
</style>