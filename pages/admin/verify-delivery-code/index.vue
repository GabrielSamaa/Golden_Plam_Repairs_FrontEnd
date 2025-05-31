<template>
  <div class="verify-page" v-if="isPageReady">
    <div class="verify-container">
      <div class="verify-header">
        <h2>تأیید تحویل دستگاه</h2>
        <div class="device-info">
          <div class="info-section">
            <h4>اطلاعات دستگاه:</h4>
            <p>نوع دستگاه: {{ repair.deviceType }}</p>
            <p>شماره پیگیری: {{ repair.trackingNumber }}</p>
          </div>
          <div class="info-section">
            <h4>اطلاعات مشتری:</h4>
            <p>نام مشتری: {{ repair.customerName }}</p>
            <p>شماره تماس: {{ formatPhoneNumber(repair.phone) }}</p>
          </div>
        </div>
      </div>

      <div class="verify-form">
        <!-- دکمه ارسال کد -->
        <div class="send-code-section" v-if="!codeSent">
          <p class="text-muted mb-3">
            کد تأیید به شماره {{ formatPhoneNumber(repair.phone) }} ارسال خواهد شد.
          </p>
          <button 
            class="btn btn-info" 
            @click="sendVerificationCode"
            :disabled="isSendingCode || !repair.phone || resendTimer > 0"
          >
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
          <p class="text-danger mt-2" v-if="!repair.phone">
            شماره تماس مشتری در دسترس نیست
          </p>
        </div>

        <!-- فرم وارد کردن کد -->
        <div class="form-group" v-if="codeSent">
          <label>کد تأیید پیامک شده را وارد کنید:</label>
          <input 
            type="text" 
            v-model="smsCode" 
            class="form-control"
            placeholder="کد 6 رقمی"
            maxlength="6"
            :class="{ 'is-invalid': error }"
          >
          <div class="invalid-feedback" v-if="error">
            {{ error }}
          </div>
          <button 
            class="btn btn-link mt-2" 
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
        </div>

        <div class="verify-actions" v-if="codeSent">
          <button 
            class="btn btn-primary" 
            @click="verifyCode"
            :disabled="isLoading || !smsCode"
          >
            <span v-if="isLoading">
              <i class="fas fa-spinner fa-spin"></i>
              در حال بررسی...
            </span>
            <span v-else>
              <i class="fas fa-check"></i>
              تأیید کد
            </span>
          </button>
          <button 
            class="btn btn-secondary" 
            @click="goBack"
          >
            <i class="fas fa-arrow-right"></i>
            بازگشت
          </button>
        </div>
      </div>

      <!-- مودال تأیید نهایی -->
      <div class="modal" v-if="showFinalConfirm">
        <div class="modal-content">
          <div class="modal-header">
            <h3>تأیید نهایی تحویل</h3>
          </div>
          <div class="modal-body">
            <p>آیا از تحویل دستگاه به مشتری اطمینان دارید؟</p>
            <p class="text-muted">این عملیات غیرقابل بازگشت است.</p>
          </div>
          <div class="modal-footer">
            <button 
              class="btn btn-success" 
              @click="confirmDelivery"
              :disabled="isConfirming"
            >
              <span v-if="isConfirming">
                <i class="fas fa-spinner fa-spin"></i>
                در حال ثبت...
              </span>
              <span v-else>
                <i class="fas fa-check"></i>
                تأیید تحویل
              </span>
            </button>
            <button 
              class="btn btn-secondary" 
              @click="showFinalConfirm = false"
            >
              انصراف
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading-page">
    <div class="spinner"></div>
    <p>در حال بارگذاری...</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from '#app'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const repair = ref({})
const smsCode = ref('')
const error = ref('')
const isLoading = ref(false)
const isConfirming = ref(false)
const showFinalConfirm = ref(false)
const isPageReady = ref(false)
const codeSent = ref(false)
const isSendingCode = ref(false)
const resendTimer = ref(0)
let timerInterval = null

// بارگذاری اطلاعات تعمیر
onMounted(() => {
  try {
    // اول از localStorage بخوانیم
    const savedRepair = localStorage.getItem('currentDeliveryRepair')
    if (savedRepair) {
      repair.value = JSON.parse(savedRepair)
      isPageReady.value = true
      return
    }

    // اگر در localStorage نبود، از query parameters بخوانیم
    const repairId = route.query.id
    if (!repairId) {
      window.location.href = '/admin/admin_counter'
      return
    }

    const repairs = JSON.parse(localStorage.getItem('receptions') || '[]')
    const foundRepair = repairs.find(r => r.id === repairId)
    
    if (!foundRepair) {
      window.location.href = '/admin/admin_counter'
      return
    }

    repair.value = foundRepair
    isPageReady.value = true
  } catch (error) {
    console.error('Error loading repair data:', error)
    window.location.href = '/admin/admin_counter'
  }
})

// فرمت کردن شماره تماس
const formatPhoneNumber = (phone) => {
  if (!phone) return 'نامشخص'
  // حذف همه کاراکترهای غیر عددی
  const cleaned = phone.replace(/\D/g, '')
  // اگر شماره با 0 شروع شده، آن را حذف کن
  const number = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned
  // فرمت کردن شماره به صورت 09XX XXX XXXX
  return number.replace(/(\d{4})(\d{3})(\d{4})/, '09$1 $2 $3')
}

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

// ارسال کد تأیید
const sendVerificationCode = async () => {
  if (!repair.value || !repair.value.phone) {
    error.value = 'شماره تماس مشتری در دسترس نیست'
    return
  }

  isSendingCode.value = true
  error.value = ''

  try {
    // تولید کد تصادفی 6 رقمی
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    // در اینجا باید کد را به سرور ارسال کنید و از آنجا پیامک شود
    const smsText = `کد تأیید تحویل دستگاه شما: ${verificationCode}\nشماره پیگیری: ${repair.value.trackingNumber}\nتعمیرگاه طلایی پالم`
    
    // ذخیره کد در اطلاعات تعمیر
    repair.value.smsCode = verificationCode
    repair.value.lastSmsSent = new Date().toLocaleString('fa-IR')
    localStorage.setItem('currentDeliveryRepair', JSON.stringify(repair.value))
    
    // به‌روزرسانی در لیست اصلی تعمیرات
    const repairs = JSON.parse(localStorage.getItem('receptions') || '[]')
    const index = repairs.findIndex(r => r.id === repair.value.id)
    if (index !== -1) {
      repairs[index] = repair.value
      localStorage.setItem('receptions', JSON.stringify(repairs))
    }

    // نمایش پیام موفقیت
    alert(`کد تأیید به شماره ${formatPhoneNumber(repair.value.phone)} ارسال شد.\n\nمتن پیامک:\n${smsText}`)
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
  codeSent.value = false
  smsCode.value = ''
  sendVerificationCode()
}

// بررسی کد پیامک
const verifyCode = async () => {
  if (!smsCode.value || smsCode.value.length !== 6) {
    error.value = 'لطفاً کد 6 رقمی را وارد کنید'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    // در اینجا باید کد پیامک شده را از سرور یا localStorage بررسی کنید
    const savedCode = repair.value.smsCode || '123456'
    
    if (smsCode.value === savedCode) {
      showFinalConfirm.value = true
    } else {
      error.value = 'کد وارد شده صحیح نیست'
    }
  } catch (err) {
    error.value = 'خطا در بررسی کد'
    console.error('Error verifying code:', err)
  } finally {
    isLoading.value = false
  }
}

// تأیید نهایی تحویل
const confirmDelivery = () => {
  if (!repair.value || !repair.value.id) {
    error.value = 'اطلاعات تعمیر نامعتبر است'
    return
  }

  isConfirming.value = true
  
  try {
    const repairs = JSON.parse(localStorage.getItem('receptions') || '[]')
    const index = repairs.findIndex(r => r.id === repair.value.id)
    
    if (index !== -1) {
      const today = new Date().toLocaleDateString('fa-IR')
      repairs[index] = {
        ...repair.value,
        deliveredToCustomer: true,
        deliveryDate: today,
        status: 'delivered',
        verifiedDelivery: true
      }
      
      localStorage.setItem('receptions', JSON.stringify(repairs))
      // پاک کردن اطلاعات موقت
      localStorage.removeItem('currentDeliveryRepair')
      window.location.href = '/admin/admin_counter'
    }
  } catch (err) {
    error.value = 'خطا در ثبت تحویل'
    console.error('Error confirming delivery:', err)
  } finally {
    isConfirming.value = false
  }
}

// بازگشت به صفحه قبل
const goBack = () => {
  // پاک کردن اطلاعات موقت
  localStorage.removeItem('currentDeliveryRepair')
  window.location.href = '/admin/admin_counter'
}

// پاکسازی تایمر هنگام خروج از کامپوننت
onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>

<style scoped>
.verify-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  padding: 20px;
}

.verify-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 30px;
  width: 100%;
  max-width: 500px;
}

.verify-header {
  text-align: center;
  margin-bottom: 30px;
}

.device-info {
  color: #666;
  margin-top: 15px;
  line-height: 1.6;
}

.verify-form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1.1rem;
  text-align: center;
  letter-spacing: 4px;
}

.form-control.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 5px;
}

.verify-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #7f8c8d;
}

.btn-success {
  background: #2ecc71;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #27ae60;
}

/* مودال */
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
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.text-muted {
  color: #95a5a6;
  font-size: 0.9rem;
  margin-top: 5px;
}

@media (max-width: 480px) {
  .verify-container {
    padding: 20px;
  }

  .btn {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
}

.loading-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.send-code-section {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-info:hover:not(:disabled) {
  background: #138496;
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

.mb-3 {
  margin-bottom: 1rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.info-section {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.info-section h4 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 1rem;
}

.info-section p {
  margin: 5px 0;
  color: #666;
  line-height: 1.6;
}

.text-danger {
  color: #dc3545;
  font-size: 0.9rem;
}
</style>