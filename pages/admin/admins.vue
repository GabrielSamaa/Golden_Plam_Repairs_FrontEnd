<template>
  <div class="repairmen-page">
    <div class="page-header">
      <h2>مدیریت تعمیرکاران</h2>
      <div class="header-actions">
        <div class="search-box">
          <input 
            type="text" 
            class="form-control" 
            v-model="searchQuery" 
            placeholder="جستجو در تعمیرکاران..."
          >
        </div>
        <button class="btn btn-primary" @click="showRepairmanForm = true">
          <i class="fas fa-plus"></i> افزودن تعمیرکار جدید
        </button>
      </div>
    </div>

    <div class="repairmen-table">
      <table class="table">
        <thead>
          <tr>
            <th>شماره تماس</th>
            <th>نام و نام خانوادگی</th>
            <!-- <th>تخصص</th> -->
            <!-- <th>وضعیت</th> -->
            <th>تاریخ ثبت‌نام</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="repairman in filteredRepairmen" :key="repairman.id">
            <td>{{ repairman.phone }}</td>
            <td>{{ repairman.fullName }}</td>
            <!-- <td>{{ getSpecialtyText(repairman.specialty) }}</td> -->
            <!-- <td>
              <span :class="'status-' + repairman.status">
                {{ getStatusText(repairman.status) }}
              </span>
            </td> -->
            <td>{{ formatDate(repairman.createdAt) }}</td>
            <td>
              <!-- <button class="btn btn-sm btn-outline-primary" @click="viewRepairman(repairman)">
                <i class="fas fa-eye"></i>
              </button> -->
              <button class="btn btn-sm btn-outline-success" @click="editRepairman(repairman)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" @click="deleteRepairman(repairman.id)">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Repairman Form Modal -->
    <div class="modal" :class="{ show: showRepairmanForm }">
      <div class="modal-content">
        <div class="modal-header">
          <h5>{{ isEditing ? 'ویرایش تعمیرکار' : 'افزودن تعمیرکار جدید' }}</h5>
          <button @click="closeRepairmanForm">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitRepairmanForm">
            <div class="form-group">
              <label>شماره تماس</label>
              <input 
                type="tel" 
                class="form-control" 
                v-model="repairmanForm.phone" 
                required
                placeholder="09xxxxxxxxx"
                pattern="09[0-9]{9}"
                maxlength="11"
                dir="ltr"
              >
            </div>
            <div class="form-group">
              <label>نام و نام خانوادگی</label>
              <input 
                type="text" 
                class="form-control" 
                v-model="repairmanForm.fullName" 
                required
              >
            </div>
            <!-- <div class="form-group">
              <label>تخصص</label>
              <select class="form-control" v-model="repairmanForm.specialty" required>
                <option value="mobile">موبایل</option>
                <option value="laptop">لپ‌تاپ</option>
                <option value="tablet">تبلت</option>
                <option value="general">عمومی</option>
              </select>
            </div> -->
            <!-- <div class="form-group">
              <label>وضعیت</label>
              <select class="form-control" v-model="repairmanForm.status" required>
                <option value="active">فعال</option>
                <option value="inactive">غیرفعال</option>
              </select>
            </div> -->
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="closeRepairmanForm">
                انصراف
              </button>
              <button type="submit" class="btn btn-primary">
                {{ isEditing ? 'ویرایش' : 'افزودن' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useNuxtApp } from '#app';

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const { $axios } = useNuxtApp();
const router = useRouter()
const showRepairmanForm = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const repairmanForm = ref({
  fullName: '',
  phone: '',
  specialty: 'mobile',
  status: 'active'
})

const repairmen = ref([])
const searchQuery = ref('')

// Load repairmen from localStorage
onMounted(() => {
  const savedRepairmen = JSON.parse(localStorage.getItem('repairmen') || '[]')
  if (savedRepairmen.length > 0) {
    repairmen.value = savedRepairmen
  }
})

const getStatusText = (status) => {
  const statusMap = {
    'active': 'فعال',
    'inactive': 'غیرفعال'
  }
  return statusMap[status] || status
}

const getSpecialtyText = (specialty) => {
  const specialtyMap = {
    'mobile': 'موبایل',
    'laptop': 'لپ‌تاپ',
    'tablet': 'تبلت',
    'general': 'عمومی'
  }
  return specialtyMap[specialty] || specialty
}

const formatDate = (dateString) => {
  if (!dateString) return 'نامشخص'
  const date = new Date(dateString)
  return date.toLocaleDateString('fa-IR')
}

const viewRepairman = (repairman) => {
  router.push(`/repairman/${repairman.id}`)
}

const editRepairman = (repairman) => {
  editingId.value = repairman.id
  repairmanForm.value = {
    fullName: repairman.fullName,
    phone: repairman.phone,
    specialty: repairman.specialty,
    status: repairman.status
  }
  showRepairmanForm.value = true
}

const deleteRepairman = (id) => {
  if (confirm('آیا از حذف این تعمیرکار اطمینان دارید؟')) {
    repairmen.value = repairmen.value.filter(r => r.id !== id)
    localStorage.setItem('repairmen', JSON.stringify(repairmen.value))
  }
}

const closeRepairmanForm = () => {
  showRepairmanForm.value = false
  isEditing.value = false
  editingId.value = null
  repairmanForm.value = {
    fullName: '',
    phone: '',
    specialty: 'mobile',
    status: 'active'
  }
}

const submitRepairmanForm = async () => {
  // Basic validation
  if (!repairmanForm.value.phone || !repairmanForm.value.fullName) {
    Command: toastr["warning"]("لطفا تمام فیلد های اجباری را پر کنید", "فیلد خالی است")

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
    return;
  }

  try {
    if (isEditing.value) {
      // Logic for updating an existing repairman (API call to update)
      // This part can be implemented later if needed
      const index = repairmen.value.findIndex(r => r.id === repairmanForm.value.id);
      if (index !== -1) {
        repairmen.value[index] = { ...repairmanForm.value };
        Command: toastr["success"]("اطلاعات تعمیرکار با موفقیت ویرایش شد", "ویرایش موفق")

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
    } else {
      // Logic for adding a new repairman
      // Match the payload keys with the backend validation rules
      const newUserPayload = {
        mobile: repairmanForm.value.phone,       // Changed from 'phone'
        name: repairmanForm.value.fullName,       // Changed from 'full_name'
        specialty: repairmanForm.value.specialty,
        status: repairmanForm.value.status,
        password: repairmanForm.value.phone, // Default password is phone number
        role: 2  // Changed from 'repairman' to the numeric value for the role
      };

      const response = await $axios.post('/user/create_user', newUserPayload);
      
      // Add the new repairman from the response to the local list
      repairmen.value.push(response.data);
      Command: toastr["success"]("تعمیر کار جدید با موفقیت اضافه شد", "تعمیرکار اضافه شد")

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

    // Save to localStorage (optional, but good for persistence)
    localStorage.setItem('repairmen', JSON.stringify(repairmen.value));
    closeRepairmanForm();

  } catch (error) {
    console.error('Error submitting repairman form:', error);
    Command: toastr["error"]("خطا در ثبت اطلاعات ; لطفا دوباره تلاش کنید", "خطا")

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
}

const filteredRepairmen = computed(() => {
  if (!searchQuery.value) return repairmen.value
  const query = searchQuery.value.toLowerCase()
  return repairmen.value.filter(repairman => 
    repairman.phone.toLowerCase().includes(query) ||
    repairman.fullName.toLowerCase().includes(query) ||
    repairman.specialty.toLowerCase().includes(query) ||
    repairman.status.toLowerCase().includes(query)
  )
})

// Add phone number validation
watch(() => repairmanForm.value.phone, (newValue) => {
  let cleaned = newValue.replace(/\D/g, '')
  
  if (!cleaned.startsWith('09') && cleaned.length > 0) {
    cleaned = '09' + cleaned
  }
  
  if (cleaned.length > 11) {
    cleaned = cleaned.slice(0, 11)
  }
  
  if (cleaned !== newValue) {
    repairmanForm.value.phone = cleaned
  }
})
</script>

<style scoped>
.repairmen-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

.search-box {
  width: 300px;
}

.repairmen-table {
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

.status-active { color: #2ecc71; }
.status-inactive { color: #e74c3c; }

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

.btn-outline-primary {
  background: transparent;
  border: 1px solid #3498db;
  color: #3498db;
}

.btn-outline-primary:hover {
  background: #3498db;
  color: white;
}

.btn-outline-danger {
  background: transparent;
  border: 1px solid #e74c3c;
  color: #e74c3c;
}

.btn-outline-danger:hover {
  background: #e74c3c;
  color: white;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
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

  .header-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .search-box {
    width: 100%;
  }

  .repairmen-table {
    padding: 10px;
  }

  .table th,
  .table td {
    padding: 8px;
  }

  .btn-sm {
    padding: 4px 8px;
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
