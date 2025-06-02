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

      <!-- نمایش لیست تعمیرات -->
      <div v-if="userRepairs.length > 0" class="repairs-section">
        <div class="section-header">
          <h3 class="section-title">تعمیرات شما</h3>
          <p class="section-subtitle">لیست تمام تعمیرات ثبت شده با این شماره تماس</p>
        </div>
        <div class="repairs-grid">
          <RepairCard
            v-for="repair in userRepairs"
            :key="repair.id"
            :repair="repair"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Header from '~/components/Header.vue'
import RepairCard from '~/components/RepairCard.vue'

const router = useRouter()
const phone = ref('')
const smsCode = ref('')
const error = ref('')
const isSendingCode = ref(false)
const isVerifying = ref(false)
const codeSent = ref(false)
const resendTimer = ref(0)
const userRepairs = ref([])
let timerInterval = null

// فرمت کردن زمان به دقیقه و ثانیه
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// شروع تایمر
const startResendTimer = () => {
  resendTimer.value = 120 // 2 دقیقه
  if (timerInterval) clearInterval(timerInterval)
  
  timerInterval = setInterval(() => {
    if (resendTimer.value > 0) {
      resendTimer.value--
    } else {
      clearInterval(timerInterval)
    }
  }, 1000)
}

// اضافه کردن watch برای کنترل ورودی شماره تلفن
watch(phone, (newValue) => {
  // حذف همه کاراکترهای غیر عددی
  let cleaned = newValue.replace(/\D/g, '')
  
  // اگر شماره با 09 شروع نشده، اضافه کن
  if (!cleaned.startsWith('09') && cleaned.length > 0) {
    cleaned = '09' + cleaned
  }
  
  // محدود کردن طول به 11 رقم
  if (cleaned.length > 11) {
    cleaned = cleaned.slice(0, 11)
  }
  
  // به‌روزرسانی مقدار اگر تغییر کرده باشد
  if (cleaned !== newValue) {
    phone.value = cleaned
  }
})

// ارسال کد تأیید
const sendVerificationCode = async () => {
  if (!phone.value || phone.value.length !== 11) {
    error.value = 'لطفاً شماره تماس را به درستی وارد کنید'
    return
  }

  isSendingCode.value = true
  error.value = ''

  try {
    // کد ثابت برای تست: 123456
    const verificationCode = '123456'
    
    // در اینجا باید کد را به سرور ارسال کنید و از آنجا پیامک شود
    const smsText = `کد تأیید ورود به سیستم پیگیری تعمیرات: ${verificationCode}\nتعمیرگاه طلایی پالم`
    
    // ذخیره کد در localStorage
    localStorage.setItem('loginVerificationCode', JSON.stringify({
      phone: phone.value,
      code: verificationCode,
      timestamp: new Date().toISOString()
    }))
    
    // نمایش پیام موفقیت
    alert(`کد تأیید به شماره ${phone.value} ارسال شد.\n\nکد تست: ${verificationCode}\n\nمتن پیامک:\n${smsText}`)
    codeSent.value = true
    startResendTimer()
  } catch (err) {
    error.value = 'خطا در ارسال کد تأیید'
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
  if (!smsCode.value || smsCode.value.length !== 6) {
    error.value = 'لطفاً کد 6 رقمی را وارد کنید'
    return
  }

  isVerifying.value = true
  error.value = ''

  try {
    // بررسی کد از localStorage
    const savedData = JSON.parse(localStorage.getItem('loginVerificationCode') || '{}')
    
    if (savedData.phone === phone.value && savedData.code === smsCode.value) {
      // کد صحیح است
      const receptions = JSON.parse(localStorage.getItem('receptions') || '[]')
      const foundRepairs = receptions.filter(r => r.phone.toString().trim() === phone.value)
      
      if (foundRepairs.length === 0) {
        alert('اطلاعاتی یافت نشد. لطفاً شماره تماس را با دقت وارد کنید.')
      } else {
        // هدایت به صفحه تعمیرات مشتری
        router.push(`/customer/my_repairs?phone=${phone.value}`)
      }
    } else {
      error.value = 'کد وارد شده صحیح نیست'
    }
  } catch (err) {
    error.value = 'خطا در بررسی کد'
    console.error('Error verifying code:', err)
  } finally {
    isVerifying.value = false
  }
}

// پاکسازی تایمر هنگام خروج از کامپوننت
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