// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  app: {
    head: {
      script: [
        {
          src: 'https://unpkg.com/persian-date@1.1.0/dist/persian-date.min.js',
          body: true
        }
      ]
    }
  }
})


