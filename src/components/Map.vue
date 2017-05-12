<template>
  <div id="map">

  </div>
</template>

<script>
import loadGoogleMapsAPI from 'load-google-maps-api';

export default {
  name: 'map',
  data () {
    return {
      key: 'AIzaSyA1fV5RautETdjZsTMpClgqHKIgMa8WXPI',
      center: {lat: 31.96, lng: -99.90},
      kmlLayer: 'http://waterwatch.usgs.gov/?m=real&w=kml&regions=tx',
      zoom: 6 // TODO: lower for mobile
    }
  },
  mounted: function () {
    const vm = this;

    vm.$once(vm.loadGoogleMaps());
  },
  watch: {
    '$route' (to, from) {
      // Call resizePreserveCenter() on all maps
    }
  },
  methods: {
    loadGoogleMaps: function () {
      const vm = this;

      if (window.google) return

      loadGoogleMapsAPI({
        key: vm.key
      }).then(function (googleMaps) {
        vm.initMap(googleMaps);
      }).catch((err) => {
        console.error(err)
      })
    },
    initMap: function (googleMaps) {
      const vm = this;

      var map = new googleMaps.Map(vm.$el, {
        zoom: vm.zoom,
        center: vm.center
      });

      var cta = new googleMaps.KmlLayer({ // eslint-disable-line
        url: vm.kmlLayer,
        map: map
      });
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#map {
  width: 100vw;
  height: 80vh;
}
</style>
