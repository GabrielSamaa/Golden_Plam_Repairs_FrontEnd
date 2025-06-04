<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h2>ورود به سیستم</h2>
        <p>لطفاً اطلاعات ورود خود را وارد کنید</p>
        <div class="test-info">
          <p class="text-muted small">
            <strong>اطلاعات تست:</strong><br>
            تعمیرکار: 09111111111<br>
            ادمین: 09222222222<br>
            کد تایید: 123456
          </p>
        </div>
      </div>

      <form v-if="!codeSent" @submit.prevent="sendVerificationCode" class="login-form">
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
          >
        </div>

        <div class="form-group" v-if="errorMessage">
          <div class="alert alert-danger">
            {{ errorMessage }}
          </div>
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
          <div class="invalid-feedback" v-if="errorMessage">
            {{ errorMessage }}
          </div>
        </div>

        <button 
          type="submit" 
          class="btn btn-primary w-100" 
          :disabled="isVerifying || !smsCode || smsCode.length !== 6"
          @click.prevent="verifyCode"
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
import { ref, watch, onUnmounted, onMounted, nextTick } from 'vue'
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

// اضافه کردن middleware برای مدیریت وضعیت احراز هویت
definePageMeta({
  middleware: ['auth']
})

const router = useRouter()
const route = useRoute()
const userType = ref('repairman')
const phone = ref('')
const smsCode = ref('')
const errorMessage = ref('')
const isSendingCode = ref(false)
const isVerifying = ref(false)
const codeSent = ref(false)
const resendTimer = ref(0)
const isNavigating = ref(false)
let timerInterval = null

const { setAuth, clearAuth } = useAuth()

// مدیریت وضعیت احراز هویت
const authState = {
  isChecking: false,
  lastCheck: 0,
  checkTimeout: null,
  
  // مسیرهای مجاز برای هر نوع کاربر
  allowedRoutes: {
    admin: [
      '/admin/admin_counter',
      '/admin/admins',
      '/admin/archive',
      '/admin/financial',
      '/admin/messages',
      '/admin/reception',
      '/admin/Form',
      '/admin/verify-delivery-code'
    ],
    repairman: [
      '/repairman/index_repairs'
    ]
  },
  
  // بررسی مجاز بودن مسیر
  isRouteAllowed(path, userType) {
    return this.allowedRoutes[userType]?.some(route => path.startsWith(route)) || false
  },
  
  async check() {
    if (this.isChecking) return
    if (Date.now() - this.lastCheck < 1000) return
    
    this.isChecking = true
    this.lastCheck = Date.now()
    
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null')
      const userType = localStorage.getItem('userType')
      return { 
        isLoggedIn: !!(currentUser && userType), 
        userType, 
        currentUser,
        isRouteAllowed: (path) => this.isRouteAllowed(path, userType)
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      return { 
        isLoggedIn: false, 
        userType: null, 
        currentUser: null,
        isRouteAllowed: () => false
      }
    } finally {
      this.isChecking = false
    }
  },
  
  async navigate(to, replace = true) {
    if (isNavigating.value) return
    isNavigating.value = true
    
    try {
      const { userType, isRouteAllowed } = await this.check()
      
      // اگر مسیر مجاز نیست، به صفحه پیش‌فرض هدایت می‌کنیم
      if (!isRouteAllowed(to)) {
        to = userType === 'admin' ? '/admin/admin_counter' : '/repairman/index_repairs'
      }
      
      await nextTick()
      if (replace) {
        await router.replace(to)
      } else {
        await router.push(to)
      }
    } catch (error) {
      console.error('Navigation error:', error)
    } finally {
      setTimeout(() => {
        isNavigating.value = false
      }, 100)
    }
  }
}

// بررسی وضعیت ورود و هدایت کاربر
const handleAuthNavigation = async (forceLogin = false) => {
  if (isNavigating.value) return
  
  const { isLoggedIn, userType, isRouteAllowed } = await authState.check()
  const currentPath = route.path
  
  // اگر در صفحه لاگین هستیم
  if (currentPath === '/login') {
    if (isLoggedIn && !forceLogin) {
      const targetPath = userType === 'admin' ? '/admin/admin_counter' : '/repairman/index_repairs'
      await authState.navigate(targetPath)
    }
    return
  }
  
  // اگر در صفحات پنل هستیم
  if (currentPath.startsWith('/admin/') || currentPath.startsWith('/repairman/')) {
    if (!isLoggedIn || forceLogin) {
      await authState.navigate('/login')
    } else if (!isRouteAllowed(currentPath)) {
      // اگر مسیر مجاز نیست، به صفحه پیش‌فرض هدایت می‌کنیم
      const targetPath = userType === 'admin' ? '/admin/admin_counter' : '/repairman/index_repairs'
      await authState.navigate(targetPath)
    }
  }
}

// بررسی وضعیت ورود در زمان لود صفحه
onMounted(async () => {
  try {
    // ایجاد کاربران تست
    const repairmen = JSON.parse(localStorage.getItem('repairmen') || '[]')
    if (!repairmen.some(r => r.phone === '09111111111')) {
      const newRepairman = {
        id: 'repairman_test_1',
        username: 'repairman1',
        phone: '09111111111',
        name: 'تعمیرکار تست',
        status: 'active',
        specialization: 'موبایل',
        lastLogin: null,
        createdAt: new Date().toISOString()
      }
      repairmen.push(newRepairman)
      localStorage.setItem('repairmen', JSON.stringify(repairmen))
    }

    const admins = JSON.parse(localStorage.getItem('admins') || '[]')
    if (!admins.some(a => a.phone === '09222222222')) {
      const newAdmin = {
        id: 'admin_test_1',
        username: 'admin1',
        phone: '09222222222',
        name: 'مدیر تست',
        status: 'active',
        role: 'admin',
        lastLogin: null,
        createdAt: new Date().toISOString()
      }
      admins.push(newAdmin)
      localStorage.setItem('admins', JSON.stringify(admins))
    }

    // بررسی وضعیت ورود با تاخیر
    setTimeout(() => {
      handleAuthNavigation()
    }, 100)
  } catch (error) {
    console.error('Error in onMounted:', error)
  }
})

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const startResendTimer = () => {
  resendTimer.value = 120
  if (timerInterval) clearInterval(timerInterval)
  
  timerInterval = setInterval(() => {
    if (resendTimer.value > 0) {
      resendTimer.value--
    } else {
      clearInterval(timerInterval)
    }
  }, 1000)
}

watch(phone, (newValue) => {
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

const sendVerificationCode = async () => {
  if (!phone.value || phone.value.length !== 11) {
    errorMessage.value = 'لطفاً شماره تماس را به درستی وارد کنید'
    return
  }

  if (phone.value === '09111111111' || phone.value === '09222222222') {
    alert('اطلاعات تست:\nشماره: ' + phone.value + '\nکد تایید: 123456')
  }

  isSendingCode.value = true
  errorMessage.value = ''

  try {
    let userExists = false
    if (userType.value === 'repairman') {
      const repairmen = JSON.parse(localStorage.getItem('repairmen') || '[]')
      userExists = repairmen.some(r => r.phone === phone.value)
    } else {
      const admins = JSON.parse(localStorage.getItem('admins') || '[]')
      userExists = admins.some(a => a.phone === phone.value)
    }

    if (!userExists) {
      errorMessage.value = 'کاربری با این شماره تماس یافت نشد'
      return
    }

    const verificationCode = '123456'
    const verificationData = {
      phone: phone.value,
      code: verificationCode,
      userType: userType.value,
      timestamp: new Date().toISOString()
    }
    
    localStorage.setItem('loginVerificationCode', JSON.stringify(verificationData))
    
    alert(`کد تأیید به شماره ${phone.value} ارسال شد.\n\nکد تست: ${verificationCode}`)
    codeSent.value = true
    startResendTimer()
  } catch (err) {
    console.error('Error sending verification code:', err)
    errorMessage.value = 'خطا در ارسال کد تأیید'
  } finally {
    isSendingCode.value = false
  }
}

const resendCode = () => {
  if (resendTimer.value > 0) return
  smsCode.value = ''
  sendVerificationCode()
}

// تابع تولید توکن
const generateToken = () => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2)
  return `${timestamp}-${random}`
}

const verifyCode = async () => {
  console.log('Verifying code...', { phone: phone.value, code: smsCode.value, userType: userType.value })
  
  if (!smsCode.value || smsCode.value.length !== 6) {
    errorMessage.value = 'لطفاً کد 6 رقمی را وارد کنید'
    return
  }

  isVerifying.value = true
  errorMessage.value = ''

  try {
    // برای کد تست، بررسی مستقیم انجام می‌دهیم
    if (phone.value === '09111111111' || phone.value === '09222222222') {
      console.log('Checking test code...')
      if (smsCode.value === '123456') {
        console.log('Test code is valid')
        let userData = null
        let success = false

        if (userType.value === 'repairman') {
          const repairmen = JSON.parse(localStorage.getItem('repairmen') || '[]')
          const repairman = repairmen.find(r => r.phone === phone.value)
          
          if (repairman && repairman.status === 'active') {
            userData = {
              id: repairman.id,
              type: 'repairman',
              name: repairman.name,
              phone: repairman.phone,
              specialization: repairman.specialization
            }
            
            repairman.lastLogin = new Date().toISOString()
            localStorage.setItem('repairmen', JSON.stringify(repairmen))
            success = true
            console.log('Repairman login successful')
          } else {
            errorMessage.value = 'حساب کاربری شما غیرفعال است. لطفاً با مدیر سیستم تماس بگیرید.'
            console.log('Repairman account is inactive')
          }
        } else {
          const admins = JSON.parse(localStorage.getItem('admins') || '[]')
          const admin = admins.find(a => a.phone === phone.value)
          
          if (admin && admin.status === 'active') {
            userData = {
              id: admin.id,
              type: 'admin',
              name: admin.name,
              phone: admin.phone,
              role: admin.role
            }
            
            admin.lastLogin = new Date().toISOString()
            localStorage.setItem('admins', JSON.stringify(admins))
            success = true
            console.log('Admin login successful')
          } else {
            errorMessage.value = 'حساب کاربری شما غیرفعال است.'
            console.log('Admin account is inactive')
          }
        }

        if (success && userData) {
          console.log('Setting user data and navigating...')
          localStorage.setItem('currentUser', JSON.stringify(userData))
          localStorage.setItem('userType', userData.type)
          localStorage.removeItem('loginVerificationCode')
          
          // ذخیره اطلاعات در sessionStorage
          sessionStorage.setItem('currentUser', JSON.stringify(userData))
          sessionStorage.setItem('userType', userData.type)
          sessionStorage.setItem('loginTime', Date.now().toString())
          
          // تولید توکن
          const token = generateToken()
          
          // ذخیره اطلاعات با استفاده از composable
          setAuth(userData, userData.type, token)
          
          // هدایت به صفحه مربوطه
          const targetPath = userData.type === 'admin' ? '/admin/admin_counter' : '/repairman/index_repairs'
          console.log('Navigating to:', targetPath)
          await router.replace(targetPath)
          return
        }
      } else {
        errorMessage.value = 'کد وارد شده صحیح نیست'
        console.log('Invalid test code')
      }
      return
    }

    // برای سایر شماره‌ها، بررسی از localStorage
    console.log('Checking saved verification code...')
    const savedData = JSON.parse(localStorage.getItem('loginVerificationCode') || '{}')
    console.log('Saved data:', savedData)
    
    if (savedData.phone === phone.value && 
        savedData.code === smsCode.value && 
        savedData.userType === userType.value) {
      
      let userData = null
      let success = false

      if (userType.value === 'repairman') {
        const repairmen = JSON.parse(localStorage.getItem('repairmen') || '[]')
        const repairman = repairmen.find(r => r.phone === phone.value)
        
        if (repairman && repairman.status === 'active') {
          userData = {
            id: repairman.id,
            type: 'repairman',
            name: repairman.name,
            phone: repairman.phone,
            specialization: repairman.specialization
          }
          
          repairman.lastLogin = new Date().toISOString()
          localStorage.setItem('repairmen', JSON.stringify(repairmen))
          success = true
          console.log('Repairman login successful')
        } else {
          errorMessage.value = 'حساب کاربری شما غیرفعال است. لطفاً با مدیر سیستم تماس بگیرید.'
          console.log('Repairman account is inactive')
        }
      } else {
        const admins = JSON.parse(localStorage.getItem('admins') || '[]')
        const admin = admins.find(a => a.phone === phone.value)
        
        if (admin && admin.status === 'active') {
          userData = {
            id: admin.id,
            type: 'admin',
            name: admin.name,
            phone: admin.phone,
            role: admin.role
          }
          
          admin.lastLogin = new Date().toISOString()
          localStorage.setItem('admins', JSON.stringify(admins))
          success = true
          console.log('Admin login successful')
        } else {
          errorMessage.value = 'حساب کاربری شما غیرفعال است.'
          console.log('Admin account is inactive')
        }
      }

      if (success && userData) {
        console.log('Setting user data and navigating...')
        localStorage.setItem('currentUser', JSON.stringify(userData))
        localStorage.setItem('userType', userData.type)
        localStorage.removeItem('loginVerificationCode')
        
        // ذخیره اطلاعات در sessionStorage
        sessionStorage.setItem('currentUser', JSON.stringify(userData))
        sessionStorage.setItem('userType', userData.type)
        sessionStorage.setItem('loginTime', Date.now().toString())
        
        // تولید توکن
        const token = generateToken()
        
        // ذخیره اطلاعات با استفاده از composable
        setAuth(userData, userData.type, token)
        
        // هدایت به صفحه مربوطه
        const targetPath = userData.type === 'admin' ? '/admin/admin_counter' : '/repairman/index_repairs'
        console.log('Navigating to:', targetPath)
        await router.replace(targetPath)
      }
    } else {
      errorMessage.value = 'کد وارد شده صحیح نیست'
      console.log('Invalid verification code')
    }
  } catch (err) {
    console.error('Error verifying code:', err)
    errorMessage.value = 'خطا در بررسی کد'
  } finally {
    isVerifying.value = false
  }
}

// خروج از سیستم
const logout = async () => {
  clearAuth()
  await router.replace('/login')
}

// اضافه کردن محافظ مسیر برای همه صفحات
onBeforeRouteLeave(async (to, from, next) => {
  if (isNavigating.value) {
    next(false)
    return
  }
  
  const { isLoggedIn, isRouteAllowed } = await authState.check()
  
  if (!isLoggedIn) {
    next('/login')
    return
  }
  
  if (!isRouteAllowed(to.path)) {
    const userType = localStorage.getItem('userType')
    next(userType === 'admin' ? '/admin/admin_counter' : '/repairman/index_repairs')
    return
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

.invalid-feedback {
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 5px;
}

.test-info {
  margin-top: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.test-info p {
  margin: 0;
  line-height: 1.6;
}

.text-muted {
  color: #6c757d;
}

.small {
  font-size: 0.875rem;
}
</style>