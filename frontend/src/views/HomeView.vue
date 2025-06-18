<template>
  <header>
    <div class="concert__header">
      <p class="logo">Concerts</p>
      <div class="header__nav">
        <button @click="handleUserClick" class="register__link">
          <img class="user__link" src="../assets/images/user.png" alt="User Icon" />
        </button>
        <button @click="showCart = true" class="button__basket">
          <img src="../assets/images/basket.png" alt="Basket Icon" />
        </button>
      </div>
    </div>
  </header>

  <div class="container">
    <ul v-if="concerts.length" class="concert__container">
      <li v-for="concert in concerts" :key="concert.id" class="card">
        <img
          :src="`http://localhost:3000/uploads/${concert.image_path}`"
          alt="Зображення концерту"
          width="150"
        />
        <div>{{ concert.name }}</div>
        <div>{{ concert.location }}</div>
        <div>{{ concert.date }}</div>
        <div>{{ concert.price }} ₴</div>
        <button @click="openModal(concert)">Детальніше</button>
      </li>
    </ul>

    <p v-else-if="!error">Завантаження...</p>
    <p v-if="error">Помилка: {{ error }}</p>

    <!-- Модальне вікно з вибором місць -->
    <BaseModal v-if="selectedConcert" @close="selectedConcert = null">
      <h3>{{ selectedConcert.name }}</h3>
      <p><strong>Локація:</strong> {{ selectedConcert.location }}</p>
      <p><strong>Дата:</strong> {{ selectedConcert.date }}</p>

      <div class="hall">
        <div
          v-for="seat in seats"
          :key="seat.id"
          :class="['seat', { selected: selectedSeat?.id === seat.id, taken: seat.taken }]"
          @click="selectSeat(seat)"
        >
          {{ seat.number }}
        </div>
      </div>

      <p v-if="selectedSeat"><strong>Обране місце:</strong> №{{ selectedSeat.number }}</p>
      <button :disabled="!selectedSeat" @click="buyTicket">Купити квиток</button>
    </BaseModal>

    <!-- Модальне вікно авторизації/кабінету -->
    <BaseModal v-if="showRegister" @close="showRegister = false">
      <component :is="userStore.token ? 'UserCabinet' : 'AuthModal'" />
    </BaseModal>

    <!-- Модальне вікно корзини -->
    <CartView v-if="showCart" @close="showCart = false" />
  </div>
</template>

<script>
import axios from 'axios'
import BaseModal from '../components/BaseModal.vue'
import AuthModal from '../components/AuthModal.vue'
import UserCabinet from '../views/UserCabinet.vue'
import CartView from '../components/CartView.vue'
import { useUserStore } from '@/stores/user'

export default {
  components: {
    BaseModal,
    AuthModal,
    UserCabinet,
    CartView,
  },
  data() {
    return {
      concerts: [],
      error: null,
      selectedConcert: null,
      seats: [],
      selectedSeat: null,
      showRegister: false,
      showCart: false,
      userStore: useUserStore(),
    }
  },
  methods: {
    getAuthHeaders() {
      const token = this.userStore.token
      return token && token !== 'null' ? { Authorization: `Bearer ${token}` } : {}
    },

    handleUserClick() {
      this.showRegister = true
    },
    openModal(concert) {
      this.selectedConcert = concert
      this.selectedSeat = null
      axios
        .get(`http://localhost:3000/api/seats/${concert.id}`, {
          headers: this.getAuthHeaders(),
        })
        .then((response) => {
          this.seats = response.data.map((seat) => ({
            id: seat.id,
            number: seat.seat_number,
            taken: seat.taken === 1,
          }))
        })
        .catch((error) => {
          console.error('Помилка при отриманні місць:', error)
          this.seats = []
        })
    },
    selectSeat(seat) {
      if (!seat.taken) {
        this.selectedSeat = seat
      }
    },
    buyTicket() {
      if (!this.selectedSeat) return

      if (!this.userStore.token || this.userStore.token === 'null') {
        alert('Ви маєте увійти, щоб купити квиток')
        this.showRegister = true
        return
      }
      axios
        .post(
          'http://localhost:3000/api/seats/buy',
          {
            concertId: this.selectedConcert.id,
            seatId: this.selectedSeat.id,
            price: this.selectedConcert.price,
          },
          {
            headers: this.getAuthHeaders(),
          },
        )
        .then(() => {
          alert(`Квиток на місце №${this.selectedSeat.number} куплено`)
          this.selectedConcert = null
          this.selectedSeat = null
          this.seats = this.seats.map(s =>
            s.id === this.selectedSeat?.id ? { ...s, taken: true } : s
          )
        })
        .catch((error) => {
          console.error('Не вдалося купити квиток:', error)
          alert('Сталася помилка при покупці квитка')
        })
    },
  },
  async mounted() {
    await this.userStore.initFromLocalStorage()
    console.log('Токен з userStore:', this.userStore.token)  // Ось тут додано лог токена

    try {
      const response = await axios.get('http://localhost:3000/api/concerts')
      this.concerts = response.data
    } catch (error) {
      this.error = 'Не вдалося отримати концерти'
      console.error(error)
    }
  },
}
</script>

<style>
header {
  height: 50px;
  font-size: 20px;
  margin: 0;
  padding: 0;
  width: 100%;
}
.concert__header {
  display: flex;
  justify-content: space-between;
  margin: 0 50px;
  color: #fff;
}
.concert__container {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  justify-content: space-between;
  list-style: none;
}
.concert__container li {
  width: 300px;
  height: 350px;
  background-color: #ffffff;
  color: #000;
  margin: 0 0 40px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  border-radius: 15px;
}
.hall {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 8px;
  margin: 20px 0;
}
.seat {
  width: 40px;
  height: 40px;
  background-color: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 6px;
  border: 1px solid #ccc;
  color: #000;
}
.seat.selected {
  background-color: #4caf50;
  color: white;
}
.seat.taken {
  background-color: #f44336;
  color: white;
  cursor: not-allowed;
}
.button__basket,
.register__link {
  all: unset;
  cursor: pointer;
}
</style>
