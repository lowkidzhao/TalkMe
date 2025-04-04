import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { PrimeVueResolver } from '@primevue/auto-import-resolver'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      },
      assetsInclude: ['**/*.woff2']
    },
    plugins: [
      vue(),
      Components({
        resolvers: [
          PrimeVueResolver({
            importStyle: 'css',
            css: {
              inject: true, // 自动注入样式
              utils: true // 启用工具类
            }
          })
        ]
      }),
      tailwindcss()
    ]
  }
})
