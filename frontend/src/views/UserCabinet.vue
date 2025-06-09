<template>
  <div class="user-cabinet">
    <h2>Кабінет користувача</h2>

    <div v-if="user">
      <!-- <img src="../assets/images/user.png" alt="" /> -->
      <p>{{ user.name }}</p>
      <br />
      <p v-if="user.email"><strong>Email:</strong> {{ user.email }}</p>
    </div>

    <div v-else-if="error">
      <p class="error">Помилка: {{ error }}</p>
    </div>

    <div v-else>
      <p>Завантаження профілю...</p>
    </div>
  </div>
</template>

<script>
import authService from '@/services/authService'

export default {
  name: 'UserCabinet',
  data() {
    return {
      user: null,
      error: null,
    }
  },
  mounted() {
    authService
      .getProfile()
      .then((response) => {
        this.user = response.data
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          this.error = 'Неавторизований доступ. Будь ласка, увійдіть у систему.'
        } else {
          this.error = 'Не вдалося завантажити профіль.'
        }
        console.error(error)
      })
  },
}
</script>

<style scoped>
.user-cabinet {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  color: white;
  padding: 20px;
}
.error {
  color: red;
}
</style>
