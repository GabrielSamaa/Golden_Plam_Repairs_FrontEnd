// ~/middleware/admin.global.ts
import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware((to) => {
  // مقداردهی اولیه useAuth
  const auth = useAuth()
  
  // برای مسیر لاگین بررسی نکن
  if (to.path === '/login') {
    return
  }

  // فقط برای مسیرهای ادمین بررسی انجام بده
  if (to.path.startsWith('/admin')) {
    // ابتدا وضعیت احراز هویت را بررسی کن
    const { isAuthenticated, userType, currentUser } = auth.checkAuth()

    // اگر کاربر احراز هویت نشده یا ادمین نیست
    if (!isAuthenticated || userType !== 'admin' || !currentUser) {
      auth.clearAuth()
      return navigateTo('/login', { replace: true })
    }

    // بررسی اضافی برای ادمین فعال (اختیاری)
    try {
      const admins = JSON.parse(localStorage.getItem('admins') || '[]')
      const adminExists = admins.some((admin: any) => 
        admin?.id === currentUser.id &&
        admin?.phone === currentUser.phone &&
        admin?.status === 'active'
      )
      
      if (!adminExists) {
        auth.clearAuth()
        return navigateTo('/login', { replace: true })
      }
    } catch (error) {
      auth.clearAuth()
      return navigateTo('/login', { replace: true })
    }
  }
})