<template>
  <div class="map-river-info">
    <h3>{{ name }}</h3>

    <div class="flow-rates" v-if="flowMin">
      <p>Minimum flow: {{ flowMin }}</p>
      <p>Maximum flow: {{ flowMax }}</p>
      <p>Optimum flow: {{ flowOptimum }}</p>
    </div>

    <p v-if="length">Length: {{ length }}</p>

    <p>{{ description }}</p>
  </div>
</template>

<script>
export default {
  name: 'mapriverinfo',
  data () {
    return {
      name: 'About Riverplan',
      description: 'Planning tool for kayaking and canoeing trips. Use the map to check usgs guages and select rivers for more information. Coming features: plot and save routes, map new routes...',
      flowMin: undefined,
      flowMax: undefined,
      flowOptimum: undefined,
      length: undefined
    }
  },
  props: {
    currentRiver: {
      type: String,
      required: false
    },
    mapRivers: {
      type: Array,
      required: true
    }
  },
  watch: {
    currentRiver: 'getRiverInfo'
  },
  mounted: function () {},
  methods: {
    getRiverInfo: function (id) {
      var vm = this;

      vm.mapRivers.forEach(function (d, i) {
        if (d.id === id) {
          vm.name = d.name;
          vm.description = d.description;
          vm.flowMin = d.flowMin;
          vm.flowMax = d.flowMax;
          vm.flowOptimum = d.flowOptimum;
          vm.length = d.length;
        }
      });
    }
  }
}
</script>

<style scoped lang="scss">
@import '../assets/scss/variables.scss';

.map-river-info {
  padding: 0 2em 2em
}
</style>
