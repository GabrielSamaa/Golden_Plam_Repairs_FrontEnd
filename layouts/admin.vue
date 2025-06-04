<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <div class="sidebar" :class="{ 'show': isMobileMenuOpen }">
      <div class="sidebar-header">
        <img src="/assets/images/2.png" alt="Logo" class="logo">
        <button class="close-btn d-lg-none" @click="toggleSidebar">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <nav class="sidebar-nav">
        <ul>
          <li>
            <NuxtLink to="/admin/admin_counter" class="nav-item" active-class="active" @click="closeMenu">
              <i class="fas fa-home"></i>
              <span>پیشخوان</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/admin/reception" class="nav-item" active-class="active" @click="closeMenu">
              <i class="fas fa-clipboard-check"></i>
              <span>پذیرش</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/admin/financial" class="nav-item" active-class="active" @click="closeMenu">
              <i class="fas fa-money-bill-wave"></i>
              <span>مدیریت مالی</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/admin/archive" class="nav-item" active-class="active" @click="closeMenu">
              <i class="fas fa-archive"></i>
              <span>بایگانی</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/admin/messages" class="nav-item" active-class="active" @click="closeMenu">
              <i class="fas fa-envelope"></i>
              <span>پیام‌های کاربران</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/admin/admins" class="nav-item" active-class="active" @click="closeMenu">
              <i class="fas fa-users-cog"></i>
              <span>مدیریت ادمین‌ها</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Top Bar -->
      <div class="top-bar">
        <button class="navbar-toggler" type="button" @click="toggleSidebar">
          <span class="navbar-toggler-icon"></span>
        </button>
        <!-- <div class="search-box">
          <input type="text" placeholder="جستجو..." class="search-input">
          <i class="fas fa-search"></i>
        </div> -->
        <div class="user-menu">
          <NuxtLink to="/admin/messages" class="notifications" :class="{ 'has-unread': unreadCount > 0 }">
            <i class="fas fa-bell"></i>
            <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
          </NuxtLink>
          <div class="user-info" @click="toggleUserMenu">
            <img src="/assets/images/2.png" alt="User" class="user-avatar">
            <span class="user-name">{{ currentUser?.name || 'مدیر سیستم' }}</span>
            <i class="fas fa-chevron-down" :class="{ 'rotate': isUserMenuOpen }"></i>
          </div>
          <!-- منوی کاربر -->
          <div class="user-dropdown" v-if="isUserMenuOpen" v-click-outside="closeUserMenu">
            <div class="user-dropdown-header">
              <img src="/assets/images/2.png" alt="User" class="user-dropdown-avatar">
              <div class="user-dropdown-info">
                <span class="user-dropdown-name">{{ currentUser?.name || 'مدیر سیستم' }}</span>
                <span class="user-dropdown-role">{{ currentUser?.role === 'admin' ? 'مدیر سیستم' : 'کاربر' }}</span>
              </div>
            </div>
            <div class="user-dropdown-divider"></div>
            <button class="user-dropdown-item" @click="handleLogout">
              <i class="fas fa-sign-out-alt"></i>
              <span>خروج از سیستم</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Page Content -->
      <div class="page-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'

// حذف middleware از اینجا چون از middleware سراسری استفاده می‌کنیم
definePageMeta({
  layout: 'admin'
})

const router = useRouter()
const route = useRoute()
const isMobileMenuOpen = ref(false)
const isUserMenuOpen = ref(false)
const unreadCount = ref(0)
const currentUser = ref(null)

// اضافه کردن watch برای تغییر مسیر
watch(() => route.path, (newPath) => {
  // بستن منوی موبایل در تغییر مسیر
  if (window.innerWidth <= 991.98) {
    isMobileMenuOpen.value = false
  }
  // بستن منوی کاربر در تغییر مسیر
  isUserMenuOpen.value = false
})

const toggleSidebar = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMenu = () => {
  if (window.innerWidth <= 991.98) {
    isMobileMenuOpen.value = false
  }
}

// Handle window resiz
const handleResize = () => {
  if (window.innerWidth > 991) {
    isMobileMenuOpen.value = false
  }
}

// تابع برای به‌روزرسانی تعداد پیام‌های نخوانده
const updateUnreadCount = () => {
  const messages = JSON.parse(localStorage.getItem('userMessages') || '[]')
  unreadCount.value = messages.filter(message => !message.read).length
}

// تابع برای باز/بسته کردن منوی کاربر
const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

// تابع برای بستن منوی کاربر با کلیک خارج از آن
const closeUserMenu = () => {
  isUserMenuOpen.value = false
}

// تابع برای خروج از سیستم
const handleLogout = async () => {
  try {
    const { clearAuth } = useAuth()
    
    // پاک کردن اطلاعات از composable
    clearAuth()
    
    // پاک کردن اطلاعات از localStorage
    localStorage.removeItem('currentUser')
    localStorage.removeItem('userType')
    localStorage.removeItem('loginVerificationCode')
    localStorage.removeItem('userMessages')
    
    // پاک کردن اطلاعات از sessionStorage
    sessionStorage.removeItem('auth_token')
    sessionStorage.removeItem('loginTime')
    sessionStorage.removeItem('currentUser')
    sessionStorage.removeItem('userType')
    
    // بستن منوی کاربر
    closeUserMenu()
    
    // هدایت به صفحه لاگین
    await router.replace('/login')
  } catch (error) {
    console.error('Error during logout:', error)
  }
}

// تابع برای به‌روزرسانی اطلاعات کاربر
const updateUserInfo = () => {
  try {
    const userData = JSON.parse(localStorage.getItem('currentUser') || 'null')
    currentUser.value = userData
  } catch (error) {
    console.error('Error updating user info:', error)
    currentUser.value = null
  }
}

// به‌روزرسانی تعداد پیام‌ها در زمان لود صفحه
onMounted(() => {
  updateUnreadCount()
  updateUserInfo()
  window.addEventListener('storage', () => {
    updateUnreadCount()
    updateUserInfo()
  })
  window.addEventListener('resize', handleResize)
  handleResize()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('storage', () => {
    updateUnreadCount()
    updateUserInfo()
  })
})
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f6fa;
  position: relative;
}

.sidebar {
  width: 250px;
  background: #2c3e50;
  color: white;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
}

.sidebar-header {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.logo {
  height: 40px;
  width: auto;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 5px;
  font-size: 1.2rem;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: white;
  text-decoration: none;
  transition: all 0.3s;
}

.nav-item i {
  width: 20px;
  margin-left: 10px;
}

.nav-item:hover {
  background: rgba(255,255,255,0.1);
}

.nav-item.active {
  background: #3498db;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin-right: 250px;
}

.top-bar {
  background: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-toggler {
  display: none;
  background: none;
  border: none;
  padding: 5px;
  cursor: pointer;
}

.navbar-toggler-icon {
  display: inline-block;
  width: 1.5em;
  height: 1.5em;
  vertical-align: middle;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100%;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%280, 0, 0, 0.55%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
}

.search-box {
  position: relative;
  width: 300px;
}

.search-input {
  width: 100%;
  padding: 8px 35px 8px 15px;
  border: 1px solid #ddd;
  border-radius: 20px;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.search-box i {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 20px;
}

.notifications {
  position: relative;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.3s;
}

.notifications:hover {
  background: rgba(0,0,0,0.05);
}

.notifications.has-unread i {
  color: #3498db;
}

.notifications i {
  font-size: 1.2rem;
  color: #7f8c8d;
  transition: all 0.3s;
}

.badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #e74c3c;
  color: white;
  font-size: 0.7rem;
  padding: 2px 5px;
  border-radius: 10px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 20px;
  transition: all 0.3s;
}

.user-info:hover {
  background: rgba(0,0,0,0.05);
}

.user-info i {
  font-size: 0.8rem;
  color: #7f8c8d;
  transition: transform 0.3s;
}

.user-info i.rotate {
  transform: rotate(180deg);
}

.user-avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  color: #2c3e50;
  font-weight: 500;
}

.page-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  left: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  min-width: 200px;
  z-index: 1000;
  margin-top: 10px;
}

.user-dropdown-header {
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-dropdown-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-dropdown-info {
  display: flex;
  flex-direction: column;
}

.user-dropdown-name {
  font-weight: 500;
  color: #2c3e50;
}

.user-dropdown-role {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.user-dropdown-divider {
  height: 1px;
  background: #eee;
  margin: 5px 0;
}

.user-dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 15px;
  width: 100%;
  border: none;
  background: none;
  color: #2c3e50;
  cursor: pointer;
  transition: all 0.3s;
  text-align: right;
}

.user-dropdown-item:hover {
  background: #f8f9fa;
  color: #e74c3c;
}

.user-dropdown-item i {
  font-size: 1rem;
}

/* اضافه کردن استایل برای کلیک خارج از منو */
.v-click-outside {
  position: relative;
}

@media (max-width: 991.98px) {
  .sidebar {
    transform: translateX(100%);
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    width: 250px;
  }

  .sidebar.show {
    transform: translateX(0);
  }

  .main-content {
    margin-right: 0;
  }

  .navbar-toggler {
    display: block;
  }

  .search-box {
    width: 200px;
  }

  .user-name {
    display: none;
  }

  .page-content {
    padding: 15px;
  }

  .nav-item {
    padding: 15px 20px;
  }

  .nav-item i {
    font-size: 1.2rem;
  }

  .nav-item span {
    font-size: 1rem;
  }

  .user-dropdown {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    margin: 0;
    border-radius: 0;
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
  }
  
  .user-dropdown-item {
    padding: 15px;
  }
}

@media (min-width: 992px) {
  .sidebar {
    position: fixed;
    transform: none;
  }

  .main-content {
    margin-right: 250px;
  }

  .navbar-toggler {
    display: none;
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 100%;
    right: -100%;
  }

  .search-box {
    width: 150px;
  }

  .top-bar {
    padding: 10px 15px;
  }

  .notifications {
    margin-right: 10px;
  }

  .nav-item {
    padding: 12px 15px;
  }
}
</style> 