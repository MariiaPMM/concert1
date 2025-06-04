import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CartView from '../components/CartView.vue' 

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/cart',
    name: 'Cart',
    component: CartView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
