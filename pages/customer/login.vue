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
          <form @submit.prevent="handleLogin" class="login-form">
            <div class="form-group">
              <label for="phone">شماره تماس</label>
              <div class="input-group">
                <span class="input-group-text">09</span>
                <input
                  v-model="phone"
                  type="tel"
                  class="form-control"
                  id="phone"
                  placeholder="شماره تماس خود را وارد کنید"
                  pattern="[0-9]{9}"
                  maxlength="9"
                  required
                >
              </div>
            </div>

            <button type="submit" class="btn btn-primary w-100">
              <i class="fas fa-sign-in-alt"></i>
              ورود به سیستم
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '~/components/Header.vue'
import RepairCard from '~/components/RepairCard.vue'

const router = useRouter()
const phone = ref('')
const userRepairs = ref([])

const handleLogin = () => {
  // نمایش داده‌های موجود در localStorage برای دیباگ
  const receptions = JSON.parse(localStorage.getItem('receptions') || '[]')
  console.log('Debug - All receptions:', receptions)
  
  // نرمال‌سازی شماره تلفن ورودی
  const inputPhone = phone.value.trim()
  // حذف ۰۹ از ابتدای شماره اگر وجود داشت
  const cleanInput = inputPhone.replace(/^09/, '')
  // اگر شماره ۹ رقمی است، آن را به ۱۱ رقمی تبدیل می‌کنیم
  const normalizedInput = cleanInput.length === 9 ? `09${cleanInput}` : cleanInput
  
  console.log('Debug - Phone search:', {
    originalInput: phone.value,
    inputPhone,
    cleanInput,
    normalizedInput,
    receptions: receptions.map(r => ({
      id: r.id,
      trackingNumber: r.trackingNumber,
      originalPhone: r.phone,
      normalizedPhone: r.phone.toString().trim(),
      customerName: r.customerName
    }))
  })
  
  // جستجو در لیست پذیرش‌ها
  const foundRepairs = receptions.filter(r => {
    // نرمال‌سازی شماره تلفن ذخیره شده
    const storedPhone = r.phone.toString().trim()
    
    // مقایسه شماره‌ها
    const isMatch = storedPhone === normalizedInput || 
                   storedPhone.replace(/^09/, '') === cleanInput ||
                   storedPhone === cleanInput
    
    console.log('Debug - Phone comparison:', {
      storedPhone,
      normalizedInput,
      cleanInput,
      isMatch
    })
    
    return isMatch
  })

  if (foundRepairs.length === 0) {
    console.log('Debug - No matches found for phone:', normalizedInput)
    alert('اطلاعاتی یافت نشد. لطفاً شماره تماس را با دقت وارد کنید.')
  } else {
    console.log('Debug - Found matches:', foundRepairs)
    // هدایت به صفحه تعمیرات مشتری
    router.push(`/customer/my_repairs?phone=${normalizedInput}`)
  }
}

// اضافه کردن تابع برای بررسی وضعیت localStorage
const checkLocalStorage = () => {
  const receptions = JSON.parse(localStorage.getItem('receptions') || '[]')
  console.log('Debug - Current localStorage state:', {
    receptionsCount: receptions.length,
    receptions: receptions.map(r => ({
      id: r.id,
      trackingNumber: r.trackingNumber,
      phone: r.phone,
      cleanPhone: r.phone.toString().replace(/^09/, ''),
      customerName: r.customerName
    }))
  })
}

// فراخوانی تابع در زمان بارگذاری کامپوننت
onMounted(() => {
  checkLocalStorage()
})
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
</style> 