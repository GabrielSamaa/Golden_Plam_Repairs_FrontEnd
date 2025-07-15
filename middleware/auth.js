export default defineNuxtRouteMiddleware((to, from) => {
  const { isLoggedIn, userType } = useAuth().checkAuth();
  
  const isLoginRoute = to.path === '/login';
  const isAdminRoute = to.path.startsWith('/admin');
  const isRepairmanRoute = to.path.startsWith('/repairman');

  // اگر لاگین نکرده و در صفحه لاگین نیست
  if (!isLoggedIn && !isLoginRoute) {
    return navigateTo('/login');
  }

  // اگر لاگین کرده و در صفحه لاگین است
  if (isLoggedIn && isLoginRoute) {
    return navigateTo(userType === 'admin' ? '/admin' : '/repairman');
  }

  // بررسی دسترسی بر اساس نقش
  if ((isAdminRoute && userType !== 'admin') || 
      (isRepairmanRoute && userType !== 'repairman')) {
    useAuth().clearAuth();
    return navigateTo('/login');
  }
});