<template>
  <div class="golden-palm-page">
    <Header />
    
    <main class="main-content">
      <div class="background-design">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
      </div>
      
      <div class="content-center">
        <NuxtLink to="/Follow_up" class="golden-btn">
          <span class="btn-text">پیگیری درخواست تعمیر</span>
          <svg class="btn-icon" viewBox="0 0 24 24">
            <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" stroke="currentColor" stroke-width="2"/>
          </svg>
        </NuxtLink>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Footer from '~/components/ّFooter.vue'
</script>

<style scoped>
.golden-palm-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7ff; /* پس‌زمینه آبی بسیار روشن */
  position: relative;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
}

.background-design {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 0;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(13, 110, 253, 0.1); /* رنگ آبی با شفافیت */
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -50px;
  left: -50px;
}

.circle-2 {
  width: 500px;
  height: 500px;
  bottom: -100px;
  right: -100px;
}

.circle-3 {
  width: 200px;
  height: 200px;
  top: 50%;
  left: 30%;
}

.content-center {
  position: relative;
  z-index: 1;
  text-align: center;
}

.golden-btn {
  display: inline-flex;
  align-items: center;
  padding: 18px 36px;
  font-size: 1.2rem;
  font-weight: 700;
  color: #5c3a00;
  background: linear-gradient(135deg, #f9d423 0%, #e6b422 50%, #d4af37 100%);
  border: none;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(212, 175, 55, 0.4);
  transition: all 0.3s ease;
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.golden-btn::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    to bottom right,
    rgba(255,255,255,0.3) 0%,
    rgba(255,255,255,0) 60%
  );
  transform: rotate(30deg);
}

.golden-btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 25px rgba(212, 175, 55, 0.6);
  background: linear-gradient(135deg, #f9d423 0%, #d4af37 50%, #b38f2a 100%);
}

.btn-text {
  position: relative;
  z-index: 2;
}

.btn-icon {
  width: 24px;
  height: 24px;
  margin-right: 12px;
  color: #5c3a00;
  position: relative;
  z-index: 2;
}

/* حالت موبایل */
@media (max-width: 768px) {
  .golden-btn {
    padding: 14px 28px;
    font-size: 1rem;
  }
  
  .circle-1, .circle-2, .circle-3 {
    display: none;
  }
  
  .main-content {
    padding: 1rem;
  }
}
</style>