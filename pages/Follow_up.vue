<template>
    <Header />
    <div class="min-vh-100 bg-light py-5">
      <div class="container" style="max-width: 800px;">
        <div class="card shadow">
          <div class="card-header bg-primary text-white">
            <h1 class="h4 mb-0">پیگیری وضعیت تعمیرات</h1>
            <p class="mb-0 small">شماره پیگیری: #{{ trackingId }}</p>
          </div>
          
          <div class="card-body">
            <!-- بخش اطلاعات مشتری -->
            <div class="mb-4">
              <h2 class="h5 mb-3 text-primary">اطلاعات مشتری</h2>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">نام و نام خانوادگی:</label>
                  <div class="form-control bg-light">{{ repairData.fullName }}</div>
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
                  <div class="form-control bg-light">{{ repairData.deviceName }}</div>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">دسته بندی:</label>
                  <div class="form-control bg-light">{{ repairData.category }}</div>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">توضیحات ظاهری:</label>
                <div class="form-control bg-light" style="min-height: 100px;">{{ repairData.description }}</div>
              </div>
              <div class="mb-3">
                <label class="form-label">مبلغ بیانه:</label>
                <div class="form-control bg-light">{{ formattedStatement }} تومان</div>
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
                    <p class="small text-muted mb-0">{{ status.date }}</p>
                    <p v-if="status.note" class="small mt-1">{{ status.note }}</p>
                  </div>
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
    <Footer />
  </template>
  
  <script setup>
  import Footer from '~/components/ّFooter.vue'
  import { ref, computed, onMounted } from 'vue'
  
  // اطلاعات فرم را از localStorage می‌خوانیم
  const repairData = ref({
    fullName: '',
    phone: '',
    deviceName: '',
    category: '',
    statement: 0,
    description: ''
  })
  
  // وضعیت‌های تعمیرات
  const statuses = ref([
    { title: 'ثبت درخواست', date: 'امروز - ۱۴:۳۰', completed: true, active: false, note: 'درخواست شما با موفقیت ثبت شد' },
    { title: 'بررسی اولیه', date: 'فردا - ۹:۰۰', completed: false, active: true, note: 'در حال بررسی توسط کارشناس' },
    { title: 'تخمین هزینه', date: '', completed: false, active: false },
    { title: 'تعمیرات', date: '', completed: false, active: false },
    { title: 'تست نهایی', date: '', completed: false, active: false },
    { title: 'آماده تحویل', date: '', completed: false, active: false }
  ])
  
  // شماره پیگیری تصادفی
  const trackingId = ref('GP-' + Math.floor(100000 + Math.random() * 900000))
  
  // فرمت مبلغ بیانه
  const formattedStatement = computed(() => {
    return (repairData.value.statement || 0).toLocaleString()
  })
  
  // چاپ صفحه
  const printPage = () => {
    window.print()
  }
  
  // ارتباط با پشتیبانی
  const contactSupport = () => {
    window.location.href = `https://wa.me/989123456789?text=پیگیری تعمیرات - شماره پیگیری: ${trackingId.value}`
  }
  
  // بارگذاری اطلاعات از localStorage
  onMounted(() => {
    const savedForm = localStorage.getItem('repairFormData')
    if (savedForm) {
      repairData.value = JSON.parse(savedForm)
      // ذخیره شماره پیگیری اگر وجود نداشت
      if (!localStorage.getItem('trackingId')) {
        localStorage.setItem('trackingId', trackingId.value)
      } else {
        trackingId.value = localStorage.getItem('trackingId')
      }
    }
  })
  </script>
  
  <style scoped>
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