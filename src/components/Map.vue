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
      <div id="gmap"></div>
    </div><!-- END map-container -->
    <div class="info-container">
      <map-river-info
        :mapRivers="mapRivers"
        :currentRiver="currentRiver"
      />
    </div>
  </div>
</template>

<script>
import mapStyles from '@/components/mapStyles.json'
import mapRivers from '@/mapRivers.json'
import MapRiverInfo from '@/components/MapRiverInfo';
import loadGoogleMapsAPI from 'load-google-maps-api';

export default {
  name: 'mapview',
  data () {
    return {
      center: {lat: 31.96, lng: -99.90}, // Texas
      currentRiver: undefined,
      key: 'AIzaSyA1fV5RautETdjZsTMpClgqHKIgMa8WXPI',
      kmlData: undefined,
      kmlLayer: 'http://waterwatch.usgs.gov/?m=real&w=kml&regions=tx',
      mapRivers: mapRivers.data,
      mapStyles: mapStyles.styles,
      mapType: 'terrain',
      selected: '',
      showKmlLayer: true,
      zoom: 6 // TODO: lower for mobile
    }
  },
  computed: {},
  mounted: function () {
    const vm = this;

    // set selected river and fetch if routed from url
    if (this.$route.name === 'MapUrl') {
      this.setCurrentRiver(this.$route.params.river);
    }

    vm.$once(vm.loadGoogleMaps());
  },
  components: {
    'map-river-info': MapRiverInfo
  },
  watch: {
    '$route' (to, from) {
      // Call resizePreserveCenter() on all maps
    },
    currentRiver: 'navigateRiver',
    showKmlLayer: function () {
      this.showKmlLayer ? this.displayKmlLayer() : this.hideKmlLayer();
    }
  },
  methods: {
    setCurrentRiver: function (river) {
      this.currentRiver = river;
    },
    navigateRiver: function () {
      this.$router.push('/river/' + this.currentRiver);
    },
    toggleKml: function () {
      // toggled from component
      this.showKmlLayer = !this.showKmlLayer;
    },
    displayKmlLayer: function () {
      const vm = this;
      // eslint-disable-next-line
      vm.kmlData = new window.google.maps.KmlLayer({
        url: vm.kmlLayer,
        map: window.gmap,
        suppressInfoWindows: false,
        preserveViewport: true
      });

      // vm.kmlData.addListener('click', function (kmlEvent) {
      //   const text = kmlEvent.featureData;
      //   console.log(text);
      // });
    },
    displayGeoJson: function () {
      const vm = this;

      vm.mapRivers.forEach(function (d, i) {
        if (d.url) {
          window.gmap.data.loadGeoJson(d.url);
        }
      });

      window.gmap.data.setStyle({
        strokeColor: 'blue',
        strokeWeight: 1.5,
        strokeOpacity: 0.8,
        zIndex: 0
      });

      window.gmap.data.addListener('mouseover', function (e) {
        const id = e.feature.getProperty('id');
        // enlarge line
        window.gmap.data.revertStyle();
        window.gmap.data.overrideStyle(e.feature, {strokeWeight: 5});
        // set currentRiver
        vm.setCurrentRiver(id);
      });

      // reset stroke on mouseout
      window.gmap.data.addListener('mouseout', function (e) {
        // window.gmap.data.revertStyle();
      });
      // zoom in when clicked
      window.gmap.data.addListener('click', function (e) {
        // TODO: set bounds if routed here
        const id = e.feature.getProperty('id');
        let bounds = new window.google.maps.LatLngBounds();

        vm.processPoints(e.feature.getGeometry(), bounds.extend, bounds);
        window.gmap.fitBounds(bounds);

        vm.setCurrentRiver(id);
      })
    },
    processPoints: function (geometry, callback, thisArg) {
      const vm = this;

      if (geometry instanceof window.google.maps.LatLng) {
        callback.call(thisArg, geometry);
      } else if (geometry instanceof window.google.maps.Data.Point) {
        callback.call(thisArg, geometry.get());
      } else {
        geometry.getArray().forEach(function (g) {
          vm.processPoints(g, callback, thisArg);
        });
      }
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
        mapTypeId: vm.mapType,
        fullscreenControl: true
      });

      vm.displayGeoJson();

      // vm.setGoogleMapEvents();
      if (vm.showKmlLayer) {
        vm.displayKmlLayer();
        vm.createKmlButton();
      }
    },
    createKmlButton: function () {
      var vm = this;
      var customControlDiv = document.createElement('div');
      // eslint-disable-next-line
      var customControl = new CustomControl(customControlDiv, window.gmap);

      customControlDiv.index = 1;
      window.gmap.controls[window.google.maps.ControlPosition.TOP_RIGHT].push(customControlDiv);

      function CustomControl (controlDiv, map) {
        // Set CSS for the control border
        var controlUI = document.createElement('div');
        controlUI.id = 'btn-toggle-stations'
        controlUI.title = 'Click to toggle the guages';
        controlDiv.appendChild(controlUI);

        // Set CSS for the control interior
        var controlText = document.createElement('div');
        controlText.id = 'text-toggle-stations'
        controlText.innerHTML = 'Toggle Gauges';
        controlUI.appendChild(controlText);

        // Setup the click event listeners
        window.google.maps.event.addDomListener(controlUI, 'click', function () {
          vm.toggleKml();
        });
      }
    },
    setGoogleMapEvents: function () {}
  }
}
</script>

<style>
/* unscoped map components */
#btn-toggle-stations {
  background-color: #fff;
  border: 1px solid #ccc;
  height: 29px;
  margin: 10px 10px 0 0;
  padding: 8px 6px 6px;
  cursor: pointer;
  text-align: center;
}

#btn-toggle-stations:hover {
  background-color: rgb(235, 235, 235);
}

#text-toggle-gauges {
  font-family: 'Arial, sans-serif';
  font-size: 11px;
  font-color: #565656;
}
</style>

<style scoped>
/* scoped components */
.map-view {
  display: flex;
  flex-wrap: wrap;
}
.map-container {
  flex: 1 1 auto;
}
.info-container {
  flex: 0 1 300px;
}
#gmap {
  width: 100%;
  height: 80vh;
}
</style>
