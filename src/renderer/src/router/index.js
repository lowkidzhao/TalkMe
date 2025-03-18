import { createRouter, createWebHashHistory } from 'vue-router'
import LinkSer from '../view/LinkSer.vue'

const routes = [{ path: '/', component: LinkSer }]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
