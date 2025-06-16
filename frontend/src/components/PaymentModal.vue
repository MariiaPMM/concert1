<template>
  <BaseModal @close="$emit('close')">
    <section class="payment-modal">
      <h3>Оплата квитка</h3>
      <p><strong>Концерт:</strong> {{ ticket.concertName }}</p>
      <p><strong>Ціна:</strong> {{ ticket.price }} ₴</p>

      <form @submit.prevent="submitPayment">
        <label>
          Номер картки:
          <input
            v-model="cardNumber"
            type="text"
            maxlength="16"
            placeholder="1234 5678 9012 3456"
            required
          />
        </label>
        <label>
          Термін дії (MM/YY):
          <input v-model="expiry" type="text" maxlength="5" placeholder="12/25" required />
        </label>
        <label>
          CVC:
          <input v-model="cvc" type="text" maxlength="3" placeholder="123" required />
        </label>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Оплачуємо...' : 'Сплатити' }}
        </button>
      </form>

      <p v-if="error" class="error">{{ error }}</p>
    </section>
  </BaseModal>
</template>

<script>
import { ref } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import api from '@/services/api' // переконайся, що в api є інтерсептор для токена

export default {
  name: 'PaymentModal',
  components: { BaseModal },
  props: {
    ticket: Object,
  },
  emits: ['close', 'paid'],
  setup(props, { emit }) {
    const cardNumber = ref('')
    const expiry = ref('')
    const cvc = ref('')
    const loading = ref(false)
    const error = ref('')

    const submitPayment = async () => {
      error.value = ''
      loading.value = true

      // Проста валідація
      if (cardNumber.value.length !== 16 || !/^\d+$/.test(cardNumber.value)) {
        error.value = 'Некоректний номер картки'
        loading.value = false
        return
      }
      if (!expiry.value.match(/^\d{2}\/\d{2}$/)) {
        error.value = 'Некоректний термін дії'
        loading.value = false
        return
      }
      if (cvc.value.length !== 3 || !/^\d+$/.test(cvc.value)) {
        error.value = 'Некоректний CVC'
        loading.value = false
        return
      }

      try {
        console.log('💬 Покупка квитка ID =', `/tickets/buy/${props.ticket.id}`)

        await api.post(`/tickets/cart/buy/${props.ticket.id}`)

        emit('paid', props.ticket)
      } catch (e) {
        error.value = 'Помилка при оплаті квитка'
        console.error(e)
      } finally {
        loading.value = false
      }
    }

    return { cardNumber, expiry, cvc, loading, error, submitPayment }
  },
}
</script>

<style scoped>
.payment-modal {
  max-width: 400px;
  padding: 1.5rem;
}
label {
  display: block;
  margin-bottom: 0.75rem;
}
input {
  width: 100%;
  padding: 0.4rem;
  margin-top: 0.2rem;
  box-sizing: border-box;
}
button {
  padding: 0.6rem 1rem;
  background-color: #28a745;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:disabled {
  background-color: #6c757d;
  cursor: default;
}
.error {
  margin-top: 1rem;
  color: red;
}
</style>
