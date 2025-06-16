import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CartView from '../components/CartView.vue'
// import RegisterForm from '../components/AuthModal.vue'
import UserCabinet from '../views/UserCabinet.vue'
import LoginForm from '../components/AuthModal.vue'

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
  {
    path: '/auth',
    name: 'Auth',
    component: LoginForm,
  },
  {
    path: '/cabinet',
    name: 'Cabinet',
    component: UserCabinet,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
