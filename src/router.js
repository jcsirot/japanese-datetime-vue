import Vue from 'vue'
import Router from 'vue-router'
import AppHome from '@/components/AppHome'
import AppListeningComprehension from '@/components/AppListeningComprehension'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'AppHome',
      component: AppHome
    },
    {
      path: '/listening-comprehension',
      name: 'AppListeningComprehension',
      component: AppListeningComprehension
    }
  ]
})
