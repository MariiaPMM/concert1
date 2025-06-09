import axios from 'axios'

const API_URL = 'http://localhost:3000/api/auth'

const authService = {
  register(name, password) {
    return axios.post(`${API_URL}/register`, { name, password })
  },

  login(name, password) {
    return axios.post(`${API_URL}/login`, { name, password })
  },

  getProfile() {
    const token = localStorage.getItem('token')
    if (!token) return Promise.reject(new Error('Немає токена'))

    return axios.get(`${API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
}

export default authService
