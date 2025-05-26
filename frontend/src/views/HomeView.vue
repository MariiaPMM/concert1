<template>
  <div>
    <h2>Список квитків</h2>

    <ul v-if="tickets.length">
      <li v-for="ticket in tickets" :key="ticket.id">
        ID концерту: {{ ticket.concert_id }} <br />
        Секція: {{ ticket.section }}, Ряд: {{ ticket.row__number }}, Місце:
        {{ ticket.seat_number }} <br />

        <img
          :src="`http://localhost:3000/uploads/${ticket.image}`"
          alt="Зображення концерту"
          width="150"
        />

        {{ ticket.user }} → {{ ticket.concert }}
      </li>
    </ul>

    <p v-else-if="!error">Завантаження...</p>
    <p v-if="error">Помилка: {{ error }}</p>
  </div>
  <!-- <form @submit.prevent="registerUser">
    <input v-model="user.name" placeholder="Ім'я" required />
    <input v-model="user.email" placeholder="Email" required type="email" />
    <input v-model="user.phone" placeholder="Телефон" />
    <button type="submit">Зареєструватись</button>
    <p v-if="message">{{ message }}</p>
  </form> -->
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      tickets: [],
      error: null,
      // user: {
      //   name: '',
      //   email: '',
      //   phone: '',
      // },
      // message: '',
    }
  },

  mounted() {
    axios
      .get('http://localhost:3000/api/tickets')
      .then((response) => {
        console.log('Отримані дані:', response.data)
        this.tickets = response.data
      })
      .catch((error) => {
        console.error('Помилка при завантаженні квитків:', error)
        this.error = 'Не вдалося отримати квитки'
      })
  },

  //   methods: {
  //     async registerUser() {
  //       try {
  //         const response = await axios.post('http://localhost:3000/api/users', this.user)
  //         console.log('Користувач зареєстрований:', response.data)

  //         this.message = 'Реєстрація успішна!'
  //         this.user = { name: '', email: '', phone: '' }
  //       } catch (err) {
  //         this.message = 'Помилка реєстрації: ' + (err.response?.data?.error || err.message)
  //       }
  //     },
  //   },
}
</script>
