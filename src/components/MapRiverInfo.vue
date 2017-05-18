<template>
  <div class="map-river-info" v-show="currentRiver">
    <h3>{{ name }}</h3>

    <div class="flow-rates" v-if="flowMin">
      <p>Minimum flow: {{ flowMin }}</p>
      <p>Maximum flow: {{ flowMax }}</p>
      <p>Optimum flow: {{ flowOptimum }}</p>
    </div>

    <p>{{ description }}</p>
  </div>
</template>

<script>
export default {
  name: 'mapriverinfo',
  data () {
    return {
      name: undefined,
      description: undefined,
      flowMin: undefined,
      flowMax: undefined,
      flowOptimum: undefined
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
