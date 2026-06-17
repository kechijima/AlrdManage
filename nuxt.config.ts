export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  ssr: false,
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'ALRD Management',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },
  nitro: {
    prerender: {
      routes: [
        '/vehicles/v1', '/vehicles/v2', '/vehicles/v3', '/vehicles/v4', '/vehicles/v5', '/vehicles/v6',
        '/sales/s1', '/sales/s2', '/sales/s3',
        '/goods/g1', '/goods/g2', '/goods/g3', '/goods/g4',
        '/customers/c1', '/customers/c2', '/customers/c3', '/customers/c4',
        '/fps/fp1', '/fps/fp2', '/fps/fp3',
      ]
    }
  }
})
