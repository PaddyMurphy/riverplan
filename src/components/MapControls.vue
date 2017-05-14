<template>
  <div class="map-controls">
    <button
      class="btn-kml"
      @click.prevent="toggleKml"
      >{{ buttonText }} Gauges</button>
    <button class="btn-satellite" @click="toggleSatellite">Satellite</button>
  </div>
</template>

<script>
export default {
  name: 'navbar',
  data () {
    return {}
  },
  props: {
    showKmlLayer: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    buttonText: function () {
      return this.showKmlLayer ? 'Hide' : 'Show'
    }
  },
  methods: {
    toggleKml: function () {
      this.$emit('toggleKml');
    },
    toggleSatellite: function () {
      this.$emit('toggleSatellite');
    }
  }
}
</script>

<style scoped lang="scss">
@import '../assets/scss/variables.scss';

</style>
