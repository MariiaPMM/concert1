import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CartView from '../components/CartView.vue'
import RegisterForm from '../components/RegisterForm.vue'

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
    path: '/register',
    name: 'Register',
    component: RegisterForm,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
