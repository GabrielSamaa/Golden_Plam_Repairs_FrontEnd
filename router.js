import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('./pages/login.vue')
  },
  {
    path: '/repairman/index_repairs',
    name: 'Repairs',
    component: () => import('./pages/repairman/index_repairs.vue'),
    meta: { requiresAuth: true, role: '2' }
  },
  {
    path: '/repairman/start_repairs',
    name: 'StartRepairs',
    component: () => import('./pages/repairman/start_repairs.vue'),
    meta: { requiresAuth: true, role: '2' }
  },
  {
    path: '/admin/admins',
    name: 'Admins',
    component: () => import('./pages/admin/admins.vue'),
    meta: { requiresAuth: true, role: '1' }
  },
  {
    path: '/',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiredRole = to.matched.some(record => record.meta.role) 
    ? to.matched.find(record => record.meta.role).meta.role 
    : null

  if (requiresAuth) {
    const role = localStorage.getItem('role')
    const isAuthenticated = role === '2' 
      ? localStorage.getItem('currentRepairmanId')
      : localStorage.getItem('currentAdminId')

    if (!isAuthenticated) {
      next('/login')
    } else if (requiredRole && role !== requiredRole) {
      // Redirect to appropriate page based on user type
      next(role === '2' ? '/repairman/index_repairs' : '/admin/admins')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router