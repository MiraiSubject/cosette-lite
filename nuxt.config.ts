import config  from './config.json';

let title = `${config.name} verification`;
let description = `Verify your osu! account for ${config.name}`;

export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: title,
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: description },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '@/assets/main.css'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
  ],
  csp: false,


  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    '@nuxtjs/google-fonts'
  ],
  googleFonts: {
    display: 'swap',
    families: {
      'Open Sans': true
    }
  },
  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    baseURL: config.dev.https ? 'http://localhost:8001' : 'http://localhost:8000', // Used as fallback if no runtime config is provided
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  }
}