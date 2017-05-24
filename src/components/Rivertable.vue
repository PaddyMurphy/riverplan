<!--
Rivertable: display all desirable rivers and creeks
- esdocs - add comments
- Display: Name, cfs, date, whitewater class, location, color rows to indicate flow
- Color rows: use default conditions UNLESS OVERRIDEN
- Click row: expand below with river details
-->

<template>
  <section class="section rivertable">
    <div class="container tools is-clearfix">
      <div v-if="error" class="notification is-danger is-pulled-left">
        <button class="delete" @click="error = undefined"></button>
        {{ error }}
      </div>
      <button :class="{ 'is-loading' : loading }" class="button is-primary is-pulled-right" @click="getUsgsData">refresh river data</button>
    </div>

    <table class="table" v-show="riversFormatted.length">
      <thead>
        <tr>
          <th>River Name</th>
          <th><abbr title="cubic feet per second">CFS</abbr></th>
          <th>Date</th>
          <th>Map</th>
        </tr>
      </thead>
      <tfoot>
        <tr>
          <th>River Name</th>
          <th><abbr title="cubic feet per second">CFS</abbr></th>
          <th>Date</th>
          <th>Map</th>
        </tr>
      </tfoot>
      <tbody v-for="(river, index) in riversFormatted">
        <tr :class="river.level"
          :data-selected="river.site"
          @click="selectRiver"
        >
          <th>{{ river.name }}</th>
          <td>
            {{ river.cfs }}
            <span :class="river.rising ? 'arrow-up' : 'arrow-down'"></span>
          </td>
          <td>
            <span class="date">{{ river.date }}</span>
            <span class="time">{{ river.time }}</span>
          </td>
          <td>
            <a :href="river.location">Gauge</a>
          </td>
        </tr>
        <tr class="row-details">
          <td colspan="4">
            <div class="row-details-wrapper columns">
              <div class="column column-condition is-one-quarter">
                <p>{{ river.condition }}</p>

                <!-- <photos
                  :siteName="selectedText"
                  v-show="selectedText">
                </photos> -->
              </div>
              <div class="column column-graph is-three-quarters">
                <graph
                  :selected="selected"
                  :startDate="startDate"
                  :endDate="endDate"
                  :graphType="graphType"
                  v-show="selected"
                />
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </section> <!-- END rivertable -->
</template>

<script>
import axios from 'axios'
import Graph from '@/components/Graph'
// import Photos from '@/components/Photos'
import Rivers from '@/rivers.json'
import Conditions from '@/conditions.json'

export default {
  name: 'rivertable',
  data () {
    return {
      baseMapUrl: '//maps.google.com/?q=',
      columns: ['name', 'cfs'],
      endDate: new Date().toISOString().split('T')[0],
      error: false,
      graphType: '00060', // defaults to cfs
      loading: false,
      reverse: false,
      rivers: Rivers.data,
      riversFormatted: [],
      selected: undefined,
      sortKey: 'name',
      startDate: undefined,
      usgsBaseUrl: 'https://waterservices.usgs.gov/nwis/iv/'
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
    'graph': Graph
    // 'photos': Photos
  },
  mounted: function () {
    // set selected river and fetch if routed from url
    if (this.$route.name === 'RivertableUrl') {}
    // load the river data
    this.getUsgsData();
  },
  methods: {
    selectRiver: function (e) {
      const target = e.currentTarget;

      // deselect if clicking the active row
      if (target.classList.contains('is-selected')) {
        this.resetTable();
        this.selected = undefined;
      } else {
        this.resetTable();
        // set selected
        target.classList.add('is-selected');
        this.selected = target.dataset.selected;
        // expand next row
        target.nextElementSibling.classList.add('show-row');
      }
    },
    resetTable: function () {
      const selected = this.$el.querySelector('tr.is-selected');
      const rowDetailsShown = this.$el.querySelector('.show-row');
      // remove existing selected
      if (selected) {
        selected.classList.remove('is-selected');
        rowDetailsShown.classList.remove('show-row');
      }
    },
    /**
     * Fetches usgs instant data from rivers.json.
     * @return {number[]} response
     */
    getUsgsData: function () {
      var vm = this;

      vm.loading = true;
      // fetch all site numbers in rivers.json
      axios.get(this.usgsBaseUrl, {
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
        // console.log(d.sourceInfo);
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
    sortBy: function (sortKey) {
      this.reverse = (this.sortKey === sortKey) ? !this.reverse : false;

      this.sortKey = sortKey;
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

.table tr:not(.row-details)
  transition: background-color 0.25s ease-out
  &:hover
    cursor: pointer

.date,
.time
  font-size: 0.8rem

// table
.row-details
  display: none

// TODO: animating to max-height doesn't expand beyond
.row-details-wrapper
  // max-height: 0
  // animation: grow 0.5s ease-out forwards

.row-details-wrapper.show-row
  // max-height: 70vh

@keyframes grow
  0%
    max-height: 0

  100%
    max-height: 70vh

.show-row
  display: table-row

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

// arrows
.arrow-up
  width: 0
  height: 0
  display: inline-block;
  border-left: 6px solid transparent
  border-right: 6px solid transparent
  border-bottom: 10px solid $green

.arrow-down
  width: 0
  height: 0
  display: inline-block;
  border-left: 6px solid transparent
  border-right: 6px solid transparent
  border-top: 10px solid $red

</style>
