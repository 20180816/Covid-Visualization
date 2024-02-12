<template>
  <div class="LineChart" :id="id" ref="LineChart">
    <div id="linechart-title">Trends For Last Week</div>
    <div id="linechart-select">
      <el-select v-model="selected"  clearable filterable placeholder="Choose State">
           <el-option v-for="(item) in stateNameArr" :key="item" :value="item" @click.native="onSelect(item)">
           </el-option>
      </el-select>
    </div>
		<div id="linechart-graph"></div>
  </div>
  
</template>

<script>
import * as d3 from "d3";
let retData = [], rawData = []
let dateList = [
'2020-05-13',
'2020-05-14',
'2020-05-16',
'2020-05-17',
'2020-05-18',
'2020-05-19',
'2020-05-20',
]
export default {
  name: "LineChart",
  //props: ['selected'],
  model: {
        event: 'change'
  },
  data() {
    return {
      id: "LineChart",
      width: 740,
      height: 450,
      dataset: [1, 8, 5, 6, 8, 9, 3, 5, 2],
      stateNameArr:['abc','def'],
      selected:'',

    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      //prepare data

      rawData = this.getCovidData();
      console.log('linechart init rawData.length:', rawData.length,this.id);
      if(rawData.length === 0){
        return;
      }
      //get last week date
      //var tmpDateList = rawData.map((d) => { return d.date });
      //tmpDateList = Array.from(new Set(tmpDateList));
      //dateList = tmpDateList.slice(tmpDateList.length-8,tmpDateList.length-1);
      //assemble the rawData again
      rawData = rawData.filter((d) => {return dateList.includes(d.date)})

      this.getStateName(rawData);

      let category = "cases";
      let defaultState = this.stateNameArr[0];
      this.procData(defaultState,category);
      //console.log('linechart retData:',retData)
     
      this.dataset = retData.map((d) => { return d.value });

     
      this.draw();
    },
    procData(name,category) {
      //console.log('procData:',rawData,name)
      let tmp = rawData.filter((d) => {return d.name == name})
      .map(d => ({
        date: d.date,
        name: d.name,
        value: d[category]
      }));
      retData = tmp;//this.shuffle(tmp.sort((a, b) => a < b).slice(0, 15))// top 15
    },
    shuffle(arr) {
      let m = arr.length;
      while (m > 1) {
        let index = Math.floor(Math.random() * m--)
        let n = arr[m]
        arr[m] = arr[index]
        arr[index] = n
        //[arr[m] , arr[index]] = [arr[index] , arr[m]]
      }
      return arr;
    },
    onSelect(item) {
      console.log('select '+item)
      //swith to the target state by selection
      let category = "cases";
      this.procData(item,category);
      this.dataset = retData.map((d) => { return d.value });
      this.draw();
    },
    draw(){
      console.log('linechart draw');
      d3.select("#svg" + this.id).remove();
      let width = this.width ? this.width : 600;
      let height = this.height ? this.height : 600;
      let margin = { left: 60, top: 60, right: 20, bottom: 20 };
      let t_width = width - margin.left - margin.right,
       t_height = height - margin.top - margin.bottom;

      //draw svg
      let curSvg = d3.select("#linechart-graph")
        .append("svg")
        //width,height
        .attr("width", width)
        .attr("height", height)
        .attr("id", "svg" + this.id);
      //draw main content
      var g = curSvg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      console.log('linechart retData:',retData)
      //X轴和Y轴的度量

      var scaleX = d3
        .scaleBand()
        .domain(dateList)
        .range([0, t_width]);
      var scaleY = d3
        .scaleLinear()
        .domain([d3.min(this.dataset), d3.max(this.dataset)])
        .range([t_height, 0]);
      //X轴
      g.append("g")
        .call(d3.axisBottom(scaleX))
        .attr("transform", "translate(0," + t_height + ")");
      //x轴文字
      g.append("text")
        .text("Date")
        .attr("transform", "translate("+(t_width-10)+"," + (t_height-10) + ")")
        .attr("dx", "1em")
        .attr("text-anchor", "end");

      //Y轴
      g.append("g").call(d3.axisLeft(scaleY));

      //y轴文字
      g.append("text")
        .text("Cases")
        .attr("transform", "rotate(-90)")
        .attr("dy", "1em")
        .attr("text-anchor", "end");

      //function of drawing line
      var lineGenerator = d3
        .line()
        .x(function (d, i) {
          return scaleX(dateList[i])+45;
        })
        .y(function (d) {
          return scaleY(d);
        })
        .curve(d3.curveMonotoneX);

      //draw path
      let colorZ = d3.scaleOrdinal(d3.schemeDark2);
      g.append("path")
        .attr("d", lineGenerator(this.dataset)) //d="M1,0L20,40.....  d-path data
        .attr("fill", "none")
        .attr("stroke", (d, i) => colorZ(0))
        .attr("stroke-width", 2)
        .style("stroke-dasharray", function (d, i) {
          return d3
            .select(this)
            .node()
            .getTotalLength();
        })
        .style("stroke-dashoffset", function (d, i) {
          return d3
            .select(this)
            .node()
            .getTotalLength();
        })
        .transition()
        .duration(2000)
        .ease(d3.easePolyOut)
        .delay((d, i) => i * 200)
        .style("stroke-dashoffset", 0);
    },
    getStateName(arr){
      let nameMap = {}
      for(let i=0;i<arr.length;i++){
        nameMap[arr[i].name] = 1
      }
      this.stateNameArr = []
      for (let key in nameMap){
        this.stateNameArr.push(key);
      }
    }

  }
};
</script>

<style scoped>

</style>
