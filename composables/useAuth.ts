import { ref, readonly } from 'vue'

const authState = ref({
  isInitialized: false,
  isAuthenticated: false,
  userType: null as string | null,
  currentUser: null as any,
  token: null as string | null,
  loginTime: null as number | null
})

export const useAuth = () => {
  const initializeAuth = () => {
    if (authState.value.isInitialized) return

    try {
      const userData = JSON.parse(localStorage.getItem('currentUser') || 'null')
      const userType = localStorage.getItem('userType')
      const token = sessionStorage.getItem('auth_token')
      const loginTime = sessionStorage.getItem('loginTime')

      if (userData && userType && token && loginTime) {
        const loginTimestamp = parseInt(loginTime)
        const now = Date.now()
        const hoursSinceLogin = (now - loginTimestamp) / (1000 * 60 * 60)

        if (hoursSinceLogin <= 24) {
          // بررسی اعتبار کاربر در لیست ادمین‌ها یا تعمیرکاران
          const users = JSON.parse(localStorage.getItem(userType === 'admin' ? 'admins' : 'repairmen') || '[]')
          const userExists = users.some((user: any) => 
            user && 
            user.id === userData.id && 
            user.phone === userData.phone && 
            user.status === 'active'
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
      console.error('Error initializing auth:', error)
    }

    // اگر هر کدام از شرایط برقرار نباشد، وضعیت را پاک می‌کنیم
    clearAuth()
  }

  const setAuth = (userData: any, type: string, token: string) => {
    const loginTime = Date.now()
    
    localStorage.setItem('currentUser', JSON.stringify(userData))
    localStorage.setItem('userType', type)
    sessionStorage.setItem('auth_token', token)
    sessionStorage.setItem('loginTime', loginTime.toString())

    authState.value = {
      isInitialized: true,
      isAuthenticated: true,
      userType: type,
      currentUser: userData,
      token,
      loginTime
    }
  }

  const clearAuth = () => {
    localStorage.removeItem('currentUser')
    localStorage.removeItem('userType')
    sessionStorage.removeItem('auth_token')
    sessionStorage.removeItem('loginTime')

    authState.value = {
      isInitialized: true,
      isAuthenticated: false,
      userType: null,
      currentUser: null,
      token: null,
      loginTime: null
    }
  }

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
    initializeAuth
  }
} 