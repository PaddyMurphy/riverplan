import Vue from 'vue'
import Router from 'vue-router'
import Map from '@/components/Map'
import Riverflow from '@/layouts/Riverflow'
import Rivertable from '@/components/Rivertable'

Vue.use(Router)

export default new Router({
  linkExactActiveClass: 'is-active',
  routes: [
    {
      path: '/',
      name: 'Map',
      component: Map
    },
    {
      path: '/river/',
      name: 'MapRiver',
      component: Map
    },
    {
      path: '/river/:river',
      name: 'MapUrl',
      component: Map
    },
    {
      path: '/riverflow',
      name: 'Riverflow',
      component: Riverflow
    },
    {
      path: '/riverflow/:river',
      name: 'RiverflowUrl',
      component: Riverflow
    },
    {
      path: '/rivertable',
      name: 'Rivertable',
      component: Rivertable
    },
    {
      path: '/rivertable/:river',
      name: 'RivertableUrl',
      component: Rivertable
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
