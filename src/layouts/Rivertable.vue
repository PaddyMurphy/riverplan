<!--
Rivertable: display all desirable rivers and creeks
- esdocs - add comments
- Display: Name, cfs, date, whitewater class, location, color rows to indicate flow
- Color rows: use default conditions UNLESS OVERRIDEN
- Click row: expand below with river details
-->
<template>
  <section class="section rivertable">
    <div v-if="error" class="notification is-danger">
      <button class="delete" @click="error = undefined"></button>
      {{ error }}
    </div>
    <div class="columns is-flex tools">
      <div class="column column-search is-three-quarters">
        <div class="field level-item">
          <label class="label">Search</label>
          <p class="control">
            <input name="query" v-model="searchQuery" class="input" type="text" placeholder="Filter the table">
          </p>
        </div>
      </div>

      <div class="column column-button is-one-quarter">
        <button :class="{ 'is-loading' : loading }" class="button is-primary" @click="getUsgsData">refresh river data</button>
      </div>
    </div>

    <grid-table
      :data="riversFormatted"
      :columns="columns"
      :filter-key="searchQuery"
      :graphType="graphType">
    </grid-table>
  </section> <!-- END rivertable -->
</template>

<script>
import axios from 'axios'
import Conditions from '@/conditions.json'
import GridTable from '@/components/GridTable'
import Rivers from '@/rivers.json'

export default {
  name: 'rivertable',
  data () {
    return {
      baseMapUrl: '//maps.google.com/?q=',
      baseUsgsUrl: 'https://waterservices.usgs.gov/nwis/iv/',
      columns: ['name', 'cfs'],
      error: false,
      graphType: '00060', // defaults to cfs
      loading: false,
      rivers: Rivers.data,
      riversFormatted: [],
      searchQuery: ''
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
  components: {
    'grid-table': GridTable
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

      vm.riversFormatted = [];
      vm.loading = true;
      // fetch all site numbers in rivers.json
      axios.get(this.baseUsgsUrl, {
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
          vm.error = undefined;
        } else {
          vm.error = 'no river data available';
        }
        // TODO: set the url
      })
      .catch(error => {
        console.error(error);
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
      let oldestValue;
      let currentValue;
      let rising;
      let date;
      let geo;
      let site;

      response.forEach(function (d, i) {
        // NOTE: some rivers do not support cfs (00060)
        // the last item is the latest value
        oldestValue = d.values[0].value[0].value;
        // TODO: don't reverse... order makes a difference here
        currentValue = d.values[0].value.reverse()[0];

        date = new Date(currentValue.dateTime);
        geo = d.sourceInfo.geoLocation.geogLocation;
        site = d.sourceInfo.siteCode[0].value;
        // TODO: catch error for undefined params
        // test Guadalupe at Gonzales 08169845
        rising = (parseInt(currentValue.value, 10) > parseInt(oldestValue, 10));

        river = {
          'name': d.sourceInfo.siteName,
          'location': vm.baseMapUrl + geo.latitude + ',+' + geo.longitude,
          'site': site,
          'date': date.toDateString(),
          'time': date.toLocaleTimeString(),
          'cfs': currentValue.value,
          'oldCfs': oldestValue,
          'condition': vm.getConditions(currentValue.value).condition,
          'level': vm.getConditions(currentValue.value).level,
          'rising': rising
        }

        vm.riversFormatted.push(river);
      });
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

.column-search
  min-width: 200px
  .field
    justify-content: flex-start
  label
    margin: 0 0.5rem 0 0

.columns
  flex-wrap: wrap

.column-button
  justify-content: flex-end


</style>
