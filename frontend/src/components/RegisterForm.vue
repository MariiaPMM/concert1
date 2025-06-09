<template>
  <form @submit.prevent="register">
    <input v-model="name" type="text" placeholder="Імʼя" required />
    <input v-model="password" type="password" placeholder="Пароль" required />
    <button type="submit">Зареєструватися</button>
    <p v-if="message">{{ message }}</p>
  </form>
</template>

<script>
import authService from '@/services/authService'
import { useUserStore } from '@/stores/user'

export default {
  emits: ['close'],
  data() {
    return {
      name: '',
      password: '',
      message: '',
    }
  },

  methods: {
    async register() {
      try {
        const res = await authService.register(this.name, this.password)
        const userStore = useUserStore()
        userStore.setToken(res.data.token)

        const profileRes = await authService.getProfile()
        if (userStore.setProfile) {
          userStore.setProfile(profileRes.data)
        } else {
          console.warn('userStore.setProfile відсутній')
        }

        this.$emit('close')
        if (this.$router) {
          this.$router.push('/cabinet')
        } else {
          console.warn('this.$router відсутній')
        }
      } catch (err) {
        this.message = err.response?.data?.error || 'Сталася помилка'
        console.error(err) // Додаємо лог помилки
      }
    },
  },
}
</script>
