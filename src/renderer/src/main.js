import { createApp } from 'vue'
import App from './App.vue'
import './assets/global.css'
import PrimeVue from 'primevue/config'
import Material from '@primevue/themes/material' // 改用官方标准主题包

createApp(App)
  .use(PrimeVue, {
    ripple: false, // 完全禁用涟漪效果
    theme: {
      preset: Material, // 使用 definePreset 配置
      options: {
        prefix: 'p',
        darkModeSelector: 'system',
        cssLayer: false
      }
    }
  })
  .mount('#app')
