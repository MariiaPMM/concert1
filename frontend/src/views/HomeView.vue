<template>
  <header></header>
  <div class="container">
    <h2>Список концертів</h2>
    <ul v-if="tickets.length">
      <li v-for="ticket in tickets" :key="ticket.id" class="card">
        <img
          :src="`http://localhost:3000/uploads/${ticket.image}`"
          alt="Зображення концерту"
          width="150"
        />
        <div>{{ ticket.concert }}</div>
        <div>{{ ticket.location }}</div>
        <div>{{ ticket.price }}</div>
        <button @click="openModal(ticket)">Детальніше</button>
      </li>
    </ul>

    <p v-else-if="!error">Завантаження...</p>
    <p v-if="error">Помилка: {{ error }}</p>

    <BaseModal v-if="selectedTicket" @close="selectedTicket = null">
      <h3>{{ selectedTicket.concert }}</h3>
      <p><strong>Місце:</strong> {{ selectedTicket.location }}</p>
      <p><strong>Ціна:</strong> {{ selectedTicket.price }}</p>

      <!-- Схема залу -->

      <!-- <div v-if="!seats.length">Завантаження місць...</div>
      <div v-else class="hall">
        <div
          v-for="seat in seats"
          :key="seat.id"
          :class="['seat', { selected: selectedSeat?.id === seat.id, taken: seat.taken }]"
          @click="selectSeat(seat)"
        >
          {{ seat.number }}
        </div>
      </div> -->
      <div class="hall">
        <div
          v-for="seat in seats"
          :key="seat.id"
          :class="[
            'seat',
            {
              selected: selectedSeat?.id === seat.id,
              taken: seat.taken,
            },
          ]"
          @click="selectSeat(seat)"
        >
          {{ seat.number }}
        </div>
      </div>

      <p v-if="selectedSeat"><strong>Обране місце:</strong> №{{ selectedSeat.number }}</p>
      <button :disabled="!selectedSeat" @click="buyTicket">Купити квиток</button>
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
      tickets: [],
      error: null,
      selectedTicket: null,
      seats: [], // місця залу
      selectedSeat: null, // обране місце
    }
  },
  methods: {
    openModal(ticket) {
      this.selectedTicket = ticket
      this.selectedSeat = null

      axios
        .get(`http://localhost:3000/api/seats/${ticket.id}`)
        .then((response) => {
          console.log('Список місць:', response.data)
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
          concertId: this.selectedTicket.id,
          seatId: this.selectedSeat.id,
          userId: 1, // заміни на актуального користувача
          price: this.selectedTicket.price,
        })
        .then(() => {
          alert(`Квиток на місце №${this.selectedSeat.number} куплено`)
          this.selectedTicket = null
        })
        .catch((error) => {
          console.error('Не вдалося купити квиток:', error)
          alert('Сталася помилка при покупці квитка')
        })
    },
  },
  mounted() {
    axios
      .get('http://localhost:3000/api/tickets')
      .then((response) => {
        this.tickets = response.data
      })
      .catch((error) => {
        this.error = 'Не вдалося отримати квитки'
        console.error(error)
      })
  },
}
</script>

<style>
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
</style>
