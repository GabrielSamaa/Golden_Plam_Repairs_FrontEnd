<template>
  <div class="settings-page">
    <div class="page-header">
      <h2>تنظیمات سیستم</h2>
    </div>

    <div class="settings-container">
      <!-- General Settings -->
      <div class="settings-section">
        <h3>تنظیمات عمومی</h3>
        <div class="settings-form">
          <div class="form-group">
            <label>نام شرکت</label>
            <input 
              type="text" 
              class="form-control" 
              v-model="settings.companyName"
            >
          </div>
          <div class="form-group">
            <label>آدرس</label>
            <input 
              type="text" 
              class="form-control" 
              v-model="settings.address"
            >
          </div>
          <div class="form-group">
            <label>شماره تماس</label>
            <input 
              type="tel" 
              class="form-control" 
              v-model="settings.phone"
            >
          </div>
          <div class="form-group">
            <label>ایمیل</label>
            <input 
              type="email" 
              class="form-control" 
              v-model="settings.email"
            >
          </div>
        </div>
      </div>

      <!-- Notification Settings -->
      <div class="settings-section">
        <h3>تنظیمات اعلان‌ها</h3>
        <div class="settings-form">
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="settings.notifications.email"
              >
              ارسال اعلان‌ها از طریق ایمیل
            </label>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="settings.notifications.sms"
              >
              ارسال اعلان‌ها از طریق پیامک
            </label>
          </div>
          <div class="form-group">
            <label>قالب پیامک</label>
            <textarea 
              class="form-control" 
              v-model="settings.notifications.smsTemplate"
              rows="3"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Backup Settings -->
      <div class="settings-section">
        <h3>تنظیمات پشتیبان‌گیری</h3>
        <div class="settings-form">
          <div class="form-group">
            <label>دوره پشتیبان‌گیری</label>
            <select class="form-control" v-model="settings.backup.interval">
              <option value="daily">روزانه</option>
              <option value="weekly">هفتگی</option>
              <option value="monthly">ماهانه</option>
            </select>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="settings.backup.autoBackup"
              >
              پشتیبان‌گیری خودکار
            </label>
          </div>
          <div class="form-group">
            <label>تعداد نسخه‌های نگهداری شده</label>
            <input 
              type="number" 
              class="form-control" 
              v-model="settings.backup.keepVersions"
              min="1"
              max="10"
            >
          </div>
        </div>
      </div>

      <!-- Security Settings -->
      <div class="settings-section">
        <h3>تنظیمات امنیتی</h3>
        <div class="settings-form">
          <div class="form-group">
            <label>حداقل طول رمز عبور</label>
            <input 
              type="number" 
              class="form-control" 
              v-model="settings.security.minPasswordLength"
              min="6"
              max="20"
            >
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="settings.security.requireSpecialChars"
              >
              نیاز به کاراکترهای خاص
            </label>
          </div>
          <div class="form-group">
            <label>زمان انقضای نشست (دقیقه)</label>
            <input 
              type="number" 
              class="form-control" 
              v-model="settings.security.sessionTimeout"
              min="5"
              max="120"
            >
          </div>
        </div>
      </div>

      <div class="settings-actions">
        <button class="btn btn-secondary" @click="resetSettings">
          بازنشانی تنظیمات
        </button>
        <button class="btn btn-primary" @click="saveSettings">
          ذخیره تنظیمات
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

definePageMeta({
  layout: 'admin'
})

const settings = ref({
  companyName: 'تعمیرگاه طلایی',
  address: 'تهران، خیابان ولیعصر',
  phone: '021-12345678',
  email: 'info@golden-palm.ir',
  notifications: {
    email: true,
    sms: true,
    smsTemplate: 'مشتری گرامی، وضعیت درخواست شما به روز شد.'
  },
  backup: {
    interval: 'daily',
    autoBackup: true,
    keepVersions: 5
  },
  security: {
    minPasswordLength: 8,
    requireSpecialChars: true,
    sessionTimeout: 30
  }
})

const saveSettings = () => {
  // در واقعیت اینجا درخواست به سرور ارسال می‌شود
  console.log('ذخیره تنظیمات:', settings.value)
  alert('تنظیمات با موفقیت ذخیره شد.')
}

const resetSettings = () => {
  if (confirm('آیا از بازنشانی تنظیمات اطمینان دارید؟')) {
    settings.value = {
      companyName: 'تعمیرگاه طلایی',
      address: 'تهران، خیابان ولیعصر',
      phone: '021-12345678',
      email: 'info@golden-palm.ir',
      notifications: {
        email: true,
        sms: true,
        smsTemplate: 'مشتری گرامی، وضعیت درخواست شما به روز شد.'
      },
      backup: {
        interval: 'daily',
        autoBackup: true,
        keepVersions: 5
      },
      security: {
        minPasswordLength: 8,
        requireSpecialChars: true,
        sessionTimeout: 30
      }
    }
  }
}
</script>

<style scoped>
.settings-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.settings-container {
  display: grid;
  gap: 20px;
}

.settings-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.settings-section h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.settings-form {
  display: grid;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-weight: 500;
  color: #34495e;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.form-control {
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

textarea.form-control {
  resize: vertical;
  min-height: 80px;
}

.settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn {
  padding: 8px 15px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

@media (min-width: 768px) {
  .settings-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .settings-page {
    padding: 10px;
  }

  .settings-section {
    padding: 15px;
  }

  .settings-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
