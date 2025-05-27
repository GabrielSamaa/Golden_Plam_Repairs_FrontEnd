import { hasKeyword } from "./golden_palm_repairs_api/vendor/swagger-api/swagger-ui/src/core/plugins/json-schema-2020-12/fn";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      link: [
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css' },
        { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css' },
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/gh/rastikerdar/vazir-font@v30.1.0/dist/font-face.css' }
      ],
      script: [
        { src: 'https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js', crossorigin: 'anonymous' },
        { src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.min.js', crossorigin: 'anonymous' }
      ],
      charset: 'UTF-8',
      viewport: 'width=device-width, initial-scale=1',
      htmlAttrs: {
        dir: 'rtl',
        lang: 'fa'
      }
    }
  },
  css: [
    '~/assets/css/main.css'
  ]
})


