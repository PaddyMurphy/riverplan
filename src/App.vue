<template>
  <div id="app">
    <navbar />
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

<script>
import Navbar from '@/components/Navbar'
// import Bulma from 'bulma'

export default {
  name: 'app',
  data () {
    return {}
  },
  components: {
    'navbar': Navbar
  },
  mounted: function () {
  }
}
</script>

<style lang="sass">
html,
body
  height: 100%

// @import 'assets/scss/bulma-styles.scss'
#app
  font-family: 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale

</style>
