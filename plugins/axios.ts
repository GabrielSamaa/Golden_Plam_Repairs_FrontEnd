// plugins/axios.ts
import axios from 'axios'

export default defineNuxtPlugin(() => {
  const instance = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })

  // Add interceptor for Authorization header
  instance.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
      let token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
      if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  });

  return {
    provide: {
      axios: instance
    }
  }
})