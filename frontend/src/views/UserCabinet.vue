<template>
  <div class="user-cabinet">
    <button class="close-btn" @click="goHome">❌</button>

    <h2>Кабінет користувача</h2>

    <div v-if="loading">
      <p>Завантаження профілю...</p>
    </div>

    <div v-else-if="user">
      <p><strong>Ім'я:</strong> {{ user.name }}</p>
      <p v-if="user.email"><strong>Email:</strong> {{ user.email }}</p>
      <button @click="logout">Вийти</button>
    </div>

    <div v-else>
      <p class="error">Ви не увійшли в систему.</p>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import authService from '@/services/authService'

export default {
  name: 'UserCabinet',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()

    const loading = computed(() => userStore.isLoadingProfile)
    const user = computed(() => userStore.profile)

    function goHome() {
      router.push('/') // Перехід на головну без логаута
    }

    function logout() {
      authService.logout()
      userStore.clearAll()
      router.push('/')
    }

    return { loading, user, goHome, logout }
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
  position: relative;
  min-height: 300px;
  background-color: #222;
  border-radius: 8px;
  max-width: 400px;
  margin: 20px auto;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  background: transparent;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
}

.close-btn:hover {
  color: #ff5555;
}

.error {
  color: #ff6666;
}
</style>
