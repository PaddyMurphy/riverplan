<template>
  <header class="hero is-bold is-primary">
    <div class="header is-flex" v-once>
      <h1 class="title">{{ title }}</h1>
      <p class="tagline">{{ tagline }}</p>
    </div>

    <div class="tabs is-boxed" v-once>
      <ul>
        <router-link tag="li" to="/">
          <a>Rivers</a>
        </router-link>
        <router-link tag="li" to="/map">
          <a>Map</a>
        </router-link>
      </ul>
    </div>
  </header>
</template>

<script>
export default {
  name: 'navbar',
  data () {
    return {
      title: 'Riverplan',
      tagline: 'Texas Edition',
      showLogin: false
    }
  },
  components: {},
  computed: {
    isDev: function () {
      if (typeof (process.env.NODE_ENV) === 'string') {
        return (process.env.NODE_ENV === 'development') ? 1 : 0;
      } else {
        return 0;
      }
    }
  }
}
</script>

<style scoped lang="sass">
@import '../assets/scss/bulma-styles.sass'

.header
  align-items: center
  justify-content: space-between

.title, .tagline
  margin: 1rem $default-padding

.tabs li:first-child
  padding-left: 2rem


</style>
