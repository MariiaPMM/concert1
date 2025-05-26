import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    component: () => import('@/views/HomeView.vue'),
    children: [
      // {
      //   path: '',
      //   name: 'TheHeader',
      //   component: () => import('@/views/TheHeader.vue'),
      // },{
      //   path: '',
      //   name: 'TheSlider',
      //   component: () => import('@/components/TheSlider.vue'),
      // }
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
