import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware((to, from) => {
  const { checkAuth } = useAuth()
  
  // بررسی وضعیت احراز هویت
  const { isLoggedIn, userType } = checkAuth()
  
  // مسیرهای مجاز برای هر نوع کاربر
  const allowedRoutes = {
    admin: [
      '/admin/admin_counter',
      '/admin/admins',
      '/admin/archive',
      '/admin/financial',
      '/admin/messages',
      '/admin/reception',
      '/admin/Form',
      '/admin/verify-delivery-code'
    ],
    repairman: [
      '/repairman/index_repairs'
    ]
  }

  // بررسی مجاز بودن مسیر
  const isRouteAllowed = (path, type) => {
    if (!type || !allowedRoutes[type]) return false
    return allowedRoutes[type].some(route => path.startsWith(route))
  }

  const isAdminRoute = to.path.startsWith('/admin/')
  const isRepairmanRoute = to.path.startsWith('/repairman/')
  const isLoginRoute = to.path === '/login'

  // اگر کاربر لاگین نکرده باشد
  if (!isLoggedIn) {
    // اگر در صفحه لاگین نیست، به صفحه لاگین هدایت شود
    if (!isLoginRoute) {
      return navigateTo('/login')
    }
    return
  }

  // اگر کاربر لاگین کرده باشد
  if (isLoggedIn) {
    // اگر در صفحه لاگین است، به پنل مربوطه هدایت شود
    if (isLoginRoute) {
      return navigateTo(userType === 'admin' ? '/admin/admin_counter' : '/repairman/index_repairs')
    }

    // بررسی دسترسی به مسیر
    if (!isRouteAllowed(to.path, userType)) {
      const { clearAuth } = useAuth()
      clearAuth()
      return navigateTo('/login')
    }

    // بررسی دسترسی به مسیرهای ادمین
    if (isAdminRoute && userType !== 'admin') {
      const { clearAuth } = useAuth()
      clearAuth()
      return navigateTo('/login')
    }

    // بررسی دسترسی به مسیرهای تعمیرکار
    if (isRepairmanRoute && userType !== 'repairman') {
      const { clearAuth } = useAuth()
      clearAuth()
      return navigateTo('/login')
    }
  }
}) 