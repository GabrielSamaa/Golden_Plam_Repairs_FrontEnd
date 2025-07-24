<template>
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
                <!-- <div class="col-md-6 mb-3">
                  <label class="form-label">دسته بندی:</label>
                  <div class="form-control bg-light">{{ repairData.category }}</div>
                </div> -->
              </div>
              <!-- <div class="mb-3">
                <label class="form-label">توضیحات ظاهری:</label>
                <div class="form-control bg-light" style="min-height: 100px;">{{ repairData.description }}</div>
              </div> -->
              <!-- <div class="mb-3">
                <label class="form-label">مبلغ بیانه:</label>
                <div class="form-control bg-light">{{ formattedStatement }} تومان</div>
              </div> -->
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
                    <!-- <p v-if="status.note" class="small mt-1">{{ status.note }}</p> -->
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
                  <div class="form-control bg-light">{{ repairData.receptionDate }}</div>
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
  
  const route = useRoute()
  const router = useRouter()
  const trackingId = ref(route.query.tracking || '')
  
  // اطلاعات فرم را از localStorage می‌خوانیم
  const repairData = ref({
    fullName: '',
    phone: '',
    deviceName: '',
    category: '',
    statement: 0,
    description: '',
    status: '',
    receptionDate: '',
    deliveryDate: '',
    repairmanId: '',
    trackingNumber: '',
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
  const updateStatuses = (status, receptionDate, readyForDelivery) => {
    const statusMap = {
      'pending': {
        index: 0,
        title: 'ثبت درخواست',
        note: 'درخواست شما با موفقیت ثبت شد'
      },
      'in-progress': {
        index: 2,
        title: 'در حال تعمیر',
        note: 'در حال بررسی و تعمیر توسط کارشناس'
      },
      'completed': {
        index: 3,
        title: 'تست نهایی',
        note: readyForDelivery ? 'دستگاه آماده تحویل به مشتری می‌باشد' : 'در حال تست نهایی دستگاه'
      }
    }

    // تعیین وضعیت فعلی
    let currentStatus
    if (readyForDelivery) {
      currentStatus = {
        index: 4,
        title: 'آماده تحویل',
        note: 'دستگاه آماده تحویل به مشتری می‌باشد'
      }
    } else {
      currentStatus = statusMap[status] || statusMap.pending
    }

    const date = receptionDate || new Date().toLocaleDateString('fa-IR')

    // به‌روزرسانی وضعیت‌ها
    statuses.value = statuses.value.map((item, index) => {
      if (index < currentStatus.index) {
        return {
          ...item,
          completed: true,
          active: false,
          date: date,
          note: item.note || 'تکمیل شده'
        }
      } else if (index === currentStatus.index) {
        return {
          ...item,
          completed: false,
          active: true,
          date: date,
          note: currentStatus.note
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
  
  // بارگذاری اطلاعات از localStorage
  onMounted(() => {
    if (!trackingId.value) {
      alert('شماره پیگیری نامعتبر است')
      router.push('/customer/login')
      return
    }

    // جستجو در پذیرش‌ها
    const receptions = JSON.parse(localStorage.getItem('receptions') || '[]')
    const normalizedTracking = trackingId.value.trim().toUpperCase()
    const reception = receptions.find(r => r.trackingNumber.toUpperCase() === normalizedTracking)
    
    if (reception) {
      // اطمینان از وجود فیلد readyForDelivery
      const readyForDelivery = Boolean(reception.readyForDelivery)
      
      repairData.value = {
        fullName: reception.customerName,
        phone: reception.phone,
        deviceName: reception.deviceType,
        category: reception.category,
        statement: reception.statement,
        description: reception.issue,
        status: reception.status,
        receptionDate: reception.receptionDate || reception.date,
        deliveryDate: reception.deliveryDate,
        repairmanId: reception.repairmanId,
        trackingNumber: reception.trackingNumber,
        readyForDelivery: readyForDelivery
      }

      // به‌روزرسانی وضعیت‌ها با در نظر گرفتن وضعیت آماده تحویل
      updateStatuses(
        reception.status, 
        reception.receptionDate || reception.date,
        readyForDelivery
      )

      // اگر تعمیرکار مشخص شده، اطلاعات تعمیرکار را هم نمایش بده
      if (reception.repairmanId) {
        const repairmen = JSON.parse(localStorage.getItem('repairmen') || '[]')
        const repairman = repairmen.find(r => r.id === Number(reception.repairmanId))
        if (repairman) {
          statuses.value[1].note = `در حال بررسی توسط ${repairman.fullName}`
        }
      }
    } else {
      alert('اطلاعاتی با این شماره پیگیری یافت نشد')
      router.push('/customer/login')
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