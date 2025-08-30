<template>
  <div class="not-found-container">
    <!-- محتوای صفحه 404 که طراحی کردیم -->
    <div class="error-container">
      <h1 class="error-code">404</h1>
      <p class="error-message">اوپس! به نظر می‌رسد صفحه‌ای که به دنبال آن هستید وجود ندارد.</p>
      
      <div class="animation-container">
        <svg class="ghost" width="300" height="260" viewBox="0 0 300 260">
          <path d="M150,20 C80,20 20,70 20,140 C20,180 40,210 70,230 L70,260 L100,240 L150,260 L200,240 L230,260 L230,230 C260,210 280,180 280,140 C280,70 220,20 150,20 Z" fill="#fff"/>
          <circle cx="110" cy="110" r="20" fill="#6a11cb"/>
          <circle cx="190" cy="110" r="20" fill="#6a11cb"/>
          <path d="M110,170 C110,170 130,190 150,190 C170,190 190,170 190,170" stroke="#6a11cb" stroke-width="5" fill="none"/>
        </svg>
      </div>
      
      <div class="error-text">
        <span class="error-word">گشتم</span>
        <span class="error-word">نبود</span>
        <span class="error-word">نگرد</span>
        <span class="error-word">نیست</span>
      </div>
      
      
      
      <div class="actions">
        <button class="btn btn-primary" @click="goHome">
          <i class="fas fa-home"></i>
          بازگشت به خانه
        </button>
        <!-- <button class="btn btn-secondary" @click="goBack">
          <i class="fas fa-arrow-right"></i>
          بازگشت به قبلی
        </button> -->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
  data() {
    return {
      searchQuery: ''
    }
  },
  methods: {
    goHome() {
      this.$router.push('/');
    },
    // goBack() {
    //   this.$router.go(-1);
    // },
    
  }
}
</script>

<style scoped>
/* استایل‌های کامپوننت اینجا قرار می‌گیرند */
.not-found-container {
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  padding: 20px;
}

.error-container {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 800px;
  width: 100%;
  text-align: center;
}

.error-code {
  font-size: 120px;
  font-weight: 900;
  margin-bottom: 20px;
  text-shadow: 3px 3px 0px rgba(0, 0, 0, 0.2);
  color: #fff;
  position: relative;
  display: inline-block;
}

.error-code:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 5px;
  background: linear-gradient(90deg, #ff9a9e 0%, #fad0c4 100%);
  border-radius: 10px;
}

.error-message {
  font-size: 28px;
  margin-bottom: 30px;
  line-height: 1.6;
  font-weight: 300;
}

.error-text {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 40px;
}

.error-word {
  background: rgba(255, 255, 255, 0.15);
  padding: 10px 25px;
  border-radius: 50px;
  font-size: 20px;
  font-weight: 500;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.error-word:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 30px;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
  color: white;
  font-family: Vazir, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.btn-primary {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-primary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.btn-secondary {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-secondary:hover {
  background: rgba(0, 0, 0, 0.3);
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.search-box {
  margin: 30px auto;
  max-width: 500px;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 15px 60px 15px 20px;
  border-radius: 50px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(5px);
  color: white;
  font-size: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  font-family: Vazir, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.search-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.search-btn {
  position: absolute;
  left: 5px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.animation-container {
  margin: 30px auto;
  max-width: 300px;
}

.ghost {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

@media (max-width: 768px) {
  .error-code {
    font-size: 80px;
  }
  
  .error-message {
    font-size: 22px;
  }
  
  .error-word {
    font-size: 18px;
    padding: 8px 20px;
  }
  
  .error-container {
    padding: 30px 20px;
  }
}
</style>