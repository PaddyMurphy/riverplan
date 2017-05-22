<template>
  <section class="section riverflow">

    <div class="field select-river-wrapper">
      <p class="control">
        <span class="select is-fullwidth">
          <select class="select-river" v-model="selected" @change="changeRiver">
            <option
              v-for="option in options"
              :key="option.value"
              :value="option.value"
              :label="option.text"
              :disabled="option.value === '' ? true : false"
            >
            </option>
          </select>
        </span>
      </p>

      <div class="graph-options" v-if="showSearchOptions">
          <!-- TODO: enable after adding bulma -->
          <div class="graph-controls-menu">
              <input id="radio-dates-period" type="radio" label="period" v-model="radioDateType">Search by number of days</input>

              <input
                class="graph-period"
                type="number"
                :min="7"
                :max="90"
                v-model="period"
                v-show="radioDateType === 'period'"
              />

              <input id="radio-dates-date" type="radio" label="date" v-model="radioDateType">Search by a date range</input>
          </div>

          <label class="graph-control-label" v-show="radioDateType === 'date'">
            <span class="label-name">start date</span>
            <!-- TODO: implement disabledDate -->
            <!-- <el-date-picker
              class="graph-start"
              type="date"
              v-model="startDate"
              placeholder="Pick a start date"
            ></el-date-picker> -->
          </label>

          <label class="graph-control-label" v-show="radioDateType === 'date'">
            <span class="label-name">end date</span>
            <!-- <el-date-picker
              class="graph-end"
              type="date"
              v-model="endDate"
            ></el-date-picker> -->
          </label>
      </div>
    </div> <!-- END field.select-river-wrapper -->

    <div class="error" v-if="error">{{ error }}</div>

    <div class="columns condition-wrapper">
      <div class="column latest-cfs" v-if="latestCfs">

        <div class="rate-group">
          <span class="rate">{{ latestCfs }}</span>
          <abbr class="rate-abbr" title="cubic feet per second">CFS</abbr>
        </div>

        <a v-bind:href="mapUrl" v-if="mapUrl">Location of guage</a>
        <div class="time-group">
          <span v-if="latestDate">{{ latestDate }} at {{ latestTime }}</span>
        </div>
      </div>

      <conditions class="column" :latestCfs="latestCfs" />

      <intro class="column" :period="period" v-if="!latestCfs" />

      <history
        class="column"
        :latestCfs="latestCfs"
        :siteName="siteName"
        :latestTime="latestTime"
        :latestDate="latestDate"
      />
    </div>

    <graph
      :radioDateType="radioDateType"
      :selected="selected"
      :startDate="startDate"
      :endDate="endDate"
      :graphType="graphType"
      :period="period"
      v-show="selectedText"
    />

    <photos
      :siteName="selectedText"
      v-show="selectedText">
    </photos>

    <footer>
      created by <a href="//mountaindrawn.com">mountaindrawn.com</a>
      <input type="color" class="color-picker" @change="selectBackground" value="#E0E4CC">
      <small class="color-value">{{backgroundColor}}</small>
    </footer>

  </section> <!-- END riverflow -->
</template>

<script>
import axios from 'axios'
import rivers from '@/rivers.json'
import Intro from '@/components/Intro'
import Conditions from '@/components/Conditions'
import Photos from '@/components/Photos'
import Graph from '@/components/Graph'
import History from '@/components/History'

export default {
  name: 'riverflow',
  data () {
    return {
      backgroundColor: undefined,
      baseMapUrl: '//maps.google.com/?q=',
      endDate: new Date().toISOString().split('T')[0], // todays date YYYY-MM-DD
      error: undefined,
      graphType: '00060', // defaults to cfs
      latestCfs: undefined,
      latestDate: undefined,
      latestTime: undefined,
      latitude: undefined,
      loading: false,
      loadingEl: document.querySelector('.loading'),
      longitude: undefined,
      mapUrl: undefined,
      options: rivers.data,
      period: 7, // days
      radioDateType: 'period',
      selected: 'selectRiver',
      selectedText: 'Select a river',
      showSearchOptions: false,
      siteName: undefined,
      startDate: undefined,
      valueBaseUrl: 'https://waterservices.usgs.gov/nwis/iv/'
    }
  },
  computed: {
    selectedId: function () {
      return this.formatRiverName(this.selectedText);
    }
  },
  components: {
    'intro': Intro,
    'conditions': Conditions,
    'photos': Photos,
    'graph': Graph,
    'history': History
  },
  mounted: function () {
    // set selected river and fetch if routed from url
    if (this.$route.name === 'RiverflowUrl') {
      this.setSelectedRiver(this.$route.params.river);
    }
  },
  watch: {
    selected: 'getUsgsData',
    loading: 'toggleLoading'
  },
  methods: {
    setSelectedRiver: function (river) {
      var vm = this;
      // set the selected option
      this.options.forEach(function (option, i) {
        if (vm.formatRiverName(option.text) === river) {
          vm.selected = option.value;
          vm.selectedText = option.text;
        }
      });
    },
    changeRiver: function (e) {
      this.selected = this.options[e.target.selectedIndex].value;
      this.selectedText = this.options[e.target.selectedIndex].text;
    },
    toggleSearchOptions: function () {
      if (this.showSearchOptions) {
        this.showSearchOptions = false;
      } else {
        this.showSearchOptions = true;
      }
    },
    getUsgsData: function () {
      // // fetches usgs instant data, usgs graph service
      var vm = this;

      // do not submit if it's the select message
      if (this.selected === 'selectRiver' || !this.selected) {
        return;
      }

      this.loading = true;

      // fetch data
      axios.get(this.valueBaseUrl, {
        params: {
          parameterCd: this.graphType,
          sites: this.selected,
          format: 'json',
          period: 'P1D'
        }
      })
      .then(response => {
        vm.loading = false;

        if (response.data.value.timeSeries[0]) {
          vm.displayUsgsData(response.data.value.timeSeries[0]);
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
    displayUsgsData: function (response) {
      const vm = this;
      var values = response.values;
      // the last item in the first object is the last value
      var orderedValues = values[0].value.reverse()[0];
      var date = new Date(orderedValues.dateTime);

      // set values
      vm.latestCfs = orderedValues.value;
      vm.siteName = response.sourceInfo.siteName;
      vm.latitude = response.sourceInfo.geoLocation.geogLocation.latitude;
      vm.longitude = response.sourceInfo.geoLocation.geogLocation.longitude;

      // timestamp of data
      vm.latestDate = date.toDateString();
      vm.latestTime = date.toLocaleTimeString();

      // set selected
      vm.$router.push('/riverflow/' + vm.selectedId);

      // create map link
      vm.mapUrl = vm.baseMapUrl + vm.latitude + ',+' + vm.longitude;
    },
    formatRiverName: function (name) {
      // parse the option text (San Marcos River : Luling)
      // to this (sanmarcos:luling)
      var formatted = name;
      formatted = formatted.toLowerCase();
      formatted = formatted.replace(/ /g, ''); // replace spaces
      formatted = formatted.replace(/(\r\n|\n|\r)/gm, '');// remove line breaks
      formatted = formatted.replace(/-(\S*)-/g, ''); // exclude titles (i.e. --brazosriverbasin--)

      return formatted;
    },
    selectBackground: function (e) {
      this.backgroundColor = e.target.value;
      // set the backgound color
      document.body.style.backgroundColor = e.target.value;

      // http://stackoverflow.com/questions/12043187/how-to-check-if-hex-color-is-too-black
      var c = this.backgroundColor.substring(1); // strip #
      var rgb = parseInt(c, 16); // convert rrggbb to decimal
      var r = (rgb >> 16) & 0xff; // extract red
      var g = (rgb >> 8) & 0xff; // extract green
      var b = (rgb >> 0) & 0xff; // extract blue
      // adjust colors for perceived brightness
      var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
      // adjust font color to backgound
      if (luma < 128) {
        document.body.style.color = '#fff';
      } else {
        document.body.style.color = '#000';
      }
    },
    toggleLoading: function () {
      var style = this.loading === true ? 'flex' : 'none';
      this.loadingEl.style.display = style;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="sass">
// import custom variables
@import '../assets/scss/bulma-styles.sass'

.graph-options
  border: 0
  margin-top: 0

.graph-controls-menu
  display: flex
  flex-wrap: wrap

.graph-control-label
  display: block
  margin: 0 0 1em

.graph-period
  transform: translateY(-0.3em)

.graph-loading
  padding: 1em 0

#radio-dates-period,
#radio-dates-date
  cursor: pointer
  display: flex

  // keeps aligned to radio
  flex: 1 1 50%
  margin: 0 auto 0.5em

.label-name
  display: inline-block
  width: 8em

.condition-wrapper
  background: $conditions-color
  padding-top: $default-padding

.columns
  display: flex;
  flex-wrap: wrap

.column
  flex: 1 1 33.3%

.latest-cfs
  text-align: center

.rate-group
  align-items: baseline
  display: flex
  justify-content: center

.rate
  color: $orange
  font-weight: bold
  font-size: 4em

.rate-abbr
  color: $orange-light
  font-size: 2rem
  font-weight: bold
  text-decoration: none

.time-history
  font-size: 0.8em
  margin: 0
  padding: 0

  li
    list-style: none
    padding: 0 0 .25em

  // hide the first once since the data is already displayed
  li:first-child
    display: none !important

  .cfs
    font-size: 0.8rem

.history-title
  margin: 0 0 .25em

footer
  font-size: 0.8em
  padding: $default-padding 0
  text-align: center

.color-picker
  width: 20px
  height: 20px
  padding: 0
  border: 0
  border-radius: 50%
  opacity: 0.3
  transition: opacity 0.25s

  &:hover
    opacity: 1

.loading
  align-items: center
  background: rgba(255, 255, 255, 0.9)
  display: none
  font-size: 1.2em
  justify-content: center
  padding-bottom: $default-padding
  position: fixed
  width: 100%
  height: 100%
  z-index: 999

.error
  font-size: 1.2em
  text-align: center
  padding: $default-padding
  width: 100%

// transitions
.fade-enter-active, .fade-leave-active
  transition: all 0.35s

.fade-enter, .fade-leave-to
  opacity: 0

</style>
