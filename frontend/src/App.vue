<template>
  <div id="app">
    <!-- <HomeView /> -->
     <RouterView/>
  </div>
</template>

<script>
import { RouterView } from 'vue-router';

export default {
  components: {
    RouterView,
  },
}
</script>
