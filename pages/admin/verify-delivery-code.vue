<template>
  <div class="verification-page">

    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
      <p class="loading-text">در حال بارگذاری اطلاعات...</p>
    </div>


    <div v-if="currentRepair" class="verification-container">
      <div class="verification-header">
        <h2>تأیید تحویل دستگاه</h2>
        <button class="cancel-btn" @click="cancelDelivery">
          <i class="fas fa-times"></i>
          لغو
        </button>
      </div>

      <div class="repair-info">
        <div class="info-section">
          <h3>اطلاعات تعمیر</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>کد رهگیری:</label>
              <span>{{ currentRepair.verification_code }}</span>
            </div>
            <div class="info-item">
              <label>نام مشتری:</label>
              <span>{{ currentRepair.customer.name }}</span>
            </div>
            <div class="info-item">
              <label>نوع دستگاه:</label>
              <span>{{ currentRepair.device_name }}</span>
            </div>
            <div class="info-item">
              <label>مبلغ:</label>
              <span>{{ currentRepair.statement ? currentRepair.statement.toLocaleString() : '0' }} تومان</span>
            </div>
          </div>
        </div>

        <div v-if="currentRepair.status !== 'delivered'" class="verification-section">
          <div class="verification-info">
            <p class="test-code-hint">کد تأیید ارسال شده به مشتری را وارد کنید</p>
          </div>
          
          <div class="code-input-section">
            <div class="input-group">
              <input 
                type="text" 
                v-model="verificationCode"
                placeholder="کد تأیید را وارد کنید"
                maxlength="6"
                :disabled="isVerifying"
                @keyup.enter="verifyCode"
              >
              <button 
                class="verify-btn" 
                @click="verifyCode"
                :disabled="isVerifying || !verificationCode"
              >
                <i class="fas fa-check"></i>
                تأیید
              </button>
            </div>
            
            <div v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>
            
            <div v-if="successMessage" class="success-message">
              {{ successMessage }}
            </div>
          </div>
        </div>

        <div v-else class="delivered-message">
          <i class="fas fa-check-circle"></i>
          <p>این دستگاه قبلاً به مشتری تحویل داده شده است</p>
        </div>
      </div>
    </div>

    <!-- <div v-else class="error-container">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ errorMessage || 'اطلاعات تعمیر یافت نشد' }}</p>
      <button class="back-btn" @click="navigateTo('/admin/admin_counter')">
        بازگشت به لیست
      </button>
    </div> -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { navigateTo } from 'nuxt/app'
import { useRoute } from 'vue-router'
import { useNuxtApp } from '#app'

const verificationCode = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const currentRepair = ref(null)
const isVerifying = ref(false)
const isLoading = ref(false);

const route = useRoute();
const { $api } = useNuxtApp();
const v_code = route.query.v_code;

// بارگذاری اطلاعات تعمیر بر اساس کد رهگیری از URL
onMounted(async () => {
  if (!v_code) {
    errorMessage.value = 'کد رهگیری در آدرس صفحه وجود ندارد.';
    return;
  }

  try {
    isLoading.value = true
    const response = await $api.get(`/device/by-code/${v_code}`);
    currentRepair.value = response.data;
    if (currentRepair.value.status === 'delivered') {
      successMessage.value = 'این دستگاه قبلاً به مشتری تحویل داده شده است';
    }
  } catch (error) {
    
    errorMessage.value = error.response?.data?.message || 'خطا در بارگذاری اطلاعات تعمیر';
  }
  finally {
    isLoading.value = false
  }


});

// بررسی کد تأیید
const verifyCode = async () => {
  if (isVerifying.value) return;
  isVerifying.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const response = await $api.post('/delivery/verify', {
      v_code: currentRepair.value.verification_code,
      user_code: verificationCode.value
    });

    // آپدیت وضعیت دستگاه به 'delivered'
    await $api.patch(`/device/repair/${currentRepair.value.id}`, {
      status: 'delivered'
    });

    successMessage.value = response.data.message || 'دستگاه با موفقیت تحویل داده شد.';
    currentRepair.value.status = 'delivered';

    // بعد از 2 ثانیه رفتن به صفحه financial با باز شدن مودال همان دستگاه
    setTimeout(() => {
      navigateTo(`/admin/financial?open_modal_device=${currentRepair.value.id}`);
    }, 2000);

  } catch (error) {
    
    errorMessage.value = error.response?.data?.message || 'کد وارد شده صحیح نیست یا خطایی رخ داده است.';
  } finally {
    isVerifying.value = false;
  }
};


const cancelDelivery = () => {
  if (confirm('آیا از لغو فرآیند تحویل اطمینان دارید؟')) {
    navigateTo('/admin/admin_counter');
  }
};
</script>

<style scoped>

.loading-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        }
        .spinner {
            width: 50px;
            height: 50px;
            border: 5px solid #f3f3f3;
            border-top: 5px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        .loading-text {
            color: #fff;
            font-size: 1.2rem;
            margin-top: 10px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }


.verification-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #f8f9fa;
}

.verification-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 600px;
  padding: 30px;
}

.verification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.verification-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.cancel-btn {
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s;
}

.cancel-btn:hover {
  background: #fee2e2;
}

.repair-info {
  margin-bottom: 30px;
}

.info-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.info-section h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.info-item span {
  color: #2c3e50;
  font-weight: 500;
}

.verification-section {
  margin-top: 30px;
}

.verification-info {
  margin-bottom: 20px;
}

.test-code-hint {
  background: #fff3cd;
  color: #856404;
  padding: 12px;
  border-radius: 6px;
  text-align: center;
  font-weight: 500;
  margin: 0;
}

.code-input-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.input-group {
  display: flex;
  gap: 10px;
}

.input-group input {
  flex: 1;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1.1rem;
  text-align: center;
  letter-spacing: 2px;
  transition: all 0.3s;
}

.input-group input:focus {
  border-color: #3498db;
  outline: none;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.verify-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  transition: all 0.3s;
}

.verify-btn:hover:not(:disabled) {
  background: #2980b9;
}

.verify-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.error-message {
  background: #fee2e2;
  color: #dc2626;
  padding: 12px;
  border-radius: 6px;
  text-align: center;
}

.success-message {
  background: #dcfce7;
  color: #16a34a;
  padding: 12px;
  border-radius: 6px;
  text-align: center;
}

.delivered-message {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  color: #7f8c8d;
}

.delivered-message i {
  font-size: 2rem;
  color: #2ecc71;
  margin-bottom: 10px;
}

.error-container {
  text-align: center;
  padding: 30px;
}

.error-container i {
  font-size: 3rem;
  color: #e74c3c;
  margin-bottom: 15px;
}

.back-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.3s;
}

.back-btn:hover {
  background: #2980b9;
}

@media (max-width: 640px) {
  .verification-container {
    padding: 20px;
  }

  .input-group {
    flex-direction: column;
  }

  .verify-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (prefers-color-scheme: dark) {
  .verification-page {
    background: #1a1a1a;
  }

  .verification-container {
    background: #2c2c2c;
  }

  .verification-header h2 {
    color: #ffffff;
  }

  .info-section {
    background: #1a1a1a;
  }

  .info-item label {
    color: #a0a0a0;
  }

  .info-item span {
    color: #ffffff;
  }

  .test-code-hint {
    background: #2c2c2c;
    color: #ffd700;
  }

  .input-group input {
    background: #1a1a1a;
    border-color: #4a4a4a;
    color: #ffffff;
  }

  .input-group input:focus {
    border-color: #3498db;
  }

  .delivered-message {
    background: #1a1a1a;
    color: #a0a0a0;
  }

  .error-message {
    background: #2c1a1a;
    color: #ff6b6b;
  }

  .success-message {
    background: #1a2c1a;
    color: #6bff6b;
  }
}
</style>