<template>
  <div class="contact-page">
    <Header />

    <main class="contact-main">
      <div class="contact-container">
        <h1 class="contact-title">
          <i class="fas fa-headset"></i>
          ارتباط با نخل طلایی
        </h1>

        <div class="contact-grid">
          <!-- بخش اطلاعات تماس -->
          <div class="contact-info">
            <div class="info-card">
              <i class="fas fa-map-marker-alt"></i>
              <h3>آدرس ما: فردیس، فلکه سوم، پاساژ بعثت، طبقه زیرزمین، پلاک 15</h3>
              <p>برای مراجعه حضوری، ما در قلب فردیس منتظر شما هستیم!</p>
            </div>

            <div class="info-card">
              <i class="fas fa-phone"></i>
              <h3>تلفن تماس</h3>
              <p>۰۲۱-۳۶۵۱۷۸۰۹</p>
              <p>۰۹۰۵۲۷۶۸۴۲۹ (واتساپ)</p>
            </div>

            <div class="info-card">
              <i class="fas fa-envelope"></i>
              <h3>ایمیل</h3>
              <p>nakhltalaei@gmail.com</p>
            </div>

            <div class="info-card">
              <i class="fab fa-telegram"></i>
              <h3>شبکه‌های اجتماعی</h3>
              <div class="social-links">
                <a href="https://t.me/nakhltalaei" class="telegram"><i class="fab fa-telegram"></i> t.me/nakhltalaei</a>
                <a href="https://instagram.com/nakhl.talaei.safari" class="instagram"><i class="fab fa-instagram"></i> nakhl.talaei.safari</a>
              </div>
            </div>
          </div>

          <!-- بخش فرم تماس -->
          <div class="contact-form">
            <h3 class="form-title">پیام خود را ارسال کنید</h3>
            <form @submit.prevent="submitForm">
              <div class="form-group">
                <label for="name">نام کامل *</label>
                <input type="text" id="name" v-model="formData.name" required>
              </div>

              <div class="form-group">
                <label for="email">ایمیل *</label>
                <input type="email" id="email" v-model="formData.email" required>
              </div>

              <div class="form-group">
                <label for="phone">شماره تماس</label>
                <input type="tel" id="phone" v-model="formData.phone">
              </div>

              <div class="form-group">
                <label for="subject">موضوع *</label>
                <select id="subject" v-model="formData.subject" required>
                  <option value="" disabled selected>انتخاب کنید</option>
                  <option value="پشتیبانی">انتقاد و پیشنهاد</option>
                  <option value="تعمیرات">تعمیرات</option>
                  <option value="همکاری">همکاری</option>
                  <option value="سایر">سایر</option>
                </select>
              </div>

              <div class="form-group">
                <label for="message">متن پیام *</label>
                <textarea id="message" v-model="formData.message" required></textarea>
              </div>

              <button type="submit" class="submit-btn" :disabled="loading">
                <i class="fas fa-paper-plane"></i>
                ارسال پیام
              </button>

              <div v-if="successMessage" class="success-message">
                {{ successMessage }}
              </div>

              <div v-if="errorMessage" class="error-message">
                {{ errorMessage }}
              </div>
            </form>
          </div>
        </div>

        <!-- بخش نقشه گوگل -->
        <div class="map-section">
          <h3 class="map-title">موقعیت ما روی نقشه</h3>
          <iframe class="map-iframe" alt="نقشه گوگل نخل طلایی - فردیس، فلکه سوم، پاساژ بعثت" src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d809.8103817334882!2d50.98822673048414!3d35.720278087098315!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzXCsDQzJzEzLjAiTiA1MMKwNTknMTUuMyJF!5e0!3m2!1sfa!2snl!4v1755497547928!5m2!1sfa!2snl" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import Footer from '~/components/Footer.vue'
import { ref, reactive } from 'vue'
import { useNuxtApp } from '#app'

const { $api } = useNuxtApp()
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const formData = reactive({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
})

const submitForm = async () => {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await $api.post('user/Message', {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject,
      message: formData.message
    })

    successMessage.value = 'پیام شما با موفقیت ارسال شد!'
    // Clear the form
    formData.name = ''
    formData.email = ''
    formData.phone = ''
    formData.subject = ''
    formData.message = ''
  } catch (error) {
    if (error.response && error.response.data) {
      const messages = Object.values(error.response.data).flat()
      errorMessage.value = messages.join('\n')
    } else {
      errorMessage.value = 'خطایی در ارسال پیام رخ داد. لطفاً دوباره تلاش کنید.'
    }
    console.error('Error submitting form:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.contact-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7ff;
}

.contact-main {
  flex: 1;
  padding: 2rem 0;
}

.contact-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.contact-title {
  text-align: center;
  color: #0d1b3a;
  margin-bottom: 3rem;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.contact-title i {
  color: #d4af37;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.contact-info {
  display: grid;
  gap: 1.5rem;
}

.info-card {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  border-right: 4px solid #d4af37;
}

.info-card i {
  font-size: 1.5rem;
  color: #d4af37;
  margin-bottom: 1rem;
}

.info-card h3 {
  color: #0d1b3a;
  margin-bottom: 0.5rem;
}

.info-card p {
  color: #555;
  line-height: 1.8;
}

.social-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.social-links a {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #555;
  text-decoration: none;
  transition: color 0.3s;
}

.social-links a:hover {
  color: #0d6efd;
}

.telegram { color: #0088cc !important; }
.instagram { color: #e1306c !important; }

.contact-form {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
}

.form-title {
  color: #0d1b3a;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: Vazir, sans-serif;
}

.form-group textarea {
  min-height: 120px;
  resize: vertical;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #f9d423 0%, #e6b422 50%, #d4af37 100%);
  color: #5c3a00;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
}

.success-message {
  color: #2ecc71;
  font-size: 1.2rem;
  margin-top: 1rem;
}

.error-message {
  color: #e74c3c;
  font-size: 1.2rem;
  margin-top: 1rem;
}

.map-section {
  margin-top: 3rem;
  text-align: center;
}

.map-title {
  color: #0d1b3a;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.map-iframe {
  width: 100%;
  height: 400px;
  border: none;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
}

/* حالت موبایل */
@media (max-width: 768px) {
  .contact-title {
    font-size: 1.5rem;
  }

  .contact-grid {
    grid-template-columns: 1fr;
  }

  .info-card {
    padding: 1rem;
  }

  .map-iframe {
    height: 300px;
  }
}
</style>