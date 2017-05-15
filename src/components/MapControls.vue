<template>
  <div class="map-controls">
    <button class="btn-kml" @click.prevent="toggleKml">{{ buttonText }} Gauges</button>

    <select v-model="selected" @change="selectBasin" v-if="riverBasins">
      <option value="">River basins</option>
      <option
        v-for="river in riverBasins"
        :value="river.name"
      >{{ river.name }}</option>
    </select>
  </div>
</template>

<script>
import riverBasins from '@/riverBasins.json';

export default {
  name: 'mapcontrols',
  data () {
    return {
      riverBasins: riverBasins.data,
      selected: ''
    }
  },
  props: {
    showKmlLayer: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    buttonText: function () {
      return this.showKmlLayer ? 'Hide' : 'Show'
    }
  },
  mounted: function () {},
  methods: {
    toggleKml: function () {
      this.$emit('toggleKml');
    },
    selectBasin: function (e) {
      let selected = e.target[e.target.selectedIndex].value;

      if (!selected) return;
      // TODO: zoom to basin
      //       show only markers in basin
      console.log(selected);
    }
  }
}
</script>

<style scoped lang="scss">
@import '../assets/scss/variables.scss';

</style>
