// import axios from 'axios'
// import { useUserStore } from '@/stores/user'

// const api = axios.create({
//   baseURL: 'http://localhost:3000/api',
// })

// // Додаємо інтерцептор для автоматичного додавання токена
// api.interceptors.request.use(config => {
//   const userStore = useUserStore()
//   if (userStore.token) {
//     config.headers.Authorization = `Bearer ${userStore.token}`
//   }
//   return config
// })

// export default api


import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;


