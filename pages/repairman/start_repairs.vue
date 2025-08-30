<template>

  <!-- لودینگ Overlay برای بارگذاری اولیه -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
      <p class="loading-text">در حال بارگذاری اطلاعات...</p>
    </div>


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
                      <div v-if="showSuggestionList === index" class="suggestions-list">
                        <div
                          v-for="suggestion in filteredParts"
                          :key="suggestion.name"
                          class="suggestion-item"
                          @mousedown="selectPart(index, suggestion)"
                        >
                          <span>{{ suggestion.name }}</span>
                          <small>{{ suggestion.price.toLocaleString() }} تومان</small>
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
                    <!-- <button
                      class="btn btn-sm btn-info mx-1"
                      @click="openEditModal(index)"
                    > -->
                      <!-- <i class="fas fa-edit"></i> -->
                    <!-- </button> -->
                    <button
                      class="btn btn-sm btn-outline-danger mx-1"
                      @click="deletePartFromDB(index)"
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
  <!-- <div v-if="showEditModal" class="modal-backdrop">
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
    </div> -->
  <!-- </div> -->
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
  const isLoading = ref(false);
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
    isLoading.value = true
    const { $axios } = useNuxtApp()
    const response = await $axios.get(`/device/repair/${repairId}`)
    
    // پارس کردن repair_details اگر به صورت string است
    let repairDetails
    if (typeof response.data.repair_details === 'string') {
      repairDetails = JSON.parse(response.data.repair_details)
    } else {
      repairDetails = response.data.repair_details
    }

    // تبدیل به آرایه
    parts.value = Array.isArray(repairDetails) 
      ? repairDetails.map(part => ({
          name: part.part_name,
          price: Number(part.part_price),
          id: part.part_id,
          verification_code: part.verification_code
        }))
      : []

   
  } catch (e) {
   
    parts.value = []
  }

  finally {
    isLoading.value = false
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
    parts.value[index] = { 
      name: suggestedPart.name,
      price: Number(suggestedPart.price),
      id: suggestedPart.id
    }
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
      Command: toastr["warning"]("شناسه قطعه نامعتبر است", "هشدار")

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

      return
    }
    try {
      const { $axios } = useNuxtApp()
      await $axios.put(`/device/description/${id}`, {
        description,
        price: Number(price),
        category_id: Number(category_id)
      })
      Command: toastr["success"]("قطعه با موفقیت ویرایش شد", "ویرایش موفق")

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
      closeEditModal()
      await fetchPartsFromDB(route.query.id)
    } catch (error) {
      Command: toastr["error"]("خطا در ویرایش قطعه", "خطا")

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
  const deletePartFromDB = async (index) => {
  const partToDelete = parts.value[index]
  if (!confirm('آیا از حذف این قطعه مطمئن هستید؟')) return
  
  try {
    const repairId = route.query.id
    const { $axios } = useNuxtApp()
    
    // دریافت لیست فعلی
    const response = await $axios.get(`/device/repair/${repairId}`)
    let repairDetails = []
    
    // تبدیل repair_details به آرایه اگر رشته JSON است
    if (typeof response.data.repair_details === 'string') {
      repairDetails = JSON.parse(response.data.repair_details)
    } else {
      repairDetails = response.data.repair_details || []
    }

    // حذف قطعه با مطابقت نام و قیمت
    const updatedDetails = repairDetails.filter(part => 
      !(part.part_name === partToDelete.name && 
        Number(part.part_price) === Number(partToDelete.price))
    )
    
    // آپدیت repair_details با لیست جدید
    await $axios.patch(`/device/repair/${repairId}`, {
      repair_details: updatedDetails
    })

    // بروزرسانی لیست محلی
    parts.value = parts.value.filter((_, i) => i !== index)
    Command: toastr["success"]("قطعه با موفقیت حذف شد", "حذف موفق")

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
    
  } catch (error) {
   
    Command: toastr["error"]("خطا در حذف قطعه", "خطا")

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

  const replacedParts = ref([])

// بارگذاری اطلاعات تعمیر
onMounted(async () => {
  const repairId = route.query.id
  if (repairId) {
    const repairs = JSON.parse(localStorage.getItem('receptions') || '[]')
    repairInfo.value = repairs.find(r => r.id === Number(repairId))
    await fetchPartsFromDB(repairId)
    await fetchReplacedParts(repairId) // بارگذاری قطعات تعویض شده
  }
})

// تابع برای بارگذاری قطعات تعویض شده
const fetchReplacedParts = async (repairId) => {
  try {
    const { $axios } = useNuxtApp()
    const response = await $axios.get(`/device/repair/${repairId}`)
    
    // تبدیل به آرایه در هر حالت
    const repairDetails = Array.isArray(response?.data?.repair_details)
      ? response.data.repair_details
      : []

    replacedParts.value = repairDetails.filter(
      part => part?.verification_code === response?.data?.verification_code
    )

  } catch (error) {
   
    replacedParts.value = []
  }
}

// تابع برای فرمت تاریخ
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('fa-IR', options)
}

// تابع برای حذف قطعه تعویض شده
const removeReplacedPart = async (partId, index) => {
  if (!confirm('آیا از حذف این قطعه از تاریخچه مطمئن هستید؟')) return
  
  try {
    const repairId = route.query.id
    const { $axios } = useNuxtApp()
    
    // ابتدا لیست فعلی را دریافت می‌کنیم
    const response = await $axios.get(`/device/repair/${repairId}`)
    let repairDetails = response.data.repair_details || []
    
    // فیلتر کردن برای حذف قطعه مورد نظر
    repairDetails = repairDetails.filter((_, i) => i !== index)
    
    // آپدیت لیست جدید
    await $axios.patch(`/device/repair/${repairId}`, {
      repair_details: repairDetails
    })
    
    // بارگذاری مجدد لیست
    await fetchReplacedParts(repairId)
    Command: toastr["success"]("قطعه با موفقیت از تاریخچه حذف شد", "حذف موفق")

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
  } catch (error) {
    
    Command: toastr["error"]("خطا در حذف قطعه", "خطا")

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
  
// ثبت نهایی قطعات
const submitParts = async () => {
  // اعتبارسنجی
  const hasEmptyFields = parts.value.some(part => !part.name.trim() || !part.price)
  if (hasEmptyFields) {
    Command: toastr["warning"]("لطفا اطلاعات تمام قطعات را تکمیل کنید", "هشدار")

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
    return
  }

  // ذخیره قطعات در لیست پیشنهادات
  parts.value.forEach(part => {
    saveToSuggestedParts(part)
  })

  const repairId = route.query.id
  if (!repairId) {
    Command: toastr["warning"]("شناسه تعمیر یافت نشد", "هشدار")

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
    return
  }

  try {
    const { $axios } = useNuxtApp()
    // ساخت آرایه جدید برای repair_details
    const newReplacedParts = parts.value.map(part => ({
      part_id: part.id,
      part_name: part.name,
      part_price: Number(part.price),
      replaced_at: new Date().toISOString()
    }))

    // آپدیت repair_details در /device/repair/{repairId}
    await $axios.patch(`/device/repair/${repairId}`, {
      repair_details: newReplacedParts
    })

    Command: toastr["success"]("اطلاعات قطعات با موفقیت ذخیره شدند", "ثبت موفق")

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
    await fetchPartsFromDB(repairId)
    router.push('/repairman/index_repairs')
  } catch (error) {
   
    Command: toastr["error"]("خطا در ارتباط با سرور", "خطا")

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
    return
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