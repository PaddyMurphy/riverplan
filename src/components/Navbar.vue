<template>
  <header>
    <div class="header" v-once>
      <h1 class="title">{{ title }}</h1>
      <p class="tagline">{{ tagline }}</p>
    </div>
    <nav class="nav" v-once>
      <router-link class="nav-item" to="/">
        Map
      </router-link>
      <router-link class="nav-item" to="/riverflow">
        Riverflow
      </router-link>
    </nav>
    <login v-if="showLogin" />
  </header>
</template>

<script>
import Login from '@/components/Login'
export default {
  name: 'navbar',
  data () {
    return {
      title: 'Riverplan',
      tagline: 'Texas Edition',
      showLogin: false
    }
  },
  components: {
    'login': Login
  },
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

<style scoped lang="scss">
@import '../assets/scss/variables.scss';

.header {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

:root .title, .tagline {
  margin: 1em $default-padding;
}

.title {
  font-size: 1.2em;
}

.tagline {
  font-size: 1em;
}

.nav {
  display: flex;
  padding: 0.5em $default-padding;

  a {
    margin: 0 0.5em 0 0;
  }
}
</style>
