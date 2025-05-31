<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h2>ورود به سیستم</h2>
        <p>لطفاً اطلاعات ورود خود را وارد کنید</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>نوع کاربر</label>
          <select class="form-control" v-model="userType" required>
            <option value="repairman">تعمیرکار</option>
            <option value="admin">مدیر سیستم</option>
          </select>
        </div>

        <div class="form-group">
          <label>نام کاربری</label>
          <input 
            type="text" 
            class="form-control" 
            v-model="loginForm.username" 
            required
            placeholder="نام کاربری خود را وارد کنید"
          >
        </div>

        <div class="form-group">
          <label>رمز عبور</label>
          <input 
            type="password" 
            class="form-control" 
            v-model="loginForm.password" 
            required
            placeholder="رمز عبور خود را وارد کنید"
          >
        </div>

        <div class="form-group" v-if="errorMessage">
          <div class="alert alert-danger">
            {{ errorMessage }}
          </div>
        </div>

        <button type="submit" class="btn btn-primary" :disabled="isLoading">
          <span v-if="isLoading">در حال ورود...</span>
          <span v-else>ورود به سیستم</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userType = ref('repairman')
const loginForm = ref({
  username: '',
  password: ''
})
const errorMessage = ref('')
const isLoading = ref(false)

const handleLogin = () => {
  isLoading.value = true
  errorMessage.value = ''

  if (userType.value === 'repairman') {
    // Handle repairman login
    const repairmen = JSON.parse(localStorage.getItem('repairmen') || '[]')
    const repairman = repairmen.find(r => r.username === loginForm.value.username)
    
    if (repairman) {
      if (repairman.password === loginForm.value.password) {
        if (repairman.status === 'active') {
          localStorage.setItem('currentRepairmanId', repairman.id)
          localStorage.setItem('userType', 'repairman')
          
          repairman.lastLogin = new Date().toLocaleString('fa-IR')
          localStorage.setItem('repairmen', JSON.stringify(repairmen))
          
          router.push('/repairman/index_repairs')
        } else {
          errorMessage.value = 'حساب کاربری شما غیرفعال است. لطفاً با مدیر سیستم تماس بگیرید.'
        }
      } else {
        errorMessage.value = 'رمز عبور اشتباه است'
      }
    } else {
      errorMessage.value = 'نام کاربری یافت نشد'
    }
  } else {
    // Handle admin login
    const admins = JSON.parse(localStorage.getItem('admins') || '[]')
    const admin = admins.find(a => a.username === loginForm.value.username)
    
    if (admin) {
      if (admin.password === loginForm.value.password) {
        if (admin.status === 'active') {
          localStorage.setItem('currentAdminId', admin.id)
          localStorage.setItem('userType', 'admin')
          
          admin.lastLogin = new Date().toLocaleString('fa-IR')
          localStorage.setItem('admins', JSON.stringify(admins))
          
          router.push('/admin/admins')
        } else {
          errorMessage.value = 'حساب کاربری شما غیرفعال است.'
        }
      } else {
        errorMessage.value = 'رمز عبور اشتباه است'
      }
    } else {
      errorMessage.value = 'نام کاربری یافت نشد'
    }
  }
  
  isLoading.value = false
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  padding: 20px;
}

.login-container {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.login-header p {
  color: #7f8c8d;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  color: #2c3e50;
  font-weight: 500;
}

.form-control {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  transition: all 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.btn {
  padding: 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.alert {
  padding: 10px;
  border-radius: 4px;
  font-size: 0.9rem;
}

.alert-danger {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

@media (max-width: 480px) {
  .login-container {
    padding: 20px;
  }
}
</style>