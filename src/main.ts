import { createApp } from 'vue'
import { VueSpinnersPlugin } from 'vue3-spinners'
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify'

import App from './App.vue'
import router from './router'
import { pinia } from '@/store/index'
import './index.css'
import 'vue3-toastify/dist/index.css'
import '@vueform/toggle/themes/default.css'

/* import all the icons in Free Solid, Free Regular, and Brands styles */
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'

import { OpenAPI } from './api/generated'
import { setupInterceptors } from './api/setupInterceptors'
import { useAuthStore } from './store/auth/auth'
import { DEVICE_ID_KEY } from './variable.type'

library.add(fas, far, fab)

if (import.meta.env.PROD) {
  OpenAPI.BASE = import.meta.env.VITE_API_BASE_URL
  OpenAPI.WITH_CREDENTIALS = true
}

const app = createApp(App)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/firebase-messaging-sw.js')
      .then((registration) => {
        console.log('SW registered:', registration)
      })
      .catch((error) => {
        console.error('SW registration failed:', error)
      })
  })
}
app.use(pinia)

const authStore = useAuthStore()

const deviceId = localStorage.getItem(DEVICE_ID_KEY)
if (!deviceId) {
  localStorage.setItem(
    DEVICE_ID_KEY,
    `device_${navigator.userAgentData?.platform}_${crypto.randomUUID().slice(0, 8).toString().toUpperCase()}`,
  )
}

setupInterceptors(
  () => authStore.getAccessToken(),
  () => authStore.refreshToken(),
  () => {
    router.replace('/login')
  },
)

app.use(router)
app.use(VueSpinnersPlugin)
app.use(Vue3Toastify, {
  autoClose: 5000,
  hideProgressBar: false,
  position: 'bottom-right',
  toastClassName: '!p-0 !bg-transparent !shadow-none !min-h-0',
  bodyClassName: '!p-0',
} as ToastContainerOptions)

app.mount('#app')
