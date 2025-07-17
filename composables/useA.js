// import { ref, readonly } from 'vue'

// const authState = ref({
//   isLoggedIn: false,
//   role: null,
//   currentUser: null,
//   token: null
// })

// export const useAuth = () => {
//   const setAuth = (user, type, token) => {
//     if (typeof window === 'undefined') return
    
//     // ذخیره در sessionStorage
//     sessionStorage.setItem('auth_token', token)
//     sessionStorage.setItem('currentUser', JSON.stringify(user))
//     sessionStorage.setItem('role', type)
//     sessionStorage.setItem('loginTime', Date.now().toString())
    
//     // ذخیره در localStorage
//     localStorage.setItem('access_token', token)
//     localStorage.setItem('role', type)
    
//     // ذخیره در state
//     authState.value = {
//       isLoggedIn: true,
//       role: type,
//       currentUser: user,
//       token
//     }
//   }

//   const clearAuth = () => {
//     if (typeof window === 'undefined') return
    
//     // پاک کردن از sessionStorage
//     sessionStorage.clear()
    
//     // پاک کردن از localStorage
//     localStorage.removeItem('access_token')
//     localStorage.removeItem('role')
//     localStorage.removeItem('loginTime')
    
//     // پاک کردن از state
//     authState.value = {
//       isLoggedIn: false,
//       role: null,
//       currentUser: null,
//       token: null
//     }
//   }

//   const checkAuth = () => {
//     if (typeof window === 'undefined') {
//       return { isLoggedIn: false, role: null, currentUser: null }
//     }

//     try {
//       const access_token = localStorage.getItem('access_token')
//       const role = localStorage.getItem('role')
//       const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null')
//       const loginTime = localStorage.getItem('loginTime')

//       // بررسی وجود توکن و اعتبار آن
//       if (!access_token || !role || !loginTime) {
//         clearAuth()
//         return { isLoggedIn: false, role: null, currentUser: null }
//       }

//       // بررسی زمان ورود
//       const loginTimestamp = parseInt(loginTime)
//       const now = Date.now()
//       const hoursSinceLogin = (now - loginTimestamp) / (1000 * 60 * 60)
      
//       if (hoursSinceLogin > 24) {
//         clearAuth()
//         return { isLoggedIn: false, role: null, currentUser: null }
//       }

//       // بررسی اعتبار کاربر
//       if (role === '1') {
//         const admins = JSON.parse(localStorage.getItem('admins') || '[]')
//         const adminExists = admins.some(admin => 
//           admin && 
//           admin.id === currentUser.id && 
//           admin.phone === currentUser.phone && 
//           admin.status === 'active'
//         )
//         if (!adminExists) {
//           clearAuth()
//           return { isLoggedIn: false, role: null, currentUser: null }
//         }
//       } else if (role === '2') {
//         const repairmen = JSON.parse(localStorage.getItem('repairmen') || '[]')
//         const repairmanExists = repairmen.some(repairman => 
//           repairman && 
//           repairman.id === currentUser.id && 
//           repairman.phone === currentUser.phone && 
//           repairman.status === 'active'
//         )
//         if (!repairmanExists) {
//           clearAuth()
//           return { isLoggedIn: false, role: null, currentUser: null }
//         }
//       } else {
//         clearAuth()
//         return { isLoggedIn: false, role: null, currentUser: null }
//       }

//       // اگر نقش ادمین بود، هیچ شرط دیگری اجرا نشود
//       if (role === '1' || role === 1) {
//         authState.value = {
//           isLoggedIn: true,
//           role,
//           currentUser,
//           token: access_token
//         }
//         return { isLoggedIn: true, role, currentUser }
//       }

//       // اگر currentUser وجود ندارد یا null است، هیچ بررسی اضافه‌ای انجام نشود
//       if (!currentUser || typeof currentUser !== 'object') {
//         clearAuth()
//         return { isLoggedIn: false, role: null, currentUser: null }
//       }

//       // اگر نیاز به بررسی repairmen بود، قبل از هر استفاده از id یا سایر پراپرتی‌ها، وجود و معتبر بودن را بررسی کن
//       // مثال:
//       // const repairmen = ...
//       // if (Array.isArray(repairmen) && repairmen.some(r => r && r.id && r.status === 'active')) {
//       //   // مجوز ورود بده
//       // }

//       authState.value = {
//         isLoggedIn: true,
//         role,
//         currentUser,
//         token: access_token
//       }
//       return { isLoggedIn: true, role, currentUser }
//     } catch (error) {
//       console.error('Auth check error:', error)
//       clearAuth()
//       return { isLoggedIn: false, role: null, currentUser: null }
//     }
//   }

//   return {
//     auth: readonly(authState),
//     setAuth,
//     clearAuth,
//     checkAuth
//   }
// } 