import '@babel/polyfill'
import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import Vuetify from 'vuetify'
import router from './router'
import VueResource from 'vue-resource'
import VueAnalytics from 'vue-analytics'

Vue.use(Vuetify)
Vue.use(VueResource)
Vue.use(VueAnalytics, {
  id: 'UA-127507557-1'
})

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
