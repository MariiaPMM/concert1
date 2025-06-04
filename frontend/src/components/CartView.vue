<template>
  <div class="cart">
    <h2>Корзина квитків</h2>
    <ul v-if="cart.length">
      <li v-for="item in cart" :key="item.id">
        <strong>{{ item.concertName }}</strong> — Місце №{{ item.seatNumber }} — {{ item.price }}₴
      </li>
    </ul>
    <p v-else>Корзина порожня</p>
  </div>
</template>

<script>
export default {
  name: 'CartView',
  data() {
    return {
      cart: [],
    }
  },
  mounted() {
    const stored = localStorage.getItem('cart')
    this.cart = stored ? JSON.parse(stored) : []
  },
}
</script>

<style>
.cart {
  padding: 20px;
}
</style>
