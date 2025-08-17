export default defineNuxtRouteMiddleware((to) => {
    if (typeof window === 'undefined') return
    const token = sessionStorage.getItem('auth_token')
    const role = localStorage.getItem('role')
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null')

    if (!token || role !== '1' || !user) {
        localStorage.removeItem('role')
        localStorage.removeItem('currentUser')
        localStorage.removeItem('currentAdminId')
        localStorage.removeItem('currentRepairmanId')
        sessionStorage.removeItem('auth_token')
        return navigateTo('/login');
    }

    // بررسی مسیرهای مجاز
    const allowedRoutes = [
        '/admin/index_repairs_admin',
        '/admin/start_repairs_admin',
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