export default defineNuxtRouteMiddleware((to, from) => {
  if (typeof window === 'undefined') return
  const token = sessionStorage.getItem('auth_token')
  const role = localStorage.getItem('role')
  const user = JSON.parse(localStorage.getItem('currentUser') || 'null')

  const isLoginRoute = to.path === '/login';
  const isAdminRoute = to.path.startsWith('/admin');
  const isRepairmanRoute = to.path.startsWith('/repairman');

  if ((!token || !role || !user) && !isLoginRoute) {
    return navigateTo('/login');
  }

  if (token && role && user && isLoginRoute) {
    return navigateTo(role === '1' ? '/admin/admin_counter' : '/repairman/index_repairs');
  }

  if ((isAdminRoute && role !== '1') || (isRepairmanRoute && role !== '2')) {
    localStorage.removeItem('role')
    localStorage.removeItem('currentUser')
    localStorage.removeItem('currentAdminId')
    localStorage.removeItem('currentRepairmanId')
    sessionStorage.removeItem('auth_token')
    return navigateTo('/login');
  }
});