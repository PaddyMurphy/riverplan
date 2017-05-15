<!--
TODO:
- fetch usgs river basins
- overlay rivers shp file
- select river to focus on river and show details
- assign descriptions to rivers
- show recommended flow rates
- indicate whitewater or fishing/camping
- launch google earth web from point
-->
<template>
  <div class="map-view">
    <div class="map-container">
      <map-controls
        :showKmlLayer="showKmlLayer"
        v-on:toggleKml="toggleKml"
      />
      <div id="gmap"></div>
    </div><!-- END map-container -->
    <div class="info-container">
      info
    </div>
  </div>
</template>

<script>
import mapStyles from '@/components/mapStyles.json'
import MapControls from '@/components/MapControls';
import loadGoogleMapsAPI from 'load-google-maps-api';

export default {
  name: 'mapview',
  data () {
    return {
      key: 'AIzaSyA1fV5RautETdjZsTMpClgqHKIgMa8WXPI',
      center: {lat: 31.96, lng: -99.90}, // Texas
      mapStyles: mapStyles.styles,
      mapType: 'terrain',
      kmlLayer: 'http://waterwatch.usgs.gov/?m=real&w=kml&regions=tx',
      kmlData: undefined,
      showKmlLayer: true,
      zoom: 6, // TODO: lower for mobile
      showKml: true,
      selected: ''
    }
  },
  mounted: function () {
    const vm = this;

    vm.$once(vm.loadGoogleMaps());
  },
  components: {
    'map-controls': MapControls
  },
  watch: {
    '$route' (to, from) {
      // Call resizePreserveCenter() on all maps
    },
    showKmlLayer: function () {
      this.showKmlLayer ? this.displayKmlLayer() : this.hideKmlLayer();
    }
  },
  methods: {
    toggleKml: function () {
      // toggled from component
      this.showKmlLayer = !this.showKmlLayer;
    },
    displayKmlLayer: function () {
      var vm = this;
      // eslint-disable-next-line
      vm.kmlData = new window.google.maps.KmlLayer({
        url: vm.kmlLayer,
        map: window.gmap,
        suppressInfoWindows: false,
        preserveViewport: true
      });

      vm.kmlData.addListener('click', function (kmlEvent) {
        var text = kmlEvent.featureData;
        console.log(text);
      });
    },
    hideKmlLayer: function () {
      this.kmlData.setMap(null);
    },
    loadGoogleMaps: function () {
      const vm = this;

      if (window.google) return

      loadGoogleMapsAPI({
        key: vm.key
      }).then((googleMaps) => {
        vm.initMap();
      }).catch((err) => {
        console.error(err)
      })
    },
    initMap: function () {
      const vm = this;
      // save new gmap to window
      window.gmap = new window.google.maps.Map(vm.$el.querySelector('#gmap'), {
        zoom: vm.zoom,
        center: vm.center,
        styles: vm.mapStyles,
        mapTypeId: vm.mapType
      });

      // vm.setGoogleMapEvents();
      if (vm.showKmlLayer) {
        vm.displayKmlLayer();
      }
    },
    setGoogleMapEvents: function () {}
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.map-view {
  display: flex;
  flex-wrap: wrap;
}
.map-container {
  flex: 1 1 auto;
}
.info-container {
  flex: 0 1 20%;
}
#gmap {
  width: 100%;
  height: 80vh;
}
</style>
