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
                <h3>آدرس ما: فردیس , فلکه سوم , پاساژ بعثت , طبقه زیرزمین , پلاک 15</h3>
                <p></p>
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
                <p>support@nakhltalaei.ir</p>
              </div>
              
              <div class="info-card">
                <i class="fab fa-telegram"></i>
                <h3>شبکه‌های اجتماعی</h3>
                <div class="social-links">
                  <a href="#" class="telegram"><i class="fab fa-telegram"></i> t.me/nakhltalaei</a>
                  <a href="#" class="instagram"><i class="fab fa-instagram"></i> nakhl.talaei.safari</a>
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
                
                <button type="submit" class="submit-btn">
                  <i class="fas fa-paper-plane"></i>
                  ارسال پیام
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  </template>
  
  <script setup>
  import Footer from '~/components/Footer.vue'
  const formData = reactive({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  
  const submitForm = () => {
    // ایجاد یک پیام جدید
    const newMessage = {
      id: Date.now(), // استفاده از timestamp به عنوان شناسه یکتا
      sender: formData.name,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject,
      content: formData.message,
      date: new Date().toLocaleDateString('fa-IR'),
      read: false
    }

    // دریافت پیام‌های موجود از localStorage
    const existingMessages = JSON.parse(localStorage.getItem('userMessages') || '[]')
    
    // اضافه کردن پیام جدید به لیست
    existingMessages.unshift(newMessage)
    
    // ذخیره لیست به‌روز شده در localStorage
    localStorage.setItem('userMessages', JSON.stringify(existingMessages))

    // پاک کردن فرم
    formData.name = ''
    formData.email = ''
    formData.phone = ''
    formData.subject = ''
    formData.message = ''

    alert('پیام شما با موفقیت ارسال شد!')
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
  }
  </style>


