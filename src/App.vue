<template>
  <v-app id="app">
    <v-parallax class="parallax-win" src="./back.jpg">
      <AppToolbar/>
      <router-view/>
    </v-parallax>
  </v-app>
</template>

<script>
import AppToolbar from './components/AppToolbar.vue'

export default {
  name: 'app',
  components: {
    AppToolbar
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.parallax-win {
    min-height: 100vh;
    background: transparent;
}
</style>
