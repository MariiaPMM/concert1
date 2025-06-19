<template>
  <div class="user-cabinet">
    <h2>Кабінет користувача</h2>

    <div v-if="loading">
      <p>Завантаження профілю...</p>
    </div>

    <div v-else-if="user">
      <p><strong>Ім'я:</strong> {{ user.name }}</p>
      <p v-if="user.email"><strong>Email:</strong> {{ user.email }}</p>
      <button @click="logout">Вийти</button>

      <div class="purchased-tickets" v-if="purchasedTickets.length">
        <h3>Куплені квитки:</h3>
        <div class="ticket-cards">
          <div v-for="(ticket, index) in purchasedTickets" :key="index" class="ticket-card">
            <p><strong>Назва:</strong> {{ ticket.concertName }}</p>
            <p><strong>Дата:</strong> {{ ticket.date }}</p>
            <p><strong>Ціна:</strong> {{ ticket.price }} ₴</p>
            <!-- <p><strong>Локація:</strong> {{ ticket.concertLocation }}</p> -->
            <p><strong>Місце:</strong>{{ ticket.seatNumber }}</p>
            <img :src="ticket.qrCode" alt="QR-код" class="qr-code" />
          </div>
        </div>
      </div>
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
    const purchasedTickets = computed(() => userStore.purchasedTickets)

    function goHome() {
      router.push('/')
    }

    function logout() {
      authService.logout()
      userStore.clearAll()
      router.push('/')
    }

    return {
      loading,
      user,
      goHome,
      logout,
      purchasedTickets,
    }
  },
}
</script>

<style scoped>
.user-cabinet {
  max-height: 80vh;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  color: #000;
  padding: 20px;
  position: relative;
  min-height: 300px;
  background-color: #ffffff;
  border-radius: 8px;
  max-width: 600px;
  margin: 20px auto;
  padding: 40px 0 0 0;

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

.purchased-tickets {
  margin-top: 20px;
  width: 100%;
}

.ticket-card {
  min-width: 150px;
  background: #ffffff;
  border: 1px solid #000;
  color: #000;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: center;
  p {
    padding: 0;
    margin: 0;
  }
}

.qr-code {
  max-width: 100px;
  margin-top: 10px;
}
.ticket-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}
button {
  background: #ff5555;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  width: 100px;
  height: 30px;
}
</style>
