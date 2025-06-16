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
    getAuthHeader: (s) => ({
      Authorization: `Bearer ${s.token}`,
    }),
  },

  actions: {
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
    },
    setProfile(profile) {
      this.profile = profile
    },
    clearAll() {
      this.token = this.profile = null
      localStorage.removeItem('token')
    },
    async initFromLocalStorage() {
      const storedToken = localStorage.getItem('token')
      if (!storedToken) return

      this.token = storedToken
      try {
        this.isLoadingProfile = true
        const res = await authService.getProfile()
        this.profile = res.data
      } catch (e) {
        console.warn('Token недійсний — очищаю:', e)
        this.clearAll()
      } finally {
        this.isLoadingProfile = false
      }
    },
  },
})
