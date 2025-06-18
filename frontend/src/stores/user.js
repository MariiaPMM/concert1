// stores/user.js
import { defineStore } from 'pinia'
import authService from '@/services/authService'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: null,
    profile: null,
    isLoadingProfile: false,
  }),

  getters: {
    isLogged: (s) => !!s.token && !!s.profile,
    getAuthHeader: (s) =>
      s.token && s.token !== 'null' ? { Authorization: `Bearer ${s.token}` } : {},
  },

  actions: {
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
      console.log('✅ Token збережено:', token)
      
    },

    setProfile(profile) {
      this.profile = profile
      console.log('✅ Профіль встановлено:', profile)
    },

    clearAll() {
      console.log('🚫 Очищення токена і профілю')
      this.token = null
      this.profile = null
      localStorage.removeItem('token')
    },

    async initFromLocalStorage() {
      const storedToken = localStorage.getItem('token')
      console.log('🔐 Token з localStorage:', storedToken)

      if (!storedToken || storedToken === 'null') {
        console.warn('❗ Токен відсутній або null — вихід із init')
        return
      }

      this.token = storedToken
      try {
        this.isLoadingProfile = true
        const res = await authService.getProfile()
        this.profile = res.data
        console.log('👤 Профіль завантажено:', this.profile)
      } catch (e) {
        console.warn('❌ Token недійсний або запит не вдався:', e)

        // 👉 Якщо потрібна діагностика — тимчасово коментуй очищення
        this.clearAll()
      } finally {
        this.isLoadingProfile = false
      }
    },
  },
})
