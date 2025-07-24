<template>
  <Header />
  <div class="login-page">
    <div class="container">
      <div class="login-card">
        <div class="card-header">
          <h2>ورود به سیستم پیگیری تعمیرات</h2>
          <p class="text-muted">برای مشاهده وضعیت تعمیرات خود، شماره تماس خود را وارد کنید</p>
        </div>

        <div class="card-body">
          <!-- فرم ورود شماره تلفن -->
          <form v-if="!codeSent" @submit.prevent="sendVerificationCode" class="login-form">
            <div class="form-group">
              <label for="phone">شماره تماس</label>
              <input
                v-model="phone"
                type="tel"
                class="form-control"
                id="phone"
                placeholder="شماره تماس خود را وارد کنید"
                pattern="09[0-9]{9}"
                maxlength="11"
                required
                dir="ltr"
              >
            </div>

            <button type="submit" class="btn btn-primary w-100" :disabled="isSendingCode || resendTimer > 0">
              <span v-if="isSendingCode">
                <i class="fas fa-spinner fa-spin"></i>
                در حال ارسال...
              </span>
              <span v-else-if="resendTimer > 0">
                <i class="fas fa-clock"></i>
                ارسال مجدد ({{ formatTime(resendTimer) }})
              </span>
              <span v-else>
                <i class="fas fa-paper-plane"></i>
                ارسال کد تأیید
              </span>
            </button>
          </form>

          <!-- فرم وارد کردن کد تایید -->
          <form v-else @submit.prevent="verifyCode" class="login-form">
            <div class="form-group">
              <label>کد تأیید پیامک شده را وارد کنید:</label>
              <input 
                type="text" 
                v-model="smsCode" 
                class="form-control"
                placeholder="کد 6 رقمی"
                maxlength="6"
                :class="{ 'is-invalid': error }"
                required
              >
              <div class="invalid-feedback" v-if="error">
                {{ error }}
              </div>
            </div>

            <button type="submit" class="btn btn-primary w-100" :disabled="isVerifying || !smsCode">
              <span v-if="isVerifying">
                <i class="fas fa-spinner fa-spin"></i>
                در حال بررسی...
              </span>
              <span v-else>
                <i class="fas fa-check"></i>
                تأیید کد
              </span>
            </button>

            <button 
              type="button" 
              class="btn btn-link w-100 mt-2" 
              @click="resendCode"
              :disabled="isSendingCode || resendTimer > 0"
            >
              <span v-if="resendTimer > 0">
                ارسال مجدد ({{ formatTime(resendTimer) }})
              </span>
              <span v-else>
                ارسال مجدد کد
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useNuxtApp } from '#app'
import Header from '~/components/Header.vue'
import RepairCard from '~/components/RepairCard.vue'

const { $axios } = useNuxtApp()
const router = useRouter()
const phone = ref('')
const smsCode = ref('')
const error = ref('')
const isSendingCode = ref(false)
const isVerifying = ref(false)
const codeSent = ref(false)
const resendTimer = ref(0)
let timerInterval = null

// فرمت کردن زمان به دقیقه و ثانیه
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// شروع تایمر
const startResendTimer = (duration = 120) => {
  resendTimer.value = duration
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    if (resendTimer.value > 0) {
      resendTimer.value--
    } else {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }, 1000)
}

// کنترل ورودی شماره تلفن
watch(phone, (newValue) => {
  if (typeof newValue !== 'string') {
    phone.value = ''
    return
  }
  let cleaned = newValue.replace(/\D/g, '')
  if (!cleaned.startsWith('09') && cleaned.length > 0) {
    cleaned = '09' + cleaned
  }
  if (cleaned.length > 11) {
    cleaned = cleaned.slice(0, 11)
  }
  if (cleaned !== newValue) {
    phone.value = cleaned
  }
})

// ارسال کد تأیید
const sendVerificationCode = async () => {
  const phoneStr = typeof phone.value === 'string' ? phone.value : ''
  console.log('sending code', phoneStr) // Debug log
  if (!phoneStr || phoneStr.length !== 11) {
    error.value = 'لطفاً شماره تماس را به درستی وارد کنید'
    return
  }
  isSendingCode.value = true
  error.value = ''
  try {
    const response = await $axios.post('/user/auth', {
      mobile: phoneStr
    })
    console.log('response from /user/auth:', response) // Debug log
    if (response.status === 200 && response.data?.message) {
      codeSent.value = true
      startResendTimer()
    } else if (response.data?.message) {
      error.value = response.data.message
    } else {
      error.value = response.data?.message || 'خطا در ارسال کد تأیید'
    }
  } catch (err) {
    error.value = 'اتصال به سرور برقرار نشد'
    console.error('Error sending verification code:', err)
  } finally {
    isSendingCode.value = false
  }
}

// ارسال مجدد کد
const resendCode = () => {
  if (resendTimer.value > 0) return
  smsCode.value = ''
  sendVerificationCode()
}

// بررسی کد پیامک
const verifyCode = async () => {
  const phoneStr = typeof phone.value === 'string' ? phone.value : ''
  if (!smsCode.value || smsCode.value.length !== 6) {
    error.value = 'لطفاً کد 6 رقمی را وارد کنید'
    return
  }
  isVerifying.value = true
  error.value = ''
  try {
    const response = await $axios.post('/user/login', {
      mobile: phoneStr,
      code: smsCode.value
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    })
    if (response.data?.access_token) {
      localStorage.setItem('role', '3')
      localStorage.setItem('currentUser', JSON.stringify(response.data.user))
      sessionStorage.setItem('auth_token', response.data.access_token)
      router.push(`/customer/my_repairs?phone=${phoneStr}`)
    } else {
      error.value = response.data?.message || 'کد وارد شده صحیح نیست'
    }
  } catch (err) {
    if (err.response) {
      error.value = err.response.data?.message || 'خطای سرور'
    } else if (err.request) {
      error.value = 'اتصال به سرور برقرار نشد'
    } else {
      error.value = 'خطا در ارسال درخواست'
    }
    console.error('Error verifying code:', err)
  } finally {
    isVerifying.value = false
  }
}

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})

// اضافه کردن استایل‌های جدید
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  padding: 40px 20px;
  background: #f8f9fa;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.login-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  margin-bottom: 30px;
}

.card-header {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.card-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.card-header p {
  margin: 10px 0 0;
  color: #7f8c8d;
}

.card-body {
  padding: 20px;
}

.login-form {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 500;
}

.input-group {
  display: flex;
}

.input-group-text {
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-left: none;
  padding: 8px 12px;
  border-radius: 0 4px 4px 0;
  color: #7f8c8d;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  transition: all 0.3s;
  text-align: left;
  direction: ltr;
}

.form-control:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

/* Repairs Section Styles */
.repairs-section {
  margin-top: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  padding: 20px;
}

.section-header {
  text-align: center;
  margin-bottom: 20px;
}

.section-title {
  color: #2c3e50;
  margin: 0;
  font-size: 1.2rem;
}

.section-subtitle {
  color: #7f8c8d;
  margin: 5px 0 0;
  font-size: 0.9rem;
}

.repairs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 10px;
}

@media (max-width: 768px) {
  .login-page {
    padding: 20px 10px;
  }

  .repairs-grid {
    grid-template-columns: 1fr;
  }

  .repairs-section {
    margin: 20px 10px;
    padding: 15px;
  }
}

/* حذف استایل‌های مربوط به tabs */
.tabs, .tab-btn {
  display: none;
}

.btn-link {
  color: #3498db;
  text-decoration: none;
  padding: 0;
  font-size: 0.9rem;
  background: none;
  border: none;
  cursor: pointer;
}

.btn-link:hover:not(:disabled) {
  color: #2980b9;
  text-decoration: underline;
}

.btn-link:disabled {
  color: #95a5a6;
  cursor: not-allowed;
}

.form-control.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 5px;
}

.mt-2 {
  margin-top: 0.5rem;
}
</style> 