import { useAuth } from '~/composables/useAuth'

// تابع کمکی برای بررسی وضعیت ادمین
const isAdminAuthenticated = () => {
  try {
    const userData = JSON.parse(localStorage.getItem('currentUser') || 'null')
    const userType = localStorage.getItem('userType')
    const token = sessionStorage.getItem('auth_token')
    const loginTime = sessionStorage.getItem('loginTime')

    if (!userData || !userType || !token || !loginTime) {
      return false
    }

    if (userType !== 'admin') {
      return false
    }

    const loginTimestamp = parseInt(loginTime)
    const now = Date.now()
    const hoursSinceLogin = (now - loginTimestamp) / (1000 * 60 * 60)

    if (hoursSinceLogin > 24) {
      return false
    }

    const admins = JSON.parse(localStorage.getItem('admins') || '[]')
    return admins.some((admin: any) => 
      admin && 
      admin.id === userData.id && 
      admin.phone === userData.phone && 
      admin.status === 'active'
    )
  } catch {
    return false
  }
}

export default defineNuxtRouteMiddleware((to) => {
  // اگر در صفحه لاگین هستیم، اجازه ادامه می‌دهیم
  if (to.path === '/login') {
    return
  }

  // فقط مسیرهای ادمین را چک می‌کنیم
  if (to.path.startsWith('/admin')) {
    // بررسی مستقیم وضعیت ادمین
    if (!isAdminAuthenticated()) {
      const { clearAuth } = useAuth()
      clearAuth()
      return navigateTo('/login', { replace: true })
    }
  }
}) 