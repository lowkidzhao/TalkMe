import { createRouter, createWebHashHistory } from 'vue-router'
import LinkSer from '../view/LinkSer.vue'

const routes = [
  { path: '/', component: LinkSer },
  { path: '/showAll', component: () => import('../view/ShowAll.vue') }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
