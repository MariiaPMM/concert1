<template>
  <div>
    <h2>Список квитків</h2>

    <ul v-if="tickets.length">
      <li v-for="ticket in tickets" :key="ticket.id">
        ID користувача: {{ ticket.user_id }} <br />
        ID концерту: {{ ticket.concert_id }} <br />
        Секція: {{ ticket.section }}, Ряд: {{ ticket.row__number }}, Місце:
        {{ ticket.seat_number }} <br />
        Статус: {{ ticket.status }} <br />
        <img
          :src="`http://localhost:3000/uploads/${ticket.image}`"
          alt="Зображення концерту"
          width="150"
        />
        {{ ticket.user }} {{ ticket.concert }}
      </li>
    </ul>

    <p v-else-if="!error">Завантаження...</p>
    <p v-if="error">Помилка: {{ error }}</p>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      tickets: [],
      error: null,
    }
  },
  mounted() {
    axios
      .get('http://localhost:3000/api/tickets')
      .then((response) => {
        console.log('Отримані дані:', response.data) // Виводимо дані у консоль
        this.tickets = response.data // Записуємо в список квитків
      })
      .catch((error) => {
        console.error('Помилка при завантаженні квитків:', error)
        this.error = 'Не вдалося отримати квитки'
      })
  },
}
</script>
