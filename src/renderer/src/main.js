import { createApp } from 'vue'
import { createPinia } from 'pinia' // 新增 Pinia 导入
import App from './App.vue'
import './assets/global.css'
import PrimeVue from 'primevue/config'
import Material from '@primeuix/themes/material' // 改用官方标准主题包

const app = createApp(App)
const pinia = createPinia() // 创建 Pinia 实例

app
  .use(pinia) // 先安装 Pinia
  .use(PrimeVue, {
    ripple: false,
    theme: {
      preset: Material,
      options: {
        prefix: 'p',
        darkModeSelector: 'system',
        cssLayer: false
      }
    }
  })
  .mount('#app')
