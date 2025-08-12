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
  instance.interceptors.request.use(
    (config) => {
      if (typeof window !== 'undefined') {
        // Get token from sessionStorage
        const token = sessionStorage.getItem('auth_token');

        if (token) {
          // Ensure the Authorization header is set correctly
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => {
      // Do something with request error
      return Promise.reject(error);
    }
  );

  return {
    provide: {
      axios: instance,
      api: instance // Provide both $axios and $api for consistency
    }
  }
})