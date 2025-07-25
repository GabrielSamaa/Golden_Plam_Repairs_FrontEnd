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
                    <!-- <button 
                      class="btn btn-sm btn-danger mx-1" 
                      @click="removePart(index)"
                      :disabled="parts.length <= 1" -->
                    <!-- >
                      <i class="fas fa-trash"></i>
                    </button> -->
                    <button 
                      class="btn btn-sm btn-warning mx-1" 
                      @click="duplicatePart(index)"
                    >
                      <i class="fas fa-copy"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-info mx-1"
                      @click="openEditModal(index)"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger mx-1"
                      @click="deletePartFromDB(index)"
                      v-if="part.id"
                    >
                      <i class="fas fa-trash-alt"></i>
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
  <!-- مدال ویرایش قطعه -->
  <div v-if="showEditModal" class="modal-backdrop">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">ویرایش قطعه</h5>
        <button type="button" class="btn-close" @click="closeEditModal"></button>
      </div>
      <div class="modal-body">
        <div class="mb-3">
          <label class="form-label">نام قطعه</label>
          <input type="text" class="form-control" v-model="editPartData.description">
        </div>
        <div class="mb-3">
          <label class="form-label">قیمت</label>
          <input type="number" class="form-control" v-model="editPartData.price">
        </div>
        <div class="mb-3">
          <label class="form-label">دسته‌بندی</label>
          <input type="number" class="form-control" v-model="editPartData.category_id">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="closeEditModal">انصراف</button>
        <button class="btn btn-primary" @click="submitEditPart">ذخیره تغییرات</button>
      </div>
    </div>
  </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useNuxtApp } from '#app'
  
  const route = useRoute()
  const router = useRouter()
  const repairInfo = ref(null)
  const showSuggestionList = ref(-1)
  const filteredParts = ref([])
  const showEditModal = ref(false)
  const editPartIndex = ref(null)
  const editPartData = ref({ id: null, description: '', price: 0, category_id: 1 })

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
  onMounted(async () => {
    const repairId = route.query.id
    if (repairId) {
      const repairs = JSON.parse(localStorage.getItem('receptions') || '[]')
      repairInfo.value = repairs.find(r => r.id === Number(repairId))
      await fetchPartsFromDB(repairId)
    }
  })

  const fetchPartsFromDB = async (repairId) => {
    try {
      const { $axios } = useNuxtApp()
      const response = await $axios.get('/device/description', { params: { device_id: repairId } })
      parts.value = Array.isArray(response.data)
        ? response.data.map(part => ({ ...part, name: part.description }))
        : []
    } catch (e) {
      parts.value = []
    }
  }
  
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

  const openEditModal = (index) => {
    const part = parts.value[index]
    editPartIndex.value = index
    editPartData.value = {
      id: part.id,
      description: part.name || part.description || '',
      price: part.price,
      category_id: part.category_id || repairInfo.value?.category_id || 1
    }
    showEditModal.value = true
  }
  const closeEditModal = () => {
    showEditModal.value = false
  }
  const submitEditPart = async () => {
    const { id, description, price, category_id } = editPartData.value
    if (!id) {
      alert('شناسه قطعه نامعتبر است')
      return
    }
    try {
      const { $axios } = useNuxtApp()
      await $axios.put(`/device/description/${id}`, {
        description,
        price: Number(price),
        category_id: Number(category_id)
      })
      alert('قطعه با موفقیت ویرایش شد')
      closeEditModal()
      await fetchPartsFromDB(route.query.id)
    } catch (error) {
      alert('خطا در ویرایش قطعه: ' + (error?.response?.data?.message || error.message))
    }
  }
  const deletePartFromDB = async (index) => {
    const part = parts.value[index]
    if (!part.id) {
      alert('شناسه قطعه نامعتبر است')
      return
    }
    if (!confirm('آیا از حذف این قطعه مطمئن هستید؟')) return
    try {
      const { $axios } = useNuxtApp()
      await $axios.delete(`/device/description/${part.id}`)
      alert('قطعه با موفقیت حذف شد')
      await fetchPartsFromDB(route.query.id)
    } catch (error) {
      alert('خطا در حذف قطعه: ' + (error?.response?.data?.message || error.message))
    }
  }
  
  // ثبت نهایی قطعات
  const submitParts = async () => {
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

    const repairId = route.query.id
    if (!repairId) {
      alert('شناسه تعمیر یافت نشد')
      return
    }

    // فرض: همه قطعات دسته‌بندی یکسان دارند (از repairInfo)
    const categoryId = repairInfo.value?.category_id || 1

    try {
      const { $axios } = useNuxtApp()
      // فقط قطعات جدید (بدون id) را ثبت کن
      for (const part of parts.value) {
        if (!part.id) {
          await $axios.post('/device/description', {
            description: part.name,
            price: Number(part.price),
            category_id: categoryId
          })
        }
      }
      alert('قطعات جدید با موفقیت در دیتابیس ذخیره شدند')
      await fetchPartsFromDB(repairId)
    } catch (error) {
      console.log('خطای کامل:', error?.response?.data)
      alert('خطا در ارتباط با سرور: ' + (error?.response?.data?.message || error.message))
      return
    }

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

  .modal-backdrop {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.3);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .modal-content {
    background: #fff;
    border-radius: 8px;
    padding: 24px;
    min-width: 320px;
    max-width: 90vw;
    box-shadow: 0 2px 16px rgba(0,0,0,0.2);
  }
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
    margin-bottom: 12px;
  }
  .modal-title {
    font-size: 1.2rem;
    font-weight: bold;
  }
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;
  }
  .btn-close {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
  }
  </style>