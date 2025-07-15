<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h2>ورود به سیستم</h2>
        <p>لطفاً اطلاعات ورود خود را وارد کنید</p>
      </div>

      <form v-if="!codeSent"  @submit.prevent="sendVerificationCode" class="login-form">
        <div class="form-group">
          <label>نوع کاربر</label>
          <select class="form-control" v-model="userType" required>
            <option value="repairman">تعمیرکار</option>
            <option value="admin">مدیر سیستم</option>
          </select>
        </div>

        <div class="form-group">
          <label>شماره تماس</label>
          <input 
            type="tel" 
            class="form-control" 
            v-model="phone" 
            required
            placeholder="شماره تماس خود را وارد کنید"
            pattern="09[0-9]{9}"
            maxlength="11"
            dir="ltr"
            @input="formatPhoneInput"
          >
        </div>

        <!-- <div class="form-group" v-if="errorMessage">
          <div class="alert alert-danger">
            {{ errorMessage }}
          </div>
        </div> -->

        <button  type="submit" class="btn btn-primary w-100" :disabled="isSendingCode || resendTimer > 0">
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

      <form v-else @submit.prevent="verifyCode" class="login-form">
        <div class="form-group">
          <label>کد تأیید پیامک شده را وارد کنید:</label>
          <input 
            type="text" 
            v-model="smsCode" 
            class="form-control"
            placeholder="کد 6 رقمی"
            maxlength="6"
            :class="{ 'is-invalid': errorMessage }"
            required
            @keyup.enter="verifyCode"
          >
          <!-- <div class="invalid-feedback" v-if="errorMessage">
            {{ errorMessage }}
          </div> -->
        </div>

        <button 
          type="submit" 
          class="btn btn-primary w-100" 
          :disabled="isVerifying || !smsCode || smsCode.length !== 6"
        >
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
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNuxtApp } from '#app'

const { $axios } = useNuxtApp()
const router = useRouter()

const userType = ref('repairman')
const phone = ref('')
const smsCode = ref('')
const errorMessage = ref('')
const isSendingCode = ref(false)
const isVerifying = ref(false)
const codeSent = ref(false) // اطمینان حاصل کنید این مقدار false است
const resendTimer = ref(0)
let timerInterval = null


const sendVerificationCode = async () => {
  if (!phone.value || phone.value.length !== 11) {
    errorMessage.value = 'لطفاً شماره تماس را به درستی وارد کنید'
    return
  }

  isSendingCode.value = true
  errorMessage.value = ''

  try {
    codeSent.value = true
    const response = await $axios.post('/user/auth', {
      mobile: phone.value,
      // userType: userType.value
    })

    // console.log('پاسخ سرور:', response.data) // برای دیباگ

    // تغییر اصلی اینجا - بررسی دقیق پاسخ سرور
    if (response.data?.success) {
      codeSent.value = true // این خط حیاتی است
      startResendTimer()
      console.log('وضعیت codeSent تغییر کرد به:', codeSent.value) // تأیید در کنسول
    } else {
      errorMessage.value = response.data?.message || 'خطا در ارسال کد تأیید'
    }
  } catch (error) {
    console.error('خطا در ارسال کد:', error)
    errorMessage.value = 'اتصال به سرور برقرار نشد'
  } finally {
    isSendingCode.value = false
  }
}

const resendCode = async () => {
  if (resendTimer.value > 0) return
  
  smsCode.value = ''
  await sendVerificationCode()
}

const verifyCode = async () => {
  try {
    const response = await $axios.post('/user/login', {
      mobile: phone.value,
      code: smsCode.value
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000 // 10 ثانیه timeout
    });

    // پردازش پاسخ موفق
    console.log('پاسخ سرور:', response.data);
    if (response.data?.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      router.push('/admin');
    }
  } catch (error) {
    // مدیریت خطاهای مختلف
    if (error.response) {
      // سرور پاسخ داده اما با خطا
      console.error('خطای سرور:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      errorMessage.value = error.response.data?.message || 'خطای سرور';
    } else if (error.request) {
      // درخواست ارسال شده اما پاسخی دریافت نشده
      console.error('پاسخی دریافت نشد:', error.request);
      errorMessage.value = 'اتصال به سرور برقرار نشد';
    } else {
      // خطا در تنظیم درخواست
      console.error('خطای تنظیم درخواست:', error.message);
      errorMessage.value = 'خطا در ارسال درخواست';
    }
  }
};

onBeforeRouteLeave((to, from, next) => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
  next()
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
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

/* .alert-danger {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
} */

.w-100 {
  width: 100%;
}

.mt-2 {
  margin-top: 0.5rem;
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

/*.invalid-feedback {
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 5px;
} */

@media (max-width: 480px) {
  .login-container {
    padding: 20px;
  }
}
</style>