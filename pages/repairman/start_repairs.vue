<template>
    <div class="parts-management">
      <div class="card">
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <button class="btn btn-light" @click="goBack">
            <i class="fas fa-arrow-right me-2"></i>
            بازگشت
          </button>
          <h3 class="mb-0">شروع تعمیرات</h3>
          <div style="width: 100px"></div> <!-- برای حفظ تعادل در هدر -->
        </div>
        <div class="card-body">
          <!-- اطلاعات تعمیر -->
          <div class="repair-info mb-4" v-if="repairInfo">
            <div class="row">
              <div class="col-md-6">
                <p><strong>شماره پیگیری:</strong> {{ repairInfo.trackingNumber }}</p>
                <p><strong>نام مشتری:</strong> {{ repairInfo.customerName }}</p>
              </div>
              <div class="col-md-6">
                <p><strong>نوع دستگاه:</strong> {{ repairInfo.deviceType }}</p>
                <p><strong>دسته‌بندی:</strong> {{ repairInfo.category }}</p>
              </div>
            </div>
          </div>

          <!-- دکمه افزودن قطعه جدید -->
          <div class="mb-4">
            <button class="btn btn-success" @click="addNewPart">
              <i class="fas fa-plus me-2"></i> افزودن قطعه جدید
            </button>
          </div>
  
          <!-- جدول قطعات -->
          <div class="table-responsive">
            <table class="table table-bordered table-hover">
              <thead class="table-light">
                <tr>
                  <th width="5%">#</th>
                  <th>نام قطعه</th>
                  <th width="25%">قیمت (تومان)</th>
                  <th width="15%">عملیات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(part, index) in parts" :key="index">
                  <td>{{ index + 1 }}</td>
                  <td>
                    <input 
                      type="text" 
                      class="form-control" 
                      v-model="part.name"
                      placeholder="نام قطعه را وارد کنید"
                    >
                  </td>
                  <td>
                    <input 
                      type="number" 
                      class="form-control text-left" 
                      v-model="part.price"
                      placeholder="قیمت را وارد کنید"
                      @input="calculateTotal"
                    >
                  </td>
                  <td>
                    <button 
                      class="btn btn-sm btn-danger mx-1" 
                      @click="removePart(index)"
                      :disabled="parts.length <= 1"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                    <button 
                      class="btn btn-sm btn-warning mx-1" 
                      @click="duplicatePart(index)"
                    >
                      <i class="fas fa-copy"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" class="text-end fw-bold">جمع کل:</td>
                  <td class="text-start fw-bold">{{ totalPrice.toLocaleString() }} تومان</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
  
          <!-- دکمه ثبت نهایی -->
          <div class="mt-4 text-center">
            <button class="btn btn-primary btn-lg" @click="submitParts">
              <i class="fas fa-check-circle me-2"></i> ثبت نهایی قطعات
            </button>
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
  const repairInfo = ref(null)
  
  // لیست قطعات
  const parts = ref([
    { name: '', price: 0 }
  ])
  
  // محاسبه جمع کل قیمت‌ها
  const totalPrice = computed(() => {
    return parts.value.reduce((sum, part) => {
      return sum + (Number(part.price) || 0)
    }, 0)
  })
  
  // بارگذاری اطلاعات تعمیر
  onMounted(() => {
    const repairId = route.query.id
    if (repairId) {
      const repairs = JSON.parse(localStorage.getItem('receptions') || '[]')
      repairInfo.value = repairs.find(r => r.id === Number(repairId))
      
      // بارگذاری قطعات ذخیره شده برای این تعمیر
      const savedParts = localStorage.getItem(`repair_parts_${repairId}`)
      if (savedParts) {
        parts.value = JSON.parse(savedParts)
      }
    }
  })
  
  // بازگشت به صفحه قبل
  const goBack = () => {
    router.push('/repairman/index_repairs')
  }
  
  // افزودن قطعه جدید
  const addNewPart = () => {
    parts.value.push({ name: '', price: 0 })
  }
  
  // حذف قطعه
  const removePart = (index) => {
    if (parts.value.length > 1) {
      parts.value.splice(index, 1)
      calculateTotal()
    }
  }
  
  // کپی کردن قطعه
  const duplicatePart = (index) => {
    const part = { ...parts.value[index] }
    parts.value.splice(index + 1, 0, part)
  }
  
  // محاسبه مجدد جمع کل
  const calculateTotal = () => {
    // این تابع برای محاسبه reactive است
    // چون از computed استفاده کردیم، نیاز به اجرای دستی نیست
  }
  
  // ثبت نهایی قطعات
  const submitParts = () => {
    // اعتبارسنجی
    const hasEmptyFields = parts.value.some(part => !part.name.trim() || !part.price)
    
    if (hasEmptyFields) {
      alert('لطفاً اطلاعات تمام قطعات را تکمیل کنید')
      return
    }
  
    // آماده کردن داده برای ارسال
    const dataToSend = {
      repairId: route.query.id,
      parts: parts.value,
      total: totalPrice.value,
      date: new Date().toLocaleString('fa-IR')
    }
  
    // ذخیره قطعات در localStorage
    if (route.query.id) {
      localStorage.setItem(`repair_parts_${route.query.id}`, JSON.stringify(parts.value))
      
      // به‌روزرسانی وضعیت تعمیر در لیست اصلی
      const repairs = JSON.parse(localStorage.getItem('receptions') || '[]')
      const repairIndex = repairs.findIndex(r => r.id === Number(route.query.id))
      if (repairIndex !== -1) {
        repairs[repairIndex].parts = parts.value
        repairs[repairIndex].totalPartsPrice = totalPrice.value
        localStorage.setItem('receptions', JSON.stringify(repairs))
      }
    }
    
    alert(`اطلاعات ${parts.value.length} قطعه با موفقیت ثبت شد\nجمع کل: ${totalPrice.value.toLocaleString()} تومان`)
    
    // بازگشت به صفحه لیست تعمیرات
    router.push('/repairman/index_repairs')
  }
  </script>
  
  <style scoped>
  .parts-management {
    direction: rtl;
    font-family: Vazir, sans-serif;
  }
  
  .repair-info {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
  }
  
  .repair-info p {
    margin-bottom: 8px;
  }
  
  .table th {
    background-color: #f8f9fa;
    text-align: center;
  }
  
  input.form-control {
    text-align: right;
  }
  
  input[type="number"].form-control {
    direction: ltr;
  }
  
  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
  }
  
  .btn-lg {
    padding: 0.5rem 1.5rem;
    font-size: 1.1rem;
  }
  
  .text-start {
    text-align: left !important;
  }
  
  .text-end {
    text-align: right !important;
  }
  
  .mx-1 {
    margin-right: 0.25rem !important;
    margin-left: 0.25rem !important;
  }
  
  .me-2 {
    margin-left: 0.5rem !important;
    margin-right: 0 !important;
  }
  
  @media (max-width: 768px) {
    .table-responsive {
      overflow-x: auto;
    }
    
    .btn-lg {
      width: 100%;
    }
    
    .repair-info {
      padding: 10px;
    }
  }
  </style>