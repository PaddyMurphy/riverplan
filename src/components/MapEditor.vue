<template>
  <div class="map-editor">

  </div>
</template>

<script>
import mapMedina from '@/map-medina.geojson';

export default {
  name: 'mapcontrols',
  data () {
    return {}
  },
  computed: {},
  mounted: function () {
    console.log(typeof (mapMedina));
  },
  methods: {}
}
</script>

<style scoped lang="scss">
@import '../assets/scss/variables.scss';

</style>
