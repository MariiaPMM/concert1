<template>
  <header>
    <div class="concert__header">
      <p class="logo">Concerts</p>
      <button @click="showCart = true" class="button__basket"><img src="../assets/images/basket.png" alt=""></button>
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
        <div>{{ concert.price }}</div>
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

    <!-- Модальне вікно корзини -->
    <BaseModal v-if="showCart" @close="showCart = false">
      <h3>Корзина</h3>
      <ul v-if="cart.length">
        <li v-for="(item, index) in cart" :key="index">
          {{ item.concertName }} — Місце №{{ item.seatNumber }} — {{ item.price }}₴
        </li>
      </ul>
      <p v-else>Корзина порожня</p>
    </BaseModal>
  </div>
</template>

<script>
import axios from 'axios'
import BaseModal from '../components/BaseModal.vue'

export default {
  components: {
    BaseModal,
  },
  data() {
    return {
      concerts: [],
      error: null,
      selectedConcert: null,
      seats: [],
      selectedSeat: null,
      showCart: false,
      cart: [],
    }
  },
  methods: {
    openModal(concert) {
      this.selectedConcert = concert
      this.selectedSeat = null

      axios
        .get(`http://localhost:3000/api/seats/${concert.id}`)
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

      axios
        .post('http://localhost:3000/api/seats/buy', {
          concertId: this.selectedConcert.id,
          seatId: this.selectedSeat.id,
          userId: 1,
          price: 200,
        })
        .then(() => {
          const newTicket = {
            concertName: this.selectedConcert.name,
            seatNumber: this.selectedSeat.number,
            price: 200,
          }

          let stored = localStorage.getItem('cart')
          let cart = stored ? JSON.parse(stored) : []
          cart.push(newTicket)
          localStorage.setItem('cart', JSON.stringify(cart))
          this.loadCart()

          alert(`Квиток на місце №${this.selectedSeat.number} куплено`)
          this.selectedConcert = null
        })
        .catch((error) => {
          console.error('Не вдалося купити квиток:', error)
          alert('Сталася помилка при покупці квитка')
        })
    },
    loadCart() {
      const stored = localStorage.getItem('cart')
      this.cart = stored ? JSON.parse(stored) : []
    },
  },
  mounted() {
    axios
      .get('http://localhost:3000/api/concerts')
      .then((response) => {
        this.concerts = response.data
      })
      .catch((error) => {
        this.error = 'Не вдалося отримати концерти'
        console.error(error)
      })

    this.loadCart()
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
.button__basket {
  all: unset;
  cursor: pointer;
}
</style>
