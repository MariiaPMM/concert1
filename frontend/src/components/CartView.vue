<template>
  <BaseModal @close="$emit('close')">
    <section class="cart-modal">
      <h2>Корзина квитків</h2>
      <img v-if="qrCode" :src="qrCode" alt="QR-код квитка" />
      <p>Привіт, {{ username }}!</p>

      <p v-if="message" class="message">{{ message }}</p>

      <div v-if="cart.length" class="tickets">
        <div v-for="ticket in cart" :key="ticket.id" class="ticket-item">
          <p><strong>Назва:</strong> {{ ticket.concertName }}</p>
          <p><strong>Дата:</strong> {{ ticket.date }}</p>
          <p><strong>Ціна:</strong> {{ ticket.price }} ₴</p>
          <button @click="openPaymentModal(ticket)">Купити</button>
        </div>
      </div>

      <p v-else>Корзина порожня.</p>

      <PaymentModal
        v-if="showPaymentModal"
        :ticket="selectedTicket"
        @close="closePaymentModal"
        @paid="handlePaid"
      />
    </section>
  </BaseModal>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import api from '@/services/api'
import BaseModal from '@/components/BaseModal.vue'
import PaymentModal from '@/components/PaymentModal.vue'

export default {
  name: 'CartView',
  components: { BaseModal, PaymentModal },
  emits: ['close'],
  setup() {
    const userStore = useUserStore()
    const cart = ref([])
    const message = ref('')
    const qrCode = ref(null)

    const username = computed(() => userStore.profile?.name || 'Невідомий користувач')

    const showPaymentModal = ref(false)
    const selectedTicket = ref(null)

    const fetchCart = async () => {
      if (!userStore.token) {
        message.value = 'Будь ласка, увійдіть в акаунт, щоб бачити корзину.'
        return
      }
      try {
        // Якщо в api інстансі є інтерцептор, що додає токен — заголовки тут не потрібні
        const res = await api.get('/tickets/cart')
        cart.value = res.data
        message.value = ''
      } catch (err) {
        message.value = err.response?.data?.error || 'Помилка завантаження корзини'
        console.error(err)
      }
    }

    const openPaymentModal = (ticket) => {
      selectedTicket.value = ticket
      showPaymentModal.value = true
    }

    const closePaymentModal = () => {
      showPaymentModal.value = false
      selectedTicket.value = null
    }

    // const handlePaid = ({ ticket, qrCode: qr }) => {
    //   message.value = 'Квиток куплено!'
    //   cart.value = cart.value.filter((item) => item.id !== ticket.id)
    //   qrCode.value = qr || null
    //   closePaymentModal()
    // }

const handlePaid = ({ ticket, qrCode: qr }) => {
  message.value = 'Квиток куплено!'
  cart.value = cart.value.filter((item) => item.id !== ticket.id)
  qrCode.value = qr || null
  userStore.addPurchasedTicket({ ...ticket, qrCode: qr }) // 🆕 Додаємо до кабінету
  closePaymentModal()
}


    onMounted(fetchCart)

    return {
      cart,
      message,
      username,
      openPaymentModal,
      showPaymentModal,
      selectedTicket,
      closePaymentModal,
      handlePaid,
      qrCode,
    }
  },
}
</script>

<style scoped>
.cart-modal {
  max-width: 600px;
  padding: 1.5rem;
}
.message {
  margin: 1rem 0;
  color: red;
}
.ticket-item {
  border: 1px solid #ccc;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
}
button {
  cursor: pointer;
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
}
button:hover {
  background-color: #0056b3;
}
</style>
