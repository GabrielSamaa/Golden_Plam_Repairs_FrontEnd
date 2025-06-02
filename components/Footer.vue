<template>
    <footer class="golden-footer">
      <div class="footer-container">
        <div class="footer-section">
          <h3 class="footer-title">نخل طلایی</h3>
          <p class="footer-description">مرکز تخصصی تعمیرات دستگاه‌های آرایشی</p>
          <div class="social-icons">
            <a href="https://wa.me/989052768426" class="social-icon whatsapp">
              <i class="fab fa-whatsapp"></i>
            </a>
            <a href="https://t.me/nakhltalaei" class="social-icon telegram">
              <i class="fab fa-telegram"></i>
            </a>
            <a href="https://nakhl.talaei.safari" class="social-icon instagram">
              <i class="fab fa-instagram"></i>
            </a>
          </div>
        </div>
  
        <div class="footer-section">
          <h4 class="footer-subtitle">ارتباط با ما</h4>
          <ul class="footer-links">
            <li>
              <i class="fas fa-map-marker-alt"></i>
              <span>آدرس: فردیس , فلکه سوم , پاساژ بعثت , طبقه زیرزمین , پلاک 15</span>
            </li>
            <li>
              <i class="fas fa-phone"></i>
              <span>تلفن: 36517809_026</span>
            </li>
            <li>
              <i class="fas fa-mobile-alt"></i>
              <span>واتساپ: 0905276842</span>
            </li>
            <li>
              <i class="fab fa-telegram"></i>
              <span>تلگرام: t.me/nakhltalaei</span>
            </li>
            <li>
              <i class="fas fa-envelope"></i>
              <span>ایمیل:</span>
            </li>
          </ul>
        </div>
  
        <div class="footer-section">
          <h4 class="footer-subtitle">دسترسی سریع</h4>
          <ul class="footer-links">
            <li><NuxtLink to="/">صفحه اصلی</NuxtLink></li>
            <li><NuxtLink to="/about">درباره ما</NuxtLink></li>
            <li><NuxtLink to="/contact">ارتباط با ما</NuxtLink></li>
            <li><NuxtLink to="/customer/login">پیگیری درخواست تعمیر</NuxtLink></li>
          </ul>
        </div>
      </div>
  
      <div class="footer-bottom">
        <p>© تمامی حقوق برای نخل طلایی محفوظ است - ۱۴۰۳</p>
      </div>
    </footer>
  </template>
  
  <script setup>
  // نیازی به import نیست (Nuxt 3 از auto-imports استفاده می‌کند)
  </script>
  
  <style scoped>
  .golden-footer {
    background: linear-gradient(135deg, #1a2a4f 0%, #0d1b3a 100%);
    color: white;
    padding: 3rem 1rem 0;
    font-family: 'Vazir', sans-serif;
    direction: rtl;
  }
  
  .footer-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
  
  .footer-section {
    margin-bottom: 2rem;
  }
  
  .footer-title {
    font-size: 1.5rem;
    color: #d4af37;
    margin-bottom: 1rem;
    font-weight: 700;
  }
  
  .footer-subtitle {
    font-size: 1.2rem;
    color: #d4af37;
    margin-bottom: 1.5rem;
    position: relative;
    padding-bottom: 0.5rem;
  }
  
  .footer-subtitle::after {
    content: '';
    position: absolute;
    right: 0;
    bottom: 0;
    width: 50px;
    height: 2px;
    background: #d4af37;
  }
  
  .footer-description {
    color: #b3b3b3;
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }
  
  .footer-links {
    list-style: none;
    padding: 0;
  }
  
  .footer-links li {
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }
  
  .footer-links i {
    color: #d4af37;
    width: 20px;
    text-align: center;
  }
  
  .footer-links a {
    color: #e0e0e0;
    text-decoration: none;
    transition: color 0.3s;
  }
  
  .footer-links a:hover {
    color: #d4af37;
  }
  
  .social-icons {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
  }
  
  .social-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
    transition: transform 0.3s;
  }
  
  .social-icon:hover {
    transform: translateY(-5px);
  }
  
  .whatsapp { background: #25D366; }
  .telegram { background: #0088cc; }
  .instagram { 
    background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); 
  }
  
  .footer-bottom {
    text-align: center;
    padding: 1.5rem 0;
    margin-top: 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    color: #b3b3b3;
    font-size: 0.9rem;
  }
  
  /* حالت موبایل */
  @media (max-width: 768px) {
    .footer-container {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    
    .footer-section {
      margin-bottom: 1.5rem;
    }
    
    .footer-title {
      font-size: 1.3rem;
    }
    
    .footer-links li {
      font-size: 0.9rem;
    }
    
    .social-icons {
      justify-content: center;
    }
  }
  </style>