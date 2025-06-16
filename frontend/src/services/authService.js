// src/services/authService.js
import api from './api'

const authService = {
  async register(userData) {
    try {
      const res = await api.post('/auth/register', userData)
      localStorage.setItem('token', res.data.token) // Зберігаємо токен локально
      return res
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  },

  async login(email, password) {
    try {
      const res = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', res.data.token) // Зберігаємо токен локально
      return res
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  },

  getProfile() {
    return api.get('/auth/profile')
  },

  logout() {
    localStorage.removeItem('token')
  },
}

export default authService
