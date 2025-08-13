<template>
  <div class="messages-page">
    <div class="page-header">
      <h2>پیام‌های کاربران</h2>
    </div>

    <div class="search-section">
      <div class="search-box">
        <input 
          type="text" 
          class="form-control" 
          placeholder="جستجو در پیام‌ها..." 
          v-model="searchQuery"
        >
      </div>
    </div>

    <div class="messages-list">
      <div 
        v-for="message in filteredMessages" 
        :key="message.id" 
        class="message-card"
        :class="{ unread: !message.read }"
        @click="viewMessage(message)"
      >
        <div class="message-header">
          <div class="sender-info">
            <h3>{{ message.name }}</h3>
            <span class="date">{{ new Date(message.created_at).toLocaleDateString('fa-IR') }}</span>
          </div>
          <div class="message-status">
            <span v-if="!message.read" class="badge">جدید</span>
          </div>
        </div>
        <div class="message-preview">
          <strong>{{ message.subject }}:</strong> {{ message.message.substring(0, 100) }}...
        </div>
      </div>
    </div>

    <!-- Message View Modal -->
    <div class="modal" :class="{ show: showMessageModal }">
      <div class="modal-content">
        <div class="modal-header">
          <h5>مشاهده پیام</h5>
          <button @click="showMessageModal = false">&times;</button>
        </div>
        <div class="modal-body" v-if="selectedMessage">
          <div class="message-details">
            <div class="detail-item">
              <label>فرستنده:</label>
              <span>{{ selectedMessage.name }}</span>
            </div>
            <div class="detail-item">
              <label>ایمیل:</label>
              <span>{{ selectedMessage.email }}</span>
            </div>
            <div class="detail-item">
              <label>شماره تماس:</label>
              <span>{{ selectedMessage.phone }}</span>
            </div>
            <div class="detail-item">
              <label>موضوع:</label>
              <span>{{ selectedMessage.subject }}</span>
            </div>
            <div class="detail-item">
              <label>تاریخ:</label>
              <span>{{ new Date(selectedMessage.created_at).toLocaleString('fa-IR') }}</span>
            </div>
            <div class="detail-item">
              <label>متن پیام:</label>
              <div class="message-content">
                {{ selectedMessage.message }}
              </div>
            </div>
          </div>
          <div class="message-actions">
            <button class="btn btn-primary" @click="replyToMessage">
              <i class="fas fa-reply"></i> پاسخ
            </button>
            <button class="btn btn-outline-danger" @click="deleteMessage">
              <i class="fas fa-trash"></i> حذف
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNuxtApp } from '#app'

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const { $api } = useNuxtApp()
const searchQuery = ref('')
const showMessageModal = ref(false)
const selectedMessage = ref(null)
const messages = ref([])
const loading = ref(true)
const error = ref(null)

// تابع برای بارگذاری پیام‌ها از API
const loadMessages = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await $api.get('user/Message/')
    messages.value = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  } catch (err) {
    console.error('Error loading messages:', err)
    error.value = 'خطا در بارگذاری پیام‌ها. لطفاً دوباره تلاش کنید.'
  } finally {
    loading.value = false
  }
}

// بارگذاری پیام‌ها در زمان لود صفحه
onMounted(() => {
  loadMessages()
})

const filteredMessages = computed(() => {
  if (!searchQuery.value) return messages.value
  const query = searchQuery.value.toLowerCase()
  return messages.value.filter(message => 
    (message.name && message.name.toLowerCase().includes(query)) ||
    (message.message && message.message.toLowerCase().includes(query)) ||
    (message.email && message.email.toLowerCase().includes(query)) ||
    (message.subject && message.subject.toLowerCase().includes(query)) ||
    (message.phone && message.phone.includes(query))
  )
})

const viewMessage = (message) => {
  selectedMessage.value = message
  showMessageModal.value = true
  // Here you might want to mark the message as read via an API call in the future
}

const replyToMessage = () => {
  if (selectedMessage.value && selectedMessage.value.email) {
    const mailtoLink = `mailto:${selectedMessage.value.email}?subject=RE: ${selectedMessage.value.subject}`
    window.location.href = mailtoLink
    showMessageModal.value = false
  }
}

const deleteMessage = async () => {
  if (selectedMessage.value && confirm('آیا از حذف این پیام اطمینان دارید؟')) {
    try {
      await $api.delete(`user/Message/${selectedMessage.value.id}`)
      messages.value = messages.value.filter(m => m.id !== selectedMessage.value.id)
      showMessageModal.value = false
    } catch (err) {
      console.error('Error deleting message:', err)
      alert('خطا در حذف پیام.')
    }
  }
}
</script>

<style scoped>
.messages-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.search-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.search-box {
  max-width: 500px;
  margin: 0 auto;
}

.messages-list {
  display: grid;
  gap: 15px;
}

.message-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: all 0.3s;
}

.message-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.message-card.unread {
  border-right: 4px solid #3498db;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.sender-info h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #2c3e50;
}

.date {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.message-status .badge {
  background: #3498db;
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.message-preview {
  color: #7f8c8d;
  font-size: 0.95rem;
  line-height: 1.5;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s;
}

.modal.show {
  opacity: 1;
  visibility: visible;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 500px;
  max-width: 95%;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h5 {
  margin: 0;
}

.modal-header button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
}

.modal-body {
  padding: 20px;
}

.message-details {
  display: grid;
  gap: 15px;
  margin-bottom: 20px;
}

.detail-item {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 10px;
  align-items: start;
}

.detail-item label {
  font-weight: 500;
  color: #7f8c8d;
}

.message-content {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  line-height: 1.6;
}

.message-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
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

.btn-outline-danger {
  background: transparent;
  border: 1px solid #e74c3c;
  color: #e74c3c;
}

.btn-outline-danger:hover {
  background: #e74c3c;
  color: white;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
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

.form-group, .form-actions {
  display: none;
}

@media (max-width: 768px) {
  .page-header {
    text-align: center;
  }

  .message-header {
    flex-direction: column;
    gap: 10px;
  }

  .message-status {
    align-self: flex-start;
  }

  .detail-item {
    grid-template-columns: 1fr;
    gap: 5px;
  }

  .message-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
