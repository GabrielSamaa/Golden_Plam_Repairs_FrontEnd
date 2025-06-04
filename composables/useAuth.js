import { ref, readonly } from 'vue'

const authState = ref({
  isLoggedIn: false,
  userType: null,
  currentUser: null,
  token: null
})

export const useAuth = () => {
  const setAuth = (user, type, token) => {
    if (typeof window === 'undefined') return
    
    // ذخیره در sessionStorage
    sessionStorage.setItem('auth_token', token)
    sessionStorage.setItem('currentUser', JSON.stringify(user))
    sessionStorage.setItem('userType', type)
    sessionStorage.setItem('loginTime', Date.now().toString())
    
    // ذخیره در state
    authState.value = {
      isLoggedIn: true,
      userType: type,
      currentUser: user,
      token
    }
  }

  const clearAuth = () => {
    if (typeof window === 'undefined') return
    
    // پاک کردن از sessionStorage
    sessionStorage.clear()
    
    // پاک کردن از state
    authState.value = {
      isLoggedIn: false,
      userType: null,
      currentUser: null,
      token: null
    }
  }

  const checkAuth = () => {
    if (typeof window === 'undefined') {
      return { isLoggedIn: false, userType: null, currentUser: null }
    }

    try {
      const token = sessionStorage.getItem('auth_token')
      const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null')
      const userType = sessionStorage.getItem('userType')
      const loginTime = sessionStorage.getItem('loginTime')

      // بررسی وجود توکن و اعتبار آن
      if (!token || !currentUser || !userType || !loginTime) {
        clearAuth()
        return { isLoggedIn: false, userType: null, currentUser: null }
      }

      // بررسی زمان ورود
      const loginTimestamp = parseInt(loginTime)
      const now = Date.now()
      const hoursSinceLogin = (now - loginTimestamp) / (1000 * 60 * 60)
      
      if (hoursSinceLogin > 24) {
        clearAuth()
        return { isLoggedIn: false, userType: null, currentUser: null }
      }

      // بررسی اعتبار کاربر
      if (userType === 'admin') {
        const admins = JSON.parse(localStorage.getItem('admins') || '[]')
        const adminExists = admins.some(admin => 
          admin && 
          admin.id === currentUser.id && 
          admin.phone === currentUser.phone && 
          admin.status === 'active'
        )
        if (!adminExists) {
          clearAuth()
          return { isLoggedIn: false, userType: null, currentUser: null }
        }
      } else if (userType === 'repairman') {
        const repairmen = JSON.parse(localStorage.getItem('repairmen') || '[]')
        const repairmanExists = repairmen.some(repairman => 
          repairman && 
          repairman.id === currentUser.id && 
          repairman.phone === currentUser.phone && 
          repairman.status === 'active'
        )
        if (!repairmanExists) {
          clearAuth()
          return { isLoggedIn: false, userType: null, currentUser: null }
        }
      } else {
        clearAuth()
        return { isLoggedIn: false, userType: null, currentUser: null }
      }

      // به‌روزرسانی state
      authState.value = {
        isLoggedIn: true,
        userType,
        currentUser,
        token
      }

      return { isLoggedIn: true, userType, currentUser }
    } catch (error) {
      console.error('Auth check error:', error)
      clearAuth()
      return { isLoggedIn: false, userType: null, currentUser: null }
    }
  }

  return {
    auth: readonly(authState),
    setAuth,
    clearAuth,
    checkAuth
  }
} 