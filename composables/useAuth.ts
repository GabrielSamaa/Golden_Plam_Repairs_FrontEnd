// ~/composables/useAuth.ts
import { ref, readonly } from 'vue'

interface User {
  id: number
  name: string
  phone: string
  role: number
  status?: string
}

interface AuthState {
  isInitialized: boolean
  isAuthenticated: boolean
  userType: 'admin' | 'repairman' | null
  currentUser: User | null
  token: string | null
  loginTime: number | null
}

const authState = ref<AuthState>({
  isInitialized: false,
  isAuthenticated: false,
  userType: null,
  currentUser: null,
  token: null,
  loginTime: null
})

export const useAuth = () => {
  // مقداردهی اولیه وضعیت احراز هویت
  const initializeAuth = () => {
    if (authState.value.isInitialized) return

    try {
      const token = sessionStorage.getItem('auth_token')
      const userData = JSON.parse(localStorage.getItem('user_data') || 'null')
      const loginTime = localStorage.getItem('login_time')

      if (token && userData && loginTime) {
        const loginTimestamp = parseInt(loginTime)
        const hoursSinceLogin = (Date.now() - loginTimestamp) / (1000 * 60 * 60)

        if (hoursSinceLogin <= 24) {
          const userType = userData.role === 1 ? 'admin' : 'repairman'
          
          // بررسی وجود کاربر در لیست مربوطه
          const userList = JSON.parse(
            localStorage.getItem(userType === 'admin' ? 'admins' : 'repairmen') || '[]'
          )
          
          const userExists = userList.some((u: User) => 
            u?.id === userData.id && 
            u?.phone === userData.phone
          )

          if (userExists) {
            authState.value = {
              isInitialized: true,
              isAuthenticated: true,
              userType,
              currentUser: userData,
              token,
              loginTime: loginTimestamp
            }
            return
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
    }

    clearAuth()
  }

  // تنظیم وضعیت احراز هویت
  const setAuth = (token: string, userData: User) => {
    const loginTime = Date.now()
    const userType = userData.role === 1 ? 'admin' : 'repairman'

    // ذخیره در localStorage و sessionStorage
    localStorage.setItem('user_data', JSON.stringify(userData))
    localStorage.setItem('login_time', loginTime.toString())
    sessionStorage.setItem('auth_token', token)

    // به‌روزرسانی state
    authState.value = {
      isInitialized: true,
      isAuthenticated: true,
      userType,
      currentUser: userData,
      token,
      loginTime
    }
  }

  // پاک کردن وضعیت احراز هویت
  const clearAuth = () => {
    localStorage.removeItem('user_data')
    localStorage.removeItem('login_time')
    sessionStorage.removeItem('auth_token')

    authState.value = {
      isInitialized: true,
      isAuthenticated: false,
      userType: null,
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