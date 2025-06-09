<template>
  <form @submit.prevent="login">
    <input v-model="name" type="text" placeholder="Імʼя" required />
    <input v-model="password" type="password" placeholder="Пароль" required />
    <button type="submit">Увійти</button>
    <p v-if="message">{{ message }}</p>
  </form>
</template>

<script>
import authService from '@/services/authService'
import { useUserStore } from '@/stores/user'

export default {
  data() {
    return {
      name: '',
      password: '',
      message: '',
    }
  },
  methods: {
    async login() {
      try {
        const res = await authService.login(this.name, this.password)
        const userStore = useUserStore()
        userStore.setToken(res.data.token)

        // Отримуємо профіль користувача
        const profile = await authService.getProfile()
        userStore.setProfile(profile.data)

        // Переходимо в кабінет
        this.$router.push('/cabinet')
      } catch (err) {
        this.message = err.response?.data?.error || 'Помилка входу'
      }
    },
  },
}
</script>
