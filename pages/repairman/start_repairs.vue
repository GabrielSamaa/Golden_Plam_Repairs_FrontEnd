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
                    <div class="position-relative">
                      <input 
                        type="text" 
                        class="form-control" 
                        v-model="part.name"
                        placeholder="نام قطعه را وارد کنید"
                        @input="searchParts(index)"
                        @focus="showSuggestions(index)"
                        @blur="hideSuggestions(index)"
                      >
                      <!-- لیست پیشنهادات -->
                      <div v-if="showSuggestionList === index && filteredParts.length > 0" 
                           class="suggestions-list">
                        <div v-for="suggestedPart in filteredParts" 
                             :key="suggestedPart.name"
                             class="suggestion-item"
                             @mousedown="selectPart(index, suggestedPart)">
                          <span>{{ suggestedPart.name }}</span>
                          <small class="text-muted">{{ suggestedPart.price.toLocaleString() }} تومان</small>
                        </div>
                      </div>
                    </div>
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
  const showSuggestionList = ref(-1)
  const filteredParts = ref([])
  
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
  
  // بارگذاری قطعات پیشنهادی از localStorage
  const savedParts = computed(() => {
    return JSON.parse(localStorage.getItem('suggested_parts') || '[]')
  })
  
  // جستجوی قطعات پیشنهادی
  const searchParts = (index) => {
    const searchTerm = parts.value[index].name.toLowerCase()
    if (searchTerm.length < 2) {
      filteredParts.value = []
      return
    }
    
    filteredParts.value = savedParts.value.filter(part => 
      part.name.toLowerCase().includes(searchTerm)
    ).slice(0, 5) // حداکثر 5 پیشنهاد
  }
  
  // نمایش لیست پیشنهادات
  const showSuggestions = (index) => {
    showSuggestionList.value = index
    searchParts(index)
  }
  
  // مخفی کردن لیست پیشنهادات
  const hideSuggestions = () => {
    setTimeout(() => {
      showSuggestionList.value = -1
    }, 200)
  }
  
  // انتخاب قطعه از لیست پیشنهادات
  const selectPart = (index, suggestedPart) => {
    parts.value[index] = { ...suggestedPart }
    calculateTotal()
    showSuggestionList.value = -1
  }
  
  // ذخیره قطعه جدید در لیست پیشنهادات
  const saveToSuggestedParts = (part) => {
    if (!part.name.trim() || !part.price) return
    
    const suggestedParts = savedParts.value
    const existingIndex = suggestedParts.findIndex(p => p.name === part.name)
    
    if (existingIndex === -1) {
      // اضافه کردن قطعه جدید
      suggestedParts.push({
        name: part.name,
        price: Number(part.price),
        lastUsed: new Date().toISOString()
      })
    } else {
      // به‌روزرسانی قیمت و زمان استفاده
      suggestedParts[existingIndex] = {
        ...suggestedParts[existingIndex],
        price: Number(part.price),
        lastUsed: new Date().toISOString()
      }
    }
    
    // مرتب‌سازی بر اساس آخرین استفاده
    suggestedParts.sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))
    
    // ذخیره در localStorage
    localStorage.setItem('suggested_parts', JSON.stringify(suggestedParts))
  }
  
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
  
    // ذخیره قطعات در لیست پیشنهادات
    parts.value.forEach(part => {
      saveToSuggestedParts(part)
    })
  
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
        const repair = repairs[repairIndex]
        repair.parts = parts.value
        repair.totalPartsPrice = totalPrice.value
        repair.financialStatus = {
          totalCost: totalPrice.value,
          partsCost: totalPrice.value,
          laborCost: repair.statement - totalPrice.value,
          lastUpdate: new Date().toLocaleString('fa-IR'),
          status: 'pending'
        }
        
        // ایجاد رکورد مالی
        const financialRecords = JSON.parse(localStorage.getItem('financial_records') || '[]')
        const existingRecordIndex = financialRecords.findIndex(r => r.repairId === Number(route.query.id))
        
        const financialRecord = {
          id: `FIN-${repair.id}`,
          repairId: repair.id,
          trackingNumber: repair.trackingNumber,
          customerName: repair.customerName,
          deviceType: repair.deviceType,
          date: repair.date,
          parts: parts.value,
          totalPartsCost: totalPrice.value,
          laborCost: repair.statement - totalPrice.value,
          totalCost: repair.statement,
          status: 'pending',
          type: 'repair',
          description: `تعمیر ${repair.deviceType} - ${repair.issue}`,
          lastUpdate: new Date().toLocaleString('fa-IR')
        }

        if (existingRecordIndex !== -1) {
          financialRecords[existingRecordIndex] = financialRecord
        } else {
          financialRecords.push(financialRecord)
        }

        localStorage.setItem('financial_records', JSON.stringify(financialRecords))
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
  
  .suggestions-list {
    position: absolute;
    top: 100%;
    right: 0;
    left: 0;
    z-index: 1000;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    max-height: 200px;
    overflow-y: auto;
  }
  
  .suggestion-item {
    padding: 8px 12px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
  }
  
  .suggestion-item:last-child {
    border-bottom: none;
  }
  
  .suggestion-item:hover {
    background-color: #f8f9fa;
  }
  
  .suggestion-item small {
    font-size: 0.8rem;
    color: #6c757d;
  }
  
  .position-relative {
    position: relative;
  }
  </style>