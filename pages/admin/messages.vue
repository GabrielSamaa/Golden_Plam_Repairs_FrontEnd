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
            <h3>{{ message.sender }}</h3>
            <span class="date">{{ message.date }}</span>
          </div>
          <div class="message-status">
            <span v-if="!message.read" class="badge">جدید</span>
          </div>
        </div>
        <div class="message-preview">
          {{ message.content.substring(0, 100) }}...
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
              <span>{{ selectedMessage.sender }}</span>
            </div>
            <div class="detail-item">
              <label>ایمیل:</label>
              <span>{{ selectedMessage.email }}</span>
            </div>
            <div class="detail-item">
              <label>تاریخ:</label>
              <span>{{ selectedMessage.date }}</span>
            </div>
            <div class="detail-item">
              <label>متن پیام:</label>
              <div class="message-content">
                {{ selectedMessage.content }}
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

    <!-- Reply Modal -->
    <div class="modal" :class="{ show: showReplyModal }">
      <div class="modal-content">
        <div class="modal-header">
          <h5>پاسخ به پیام</h5>
          <button @click="showReplyModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="sendReply">
            <div class="form-group">
              <label>متن پاسخ:</label>
              <textarea 
                class="form-control" 
                v-model="replyContent" 
                rows="5" 
                required
              ></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="showReplyModal = false">
                انصراف
              </button>
              <button type="submit" class="btn btn-primary">
                ارسال پاسخ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

definePageMeta({
  layout: 'admin'
})

const searchQuery = ref('')
const showMessageModal = ref(false)
const showReplyModal = ref(false)
const selectedMessage = ref(null)
const replyContent = ref('')

const messages = ref([
  {
    id: 1,
    sender: 'علی محمدی',
    email: 'ali@example.com',
    date: '1402/05/15',
    content: 'سلام، من یک مشکل با دستگاه خودم دارم. لطفاً راهنمایی کنید.',
    read: false
  },
  {
    id: 2,
    sender: 'مریم احمدی',
    email: 'maryam@example.com',
    date: '1402/05/14',
    content: 'با سلام، می‌خواستم از خدمات خوب شما تشکر کنم.',
    read: true
  }
])

const filteredMessages = computed(() => {
  if (!searchQuery.value) return messages.value
  const query = searchQuery.value.toLowerCase()
  return messages.value.filter(message => 
    message.sender.toLowerCase().includes(query) ||
    message.content.toLowerCase().includes(query)
  )
})

const viewMessage = (message) => {
  selectedMessage.value = message
  showMessageModal.value = true
  if (!message.read) {
    message.read = true
  }
}

const replyToMessage = () => {
  showMessageModal.value = false
  showReplyModal.value = true
}

const deleteMessage = () => {
  if (confirm('آیا از حذف این پیام اطمینان دارید؟')) {
    messages.value = messages.value.filter(m => m.id !== selectedMessage.value.id)
    showMessageModal.value = false
  }
}

const sendReply = () => {
  // در واقعیت اینجا درخواست به سرور ارسال می‌شود
  console.log('پاسخ به پیام:', {
    messageId: selectedMessage.value.id,
    content: replyContent.value
  })
  showReplyModal.value = false
  replyContent.value = ''
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
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
