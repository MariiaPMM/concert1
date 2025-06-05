<template>
  <form @submit.prevent="register">
    <input v-model="name" type="text" placeholder="Імʼя" required />
    <input v-model="password" type="password" placeholder="Пароль" required />
    <button type="submit">Зареєструватися</button>
    <p v-if="message">{{ message }}</p>
  </form>
</template>

<script>
import axios from 'axios'

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
    register() {
      axios
        .post('http://localhost:3000/api/auth/register', {
          name: this.name,
          password: this.password,
        })
        .then((res) => {
          this.message = res.data.message
          this.$emit('close') // закриє модалку після успішної реєстрації
        })
        .catch((err) => {
          this.message = err.response?.data?.error || 'Сталася помилка'
        })
    },
  },
}
</script>
