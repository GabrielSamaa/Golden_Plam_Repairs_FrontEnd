// ~/middleware/admin.global.ts
import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware((to) => {
  if (typeof window === 'undefined') return
  const token = sessionStorage.getItem('auth_token')
  const role = localStorage.getItem('role')
  const user = JSON.parse(localStorage.getItem('currentUser') || 'null')

  if (to.path === '/login') {
    return
  }

  if (to.path.startsWith('/admin')) {
    if (!token || role !== '1' || !user) {
      localStorage.removeItem('role')
      localStorage.removeItem('currentUser')
      localStorage.removeItem('currentAdminId')
      localStorage.removeItem('currentRepairmanId')
      sessionStorage.removeItem('auth_token')
      return navigateTo('/login', { replace: true })
    }
  }
})