<template>
  <div class="Statistics" ref="chart">
    <div id="Choropleth" class="chartBlock" margin-top="">
      <Choropleth ref='Choropleth'></Choropleth>
    </div>
    <div id="DBarChart" class="chartBlock">
      <DBarChart ref='DBarChart'></DBarChart>
    </div>
    <div id="LineChart" class="chartBlock">
      <LineChart ref='LineChart'></LineChart>
    </div>
    <div id="RoseChart" class="chartBlock">
      <RoseChart ref='RoseChart'></RoseChart>
    </div>
  </div>
</template>

<script>

  import Choropleth from './Choropleth'
  import LineChart from './LineChart'
  import DBarChart from './3DBarChart'
  import RoseChart from './RoseChart'
export default {
  name: "test",
  data() {
    return {
      chartType: "3Dbar",
      rotate: true,
      data: [
        
      ],
    };
  },
  computed:{

  },
  mounted() {
    console.log('statistics mounted')
	},
  created(){
    console.log('statistics created')
    this.loadData(this.onCovidDataReady)
  },
  components: {
    Choropleth,
    LineChart,
    DBarChart,
    RoseChart,
  },
  methods: {
    onCovidDataReady: function () {
      console.log('onCovidDataReady!')
      this.$refs.Choropleth.init()
      this.$refs.DBarChart.init()
      this.$refs.LineChart.init()
      this.$refs.RoseChart.init()
    },
  }
}
</script>
<style scoped>
    .chartBlock{
		margin-bottom: 4.375rem;
		padding-top: 1.125rem;
	}
</style> 