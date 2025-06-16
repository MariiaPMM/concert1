<template>
  <form @submit.prevent="handleSubmit" class="auth-form">
    <h2>{{ isLoginMode ? 'Вхід' : 'Реєстрація' }}</h2>

    <input v-model="email" type="email" placeholder="Email" required />

    <input v-if="!isLoginMode" v-model="name" type="text" placeholder="Імʼя" required />
    <input v-if="!isLoginMode" v-model="phone" type="text" placeholder="Телефон" required />

    <input v-model="password" type="password" placeholder="Пароль" required />

    <button type="submit">{{ isLoginMode ? 'Увійти' : 'Зареєструватися' }}</button>

    <p v-if="message" class="error-message">{{ message }}</p>

    <p class="toggle-text">
      {{ isLoginMode ? 'Немає акаунта?' : 'Уже є акаунт?' }}
      <a href="#" @click.prevent="toggleMode">
        {{ isLoginMode ? 'Зареєструватися' : 'Увійти' }}
      </a>
    </p>
  </form>
</template>

<script>
import authService from '@/services/authService'
import { useUserStore } from '@/stores/user'

export default {
  emits: ['close'],
  data() {
    return {
      isLoginMode: true,
      name: '',
      email: '',
      phone: '',
      password: '',
      message: '',
    }
  },
  setup() {
    const userStore = useUserStore()
    return { userStore }
  },
  methods: {
    async handleSubmit() {
      try {
        let res
        if (this.isLoginMode) {
          res = await authService.login(this.email, this.password)
        } else {
          res = await authService.register({
            name: this.name,
            email: this.email,
            phone: this.phone,
            password: this.password,
          })
        }

        // Зберігаємо токен і профіль
        this.userStore.setToken(res.data.token)
        const profileRes = await authService.getProfile()
        this.userStore.setProfile(profileRes.data)

        this.$emit('close')
        this.$router.push('/cabinet')
      } catch (err) {
        this.message = err.response?.data?.error || 'Сталася помилка'
        console.error(err)
      }
    },
    toggleMode() {
      this.isLoginMode = !this.isLoginMode
      this.message = ''
    },
  },
}
</script>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  max-width: 320px;
  margin: auto;
  color: #fff;
}
.auth-form input {
  margin: 8px 0;
  padding: 8px;
  border-radius: 4px;
  border: none;
}
.auth-form button {
  margin-top: 12px;
  padding: 10px;
  background-color: #4caf50;
  border: none;
  color: white;
  font-weight: bold;
  cursor: pointer;
  border-radius: 4px;
}
.auth-form button:hover {
  background-color: #45a049;
}
.error-message {
  color: #ff6666;
  margin-top: 10px;
}
.toggle-text {
  margin-top: 12px;
  font-size: 14px;
}
.toggle-text a {
  color: #4caf50;
  cursor: pointer;
  text-decoration: underline;
}
</style>
