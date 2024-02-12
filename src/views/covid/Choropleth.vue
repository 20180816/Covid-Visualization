<template>
	<div class='choropleth' ref="covid">
		<div id="choropleth-title" class="title-content">Hot Spots</div>
		<div id="choropleth-graph"></div>
		<div id="tooltip"></div>

	</div>
</template>

<script>
import * as d3 from 'd3';
import * as topojson from 'topojson'
var svg, g
var projection
var zoom
var path
var width = 1200,
	height = 600
var myToolTip
var rawData = [],
	data = []
var deathScale = [1, 20, 35, 50, 75, 90]
var casesScale = [1, 60, 120, 200, 300, 450]
var curScale
var dataMap = new Map()
var color
var lastWeekDays = [
	'2022-11-14',
	'2022-11-15',
	'2022-11-16',
	'2022-11-17',
	'2022-11-18',
	'2022-11-19',
	'2022-11-20',
]
var idx = 0
var day = ''
function procData(date, category) {
	//console.log("start procData",category)
	if (category == 'deaths') {
		curScale = deathScale
	} else if (category == 'cases') {
		curScale = casesScale
	}
	//console.log("rawData=",rawData)
	data = rawData.filter((d) => { return d.date == date })
	// .map(d => ({
	// 	name: d.name,
	// 	value: d[category]
	// }));
	for (let i = 0; i < data.length; i++) {
		dataMap.set(data[i].name, data[i][category])
	}
	//console.log(dataMap)
	console.log("end procData,dataMap", dataMap)
}

var mouseMove = function (e) {
	myToolTip
		.style('left', (e.pageX + 15) + 'px')
		.style('top', (e.pageY - 35) + 'px')
}

function zoomed(event) {
	const { transform } = event;
	g.attr("transform", transform);
	g.attr("stroke-width", 1 / transform.k);
}

export default {
	name: 'Choropleth',
	data() {
		return {
			id: "Choropleth",
			width: 1000,
			height: 600,
			data: [],

		}
	},
	created() {

	},
	mounted() {
		console.log('mounted')
		//append svg for the tag of "choropleth-graph"
		svg = d3.select('#choropleth-graph')
			.append("svg")
			.attr("width", width)
			.attr("height", height)
			.on('mousemove', mouseMove)
		myToolTip = d3.select('#tooltip')
			.style('display', 'none');
		//prepare path
		path = d3.geoPath();

		this.init()
	},
	methods: {
		init: function () {
			rawData = this.getCovidData()
			var dateList = rawData.map((d) => { return d.date });
			dateList = Array.from(new Set(dateList));
			dateList = dateList.slice(0, 360);
			console.log('init Choropleth:' + rawData.length)
			rawData = rawData.filter((d) => { return dateList.includes(d.date) })

			if (rawData.length > 0) {
				const category = "cases"
				const day = '2021-11-14'
				procData(day, category);
				this.draw()
			}

		},
		beforeDestroy() {

		},
		drawOneDay() {
			if (idx >= lastWeekDays.length) {
				idx = 0
			}
			let category = "cases"
			day = lastWeekDays[idx]
			procData(day, category);
			this.draw()
			idx++
		},

		draw() {

			// remove old
			d3.select("#choropleth-graph").selectAll("g").remove()

			let mouseHover = function (e) {
				//console.log(e.toElement);
				d3.selectAll(".Country")
					.transition()
					.duration(200)
					.style("opacity", .5)
				d3.select(e.toElement)
					.transition()
					.duration(200)
					.style("opacity", 1)
					.style("stroke", "black")
				myToolTip.style('display', 'block');
				let cid = e.toElement.id
				//console.log(cid);
				data = rawData.filter(item => item.date === rawData[rawData.length - 1].date)
				let country = data.find(function (item) {
					return item.id == cid
				})
				if (typeof (country) == 'undefined') {
					country = {
						name: cid,
						cases: 0,
						deaths: 0
					}
				}
				let text = country.name + '\n\ncases: ' + Math.round(country.cases/1000) + 'k\ndeaths: ' + country.deaths
				myToolTip.text(text)
			}

			let mouseOut = function (e) {
				d3.selectAll(".Country")
					.transition()
					.duration(200)
					.style("opacity", .8)
				e.fromElement.style.setProperty('stroke', 'transparent')
				myToolTip.style('display', 'none');
			}

			//read the topo json for United States
			d3.json("gz_2010_us_040_00_5m.json").then(function (topo) {
				
				//get max cases for legend
				let maxVal = d3.max(rawData.filter(d => d.id), d => d.cases)
				maxVal = Math.ceil(maxVal / 1000) * 1000
				// get scale
				const xVal = d3.scaleLinear().domain([0, maxVal]).range([0, 440])
				// get color
				color = d3.scaleSqrt().nice()
					.domain([1, maxVal])
					.range([d3.interpolateReds(0.1), d3.interpolateReds(1)])
					.interpolate(d3.interpolateHcl)
				const xAxis = d3.axisTop(xVal).tickSize(0).tickFormat(d3.format("~s"))

				//draw legend
				let legend = svg.append('g').attr('class', 'legend')
					.attr("transform", "translate(400,20)")

				legend.selectAll('rect')
					.data(d3.pairs(xVal.ticks(10)))
					.join('rect')
					.attr('height', 20)
					.attr('x', item => xVal(item[0]))
					.attr('width', item => xVal(item[1]) - xVal(item[0]) + 20)
					.attr('fill', item => color(item[0]))

				legend.append('g')
					.attr('class', 'legend')
					.call(xAxis)
					.call(g => g.select('.domain').remove())

				const orginColor = d3.interpolateReds(0)
				//draw default map
				let states = svg.append("g")
					.selectAll('path')
					.data(topojson.feature(topo, topo.objects.states).features)//use the topo data
					.join('path')
					.attr("id", d => d.id)
					.attr("fill", orginColor)//fill by origin color
					.attr("stroke", "#777")
					.attr("stroke-width", '0.5')
					.attr("stroke-linejoin", "round")
					.attr("d", path)
					.attr("transform", "translate(100,10)")
					.on("mouseover", mouseHover)
					.on("mouseleave", mouseOut)

				//prepare the time scale for delaying
				const delay = d3.scaleTime()
					.domain([new Date(rawData[0].date), new Date(rawData[rawData.length - 1].date)])
					.range([0, 10000]);

				let dateFlag = svg.append("g")
					.attr("class", "date")
					.attr("transform", "translate(800,100)")

				//covert to a mapping, key is date, value is object
				let dataByDateMap = {}
				rawData.forEach(t => {
					if (!dataByDateMap[t["date"]]) {
						dataByDateMap[t["date"]] = []
					}
					dataByDateMap[t["date"]].push(t)
				})

				//use the timeout funtion to draw State day by day
				for (let date in dataByDateMap) {
					let dateData = dataByDateMap[date]
					d3.timeout(() => {
						states
							.style('fill', function (d) {
								let stateCases = dateData.filter(item => item.id === d.id);
								return stateCases.length === 0 ? orginColor : d3.select(this).style('fill');
							})
							.transition()//the important function for change  the map from origin color to the target color
							.style('fill', d => {
								let stateCases = dateData.filter(item => item.id === d.id);
								return stateCases.length === 0 ? orginColor : color(+stateCases[0].cases);
							})
						//draw date flag
						dateFlag.selectAll('text')
							.data([date])
							.join('text')
							.transition()
							.text(date)
							.style('font-size', '30')
							.style('font-weight', 'bold')


					}, delay(new Date(date)))
				}

			})


		},
	},
}
</script>

<style scoped>
#tooltip {
	color: #222;
	background-color: #464646;
	padding: .5em;
	border-radius: 3px;
	opacity: 0.9;
	position: absolute;
	font-size: 0.9375rem;
	white-space: pre-line;
	color: white;
	text-align: left;
	width: 7.7rem;
	height: 6rem;
}
</style> 
