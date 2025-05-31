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
    meta: { requiresAuth: true, userType: 'repairman' }
  },
  {
    path: '/repairman/start_repairs',
    name: 'StartRepairs',
    component: () => import('./pages/repairman/start_repairs.vue'),
    meta: { requiresAuth: true, userType: 'repairman' }
  },
  {
    path: '/admin/admins',
    name: 'Admins',
    component: () => import('./pages/admin/admins.vue'),
    meta: { requiresAuth: true, userType: 'admin' }
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
  const requiredUserType = to.matched.some(record => record.meta.userType) 
    ? to.matched.find(record => record.meta.userType).meta.userType 
    : null

  if (requiresAuth) {
    const userType = localStorage.getItem('userType')
    const isAuthenticated = userType === 'repairman' 
      ? localStorage.getItem('currentRepairmanId')
      : localStorage.getItem('currentAdminId')

    if (!isAuthenticated) {
      next('/login')
    } else if (requiredUserType && userType !== requiredUserType) {
      // Redirect to appropriate page based on user type
      next(userType === 'repairman' ? '/repairman/index_repairs' : '/admin/admins')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router