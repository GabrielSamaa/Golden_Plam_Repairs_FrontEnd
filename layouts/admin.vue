<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <div class="sidebar" :class="{ 'show': isMobileMenuOpen }">
      <div class="sidebar-header">
        <img src="#" alt="Logo" class="logo">
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
          <li>
            <NuxtLink to="/admin/settings" class="nav-item" active-class="active" @click="closeMenu">
              <i class="fas fa-cog"></i>
              <span>تنظیمات سیستم</span>
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
        <div class="search-box">
          <input type="text" placeholder="جستجو..." class="search-input">
          <i class="fas fa-search"></i>
        </div>
        <div class="user-menu">
          <div class="notifications">
            <i class="fas fa-bell"></i>
            <span class="badge">3</span>
          </div>
          <div class="user-info">
            <img src="#" alt="User" class="user-avatar">
            <span class="user-name">مدیر سیستم</span>
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
import { ref, onMounted, onUnmounted } from 'vue'

const isMobileMenuOpen = ref(false)

const toggleSidebar = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMenu = () => {
  if (window.innerWidth <= 991.98) {
    isMobileMenuOpen.value = false
  }
}

// Handle window resize
const handleResize = () => {
  if (window.innerWidth > 991) {
    isMobileMenuOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize() // Initial check
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
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
}

.notifications i {
  font-size: 1.2rem;
  color: #7f8c8d;
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
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
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

@media (max-width: 991.98px) {
  .sidebar {
    position: fixed;
    top: 0;
    right: -250px;
    height: 100vh;
    width: 250px;
  }

  .sidebar.show {
    right: 0;
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