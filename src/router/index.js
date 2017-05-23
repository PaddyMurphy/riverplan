import Vue from 'vue'
import Router from 'vue-router'
import Map from '@/components/Map'
import Rivertable from '@/components/Rivertable'

Vue.use(Router)

export default new Router({
  linkExactActiveClass: 'is-active',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Rivertable
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
      path: '/Map/',
      name: 'MapRiver',
      component: Map
    },
    {
      path: '/Map/:river',
      name: 'MapUrl',
      component: Map
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
