export default defineNuxtRouteMiddleware((to) => {
  const { isLoggedIn, userType, currentUser } = useAuth().checkAuth();
  
  // بررسی اولیه احراز هویت
  if (!isLoggedIn || userType !== 'admin') {
    useAuth().clearAuth();
    return navigateTo('/login');
  }

  // بررسی زمان لاگین (24 ساعت)
  const loginTime = parseInt(localStorage.getItem('loginTime') || 0);
  if ((Date.now() - loginTime) > 24 * 60 * 60 * 1000) {
    useAuth().clearAuth();
    return navigateTo('/login');
  }

  // بررسی مسیرهای مجاز
  const allowedRoutes = [
   '/admin/admin_counter',
    '/admin/admins',
    '/admin/archive',
    '/admin/financial',
    '/admin/messages',
    '/admin/reception',
    '/admin/Form',
    '/admin/verify-delivery-code'
  ];

  if (!allowedRoutes.some(route => to.path.startsWith(route))) {
    return abortNavigation();
  }
});