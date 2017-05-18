import Vue from 'vue'
import Router from 'vue-router'
import Map from '@/components/Map'
import Riverflow from '@/layouts/Riverflow'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Map',
      component: Map
    },
    {
      path: '/:river',
      name: 'MapUrl',
      component: Map
    },
    {
      path: '/riverflow',
      name: 'Riverflow',
      component: Riverflow
    }
  ]
})
