// ~/composables/useAuth.ts
import { ref, readonly } from 'vue'

interface User {
  id: number
  name: string
  phone: number
  role: number
  status?: string
}

interface AuthState {
  isInitialized: boolean
  isAuthenticated: boolean
  role: '1' | '2' | null
  currentUser: User | null
  token: string | null
  loginTime: number | null
}

const authState = ref<AuthState>({
  isInitialized: false,
  isAuthenticated: false,
  role: null,
  currentUser: null,
  token: null,
  loginTime: null
})

export const useAuth = () => {
  // مقداردهی اولیه وضعیت احراز هویت
  const initializeAuth = () => {
    if (authState.value.isInitialized) return

    if (typeof window === 'undefined') {
      return
    }

    try {
      const token = sessionStorage.getItem('auth_token')
      const userData = JSON.parse(localStorage.getItem('currentUser') || 'null')
      const role = localStorage.getItem('role')
      if (token && userData && role) {
        authState.value = {
          isInitialized: true,
          isAuthenticated: true,
          role: role as '1' | '2',
          currentUser: userData,
          token,
          loginTime: Date.now()
        }
        return
      }
    } catch (error) {
     
    }
    clearAuth()
  }

  // تنظیم وضعیت احراز هویت
  const setAuth = (token: string, userData: User) => {
    if (typeof window === 'undefined') return
    const role = userData.role == 1 ? '1' : '2'
    localStorage.setItem('role', role)
    localStorage.setItem('currentUser', JSON.stringify(userData))
    sessionStorage.setItem('auth_token', token)
    if (role === '1') {
      localStorage.setItem('currentAdminId', userData.id.toString())
    } else if (role === '2') {
      localStorage.setItem('currentRepairmanId', userData.id.toString())
    }
    authState.value = {
      isInitialized: true,
      isAuthenticated: true,
      role: role as '1' | '2',
      currentUser: userData,
      token,
      loginTime: Date.now()
    }
  }

  // پاک کردن وضعیت احراز هویت
  const clearAuth = () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem('role')
    localStorage.removeItem('currentUser')
    localStorage.removeItem('currentAdminId')
    localStorage.removeItem('currentRepairmanId')
    sessionStorage.removeItem('auth_token')
    authState.value = {
      isInitialized: true,
      isAuthenticated: false,
      role: null,
      currentUser: null,
      token: null,
      loginTime: null
    }
  }

  // بررسی وضعیت احراز هویت
  const checkAuth = () => {
    if (!authState.value.isInitialized) {
      initializeAuth()
    }
    return readonly(authState.value)
  }

  return {
    setAuth,
    clearAuth,
    checkAuth,
    initializeAuth,
    authState: readonly(authState)
  }
}