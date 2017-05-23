<!--
Rivertable: display all desirable rivers and creeks
- Display: Name, cfs, date, whitewater class, location, color rows to indicate flow
- Color rows: use default conditions unless overridden
- Click row: expand below with river details
- add fontawesome
-->

<template>
  <section class="section rivertable">
    <div class="container tools is-clearfix">
      <button :class="{ 'is-loading' : loading }" class="button is-primary is-pulled-right" @click="getUsgsData">refresh river data</button>
    </div>

    <table class="table" v-show="riversFormatted.length">
      <thead>
        <tr>
          <th>Site Name</th>
          <th>CFS</th>
          <th>Date</th>
          <th>Map</th>
        </tr>
      </thead>
      <tfoot>
        <tr>
          <th>Site Name</th>
          <th>CFS</th>
          <th>Date</th>
          <th>Map</th>
        </tr>
      </tfoot>
      <tbody>
        <tr v-for="river in riversFormatted" :class="river.level">
          <th>{{ river.name }}</th>
          <td>{{ river.cfs }}</td>
          <td>
            <span class="date">{{ river.date }}</span>
            <span class="time">{{ river.time }}</span>
          </td>
          <td>
            <a :href="river.location">Gauge</a>
          </td>
        </tr>
      </tbody>
    </table>
  </section> <!-- END rivertable -->
</template>

<script>
import axios from 'axios'
import Rivers from '@/rivers.json'
import Conditions from '@/conditions.json'

export default {
  name: 'rivertable',
  data () {
    return {
      baseMapUrl: '//maps.google.com/?q=',
      longitude: undefined,
      latitude: undefined,
      mapUrl: undefined,
      columns: ['name', 'cfs'],
      error: undefined,
      graphType: '00060', // defaults to cfs
      loading: false,
      loadingEl: document.querySelector('.loading'),
      rivers: Rivers.data,
      valueBaseUrl: 'https://waterservices.usgs.gov/nwis/iv/',
      reverse: false,
      riversFormatted: [],
      sortKey: 'name'
    }
  },
  computed: {
    sites: function () {
      let list = [];

      this.rivers.forEach(function (d) {
        // return only number values
        if (d.value.match(/\d+/g)) {
          list.push(d.value);
        }
      });

      return list.join();
    }
  },
  mounted: function () {
    // set selected river and fetch if routed from url
    if (this.$route.name === 'RivertableUrl') {}
    // load the river data
    this.getUsgsData();
  },
  methods: {
    /**
     * Fetches usgs instant data from rivers.json.
     * @return {number[]} response
     */
    getUsgsData: function () {
      var vm = this;

      this.loading = true;
      // fetch all site numbers in rivers.json
      axios.get(this.valueBaseUrl, {
        params: {
          parameterCd: this.graphType,
          sites: this.sites,
          format: 'json',
          period: 'P1D',
          siteStatus: 'active'
        }
      })
      .then(response => {
        vm.loading = false;

        if (response.data.value.timeSeries) {
          vm.displayUsgsData(response.data.value.timeSeries);
          vm.error = null;
        } else {
          vm.error = 'no river data available';
        }
        // TODO: set the url
      })
      .catch(error => {
        console.error(error.message);
        vm.loading = false;
        vm.error = error.message;
      });
    },
    /**
     * Formats usgs response for display from rivers.json.
     * @return {number[]} formatted response
     * @param {number[]} response - usgs fetch response.
     */
    displayUsgsData: function (response) {
      const vm = this;
      let river = {};
      let orderedValues;
      let date;
      let geo;

      response.forEach(function (d, i) {
        // the last item is the latest value
        orderedValues = d.values[0].value.reverse()[0];
        date = new Date(orderedValues.dateTime);
        geo = d.sourceInfo.geoLocation.geogLocation;

        river = {
          'name': d.sourceInfo.siteName,
          'location': vm.baseMapUrl + geo.latitude + ',+' + geo.longitude,
          'date': date.toDateString(),
          'time': date.toLocaleTimeString(),
          'cfs': orderedValues.value,
          'condition': vm.getConditions(orderedValues.value).condition,
          'level': vm.getConditions(orderedValues.value).level
        }

        vm.riversFormatted.push(river);
      });
    },
    sortBy: function (sortKey) {
      this.reverse = (this.sortKey === sortKey) ? !this.reverse : false;

      this.sortKey = sortKey;
    },
    toggleLoading: function () {
      var style = this.loading === true ? 'flex' : 'none';
      this.loadingEl.style.display = style;
    },
    /**
     * Returns condition description and level color code from conditions.json
     * @return {Object} condition and level
     * @param {number} cfs - from usgs fetch response.
     */
    getConditions: function (cfs) {
      let condition;
      let level;
      // convert to number
      cfs = parseInt(cfs, 10);
      // check the range of the cfs and display the appropriate message
      if (cfs === 0) {
        condition = Conditions.flow0;
        level = 'level-0'
      } else if ((cfs > 0) && (cfs < 50)) {
        condition = Conditions.flow1;
        level = 'level-1'
      } else if ((cfs >= 50) && (cfs < 100)) {
        condition = Conditions.flow2;
        level = 'level-2'
      } else if ((cfs >= 100) && (cfs < 300)) {
        condition = Conditions.flow3;
        level = 'level-3'
      } else if ((cfs >= 300) && (cfs < 600)) {
        condition = Conditions.flow4;
        level = 'level-4'
      } else if ((cfs >= 600) && (cfs < 2000)) {
        condition = Conditions.flow5;
        level = 'level-5'
      } else if (cfs >= 2000) {
        condition = Conditions.flow6;
        level = 'level-6'
      }

      return {'condition': condition, 'level': level};
    }
  }
}
</script>

<style scoped lang="sass">
// import initial variables
@import '../../node_modules/bulma/sass/utilities/initial-variables'
// import custom variables
@import '../assets/scss/bulma-styles.sass'

.tools
  margin-bottom: 1rem

// disable row hover
.table tr:hover
  background-color: none

// table row colors
.level-0
  background-color: lighten($red, 10%)

.level-1
  background-color: lighten($red, 20%)

.level-2
  background-color: lighten($red, 30%)

.level-3
  background-color: lighten($green, 40%)

.level-4
  background-color: lighten($green, 30%)

.level-5
  background-color: lighten($green, 20%)

.level-6
  background-color: lighten($green, 10%)

</style>
