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

  return {
    provide: {
      axios: instance
    }
  }
})