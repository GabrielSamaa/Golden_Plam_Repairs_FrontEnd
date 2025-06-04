import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware((to) => {
  // بررسی وضعیت احراز هویت
  const { checkAuth, clearAuth } = useAuth()
  const { isLoggedIn, userType, currentUser } = checkAuth()

  // اگر کاربر لاگین نکرده باشد یا ادمین نباشد
  if (!isLoggedIn || userType !== 'admin') {
    clearAuth()
    return navigateTo('/login')
  }

  // بررسی اعتبار توکن و زمان ورود
  const token = sessionStorage.getItem('auth_token')
  const loginTime = sessionStorage.getItem('loginTime')

  if (!token || !loginTime) {
    clearAuth()
    return navigateTo('/login')
  }

  // بررسی زمان ورود (نشست منقضی شده)
  const loginTimestamp = parseInt(loginTime)
  const now = Date.now()
  const hoursSinceLogin = (now - loginTimestamp) / (1000 * 60 * 60)
  
  if (hoursSinceLogin > 24) {
    clearAuth()
    return navigateTo('/login')
  }

  // بررسی اعتبار کاربر در لیست ادمین‌ها
  const admins = JSON.parse(localStorage.getItem('admins') || '[]')
  const adminExists = admins.some(admin => 
    admin && 
    admin.id === currentUser.id && 
    admin.phone === currentUser.phone && 
    admin.status === 'active'
  )

  if (!adminExists) {
    clearAuth()
    return navigateTo('/login')
  }

  // بررسی مسیر مجاز
  const allowedRoutes = [
    '/admin/admin_counter',
    '/admin/admins',
    '/admin/archive',
    '/admin/financial',
    '/admin/messages',
    '/admin/reception',
    '/admin/Form',
    '/admin/verify-delivery-code'
  ]

  const isRouteAllowed = allowedRoutes.some(route => to.path.startsWith(route))
  
  if (!isRouteAllowed) {
    clearAuth()
    return navigateTo('/login')
  }
}) 