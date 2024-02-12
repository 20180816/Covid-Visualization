<template>
    <div class='rosechart' ref="covid">
        <div id="rosechart-title" class="title-content">Total Cases For State</div>
        <div id="rosechart-graph"></div>

    </div>
</template>

<script>
import * as d3 from 'd3';

var svg
var width = 1200,
    height = 600
var rawData = [],
    retData = []


function procData(category) {
    //console.log("start procData",category)

    //the latest date's data
    retData = rawData.filter(item => item.date === rawData[rawData.length - 1].date)

}

export default {
    name: 'RoseChart',
    data() {
        return {
            id: "RoseChart",
            width: 1000,
            height: 600,
            data: [],

        }
    },
    created() {

    },
    mounted() {
        console.log('mounted')
        // The svg
        svg = d3.select('#rosechart-graph')
            .append("svg")
            .attr("width", width)
            .attr("height", height+220)

        this.init()
    },
    methods: {
        init: function () {
            rawData = this.getCovidData()
            console.log('init Choropleth:' + rawData.length)

            if (rawData.length > 0) {
                const category = "cases"
                procData( category);
                this.draw()
            }

        },

        draw() {

            //prepare data
            let resultData = retData.sort((a, b) => b.cases - a.cases).slice(0,40).sort((a, b) => a.cases - b.cases)

            //color array
            let rainbow = d3.scaleDiverging(d3.interpolateSpectral);

            d3.select("#rosechart-graph").selectAll("g").remove()
            //add svg
            let g = svg.append('g').attr("transform", "translate(" + width / 2 + "," + height * 0.6 + ")");

            // set radius
            let ouerRadius = d3.min([width, height]) * 0.5;
            let inerRadius = 30;

            // set scale 
            let x = d3.scaleBand().range([0, 2 * Math.PI]).domain(resultData.map(d => d.name))
            let y = d3.scaleLog().domain([d3.min(resultData, d => d.cases), d3.max(resultData, d => d.cases)]).range([inerRadius + 100,
                ouerRadius
            ])

            // circular sector
            g.selectAll('path')
                .data(resultData)
                .enter()
                .append('path')
                .attr('fill', function (d, i) {
                    return rainbow((resultData.length - i) / resultData.length)
                })
                .attr('d', d3.arc()
                    .innerRadius(inerRadius)
                    .outerRadius(d => y(d.cases))
                    .startAngle(d => x(d.name))
                    .endAngle(d => x(d.name) + x.bandwidth())
                )

            //add flag
            g.append('g')
                .selectAll('text')
                .data(resultData)
                .enter()
                .append('text')
                .attr('x', (d, i) => {
                    let r = y(d.cases)
                    r = (i <= 22) ? r + 10 : r - 30
                    let endAngle = x(d.name) + x.bandwidth() / 2
                    return r * Math.sin(endAngle)
                })
                .attr('y', (d, i) => {
                    let r = y(d.cases)
                    r = (i <= 22) ? r + 10 : r - 30
                    let endAngle = x(d.name) + x.bandwidth() / 2
                    return -r * Math.cos(endAngle)
                })
                .attr('fill', (d, i) => {
                    if (i > 22) {
                        return 'grey'
                    }
                })
                .attr('font-size', (d, i) => {
                    if (i >= 40) {
                        return 22
                    }
                    return 12
                })
                .attr('font-weight', 'bold')
                .attr('text-anchor', (d, i) => (i <= 22) ? 'start' : 'middle')
                .attr('transform', (d, i) => {
                    let r = y(d.cases)
                    r = (i <= 22) ? r + 10 : r - 30
                    let endAngle = x(d.name) + x.bandwidth() / 2
                    let angleParam = 180 * endAngle / Math.PI
                    if (i >= 40) {
                        return `rotate(${angleParam},${r * Math.sin(endAngle)} ${-r * Math.cos(endAngle)})`
                    }
                    if (i <= 22) {
                        return `rotate(${angleParam - 90},${r * Math.sin(endAngle)} ${-r * Math.cos(endAngle)})`
                    }

                })
                .call(text => text.append('tspan')
                    .text((item, i) => {
                        if (item.deaths !== 0) {
                            return (i <= 22) ? `${item.cases} cases ${item.shortName}` : `${item.shortName}`
                        } else {
                            return (i <= 22) ? `${item.cases} cases ${item.shortName}` : `${item.shortName}`
                        }
                    })
                    .attr('dx', (d, i) => (i <= 22) ? 0 : (i < 33) ? 10 : (i < 36) ? 30 : (i < 40) ? 20 : 0)
                )
                .call(text => text.append('tspan')
                    .text((item, i) => {
                        return (i <= 22) ? `` : `${item.cases} cases`
                    })
                    .attr('dy', (d, idx) => (idx < 33) ? -14 : (idx < 36) ? 12 : (idx < 40) ? 20 : 22)
                    .attr('dx', (d, idx) => (idx < 33) ? -14 : (idx < 36) ? 6 : (idx < 40) ? -10 : -48)
                )
                .call(text => text.append('tspan')
                    .text((d, i) => {
                        if (d.deaths !== 0) {
                            return (i <= 22) ? `` : ``
                        }
                    })
                    .attr('dy', (d, idx) => (idx < 33) ? -14 : (idx < 36) ? -2 : (idx < 40) ? 22 : 22)
                    .attr('dx', (d, idx) => (idx < 33) ? -14 : (idx < 36) ? 10 : (idx < 40) ? -10 : -48)
                    .attr('font-weight', 'normal')
                    .attr('font-size', '10')
                )

            //draw tow circle
            g.append('circle')
                .attr('r', inerRadius + 25)
                .attr('x', 0)
                .attr('y', 0)
                .attr('fill', 'rgba(255,255,255,0.3)')

            g.append('circle')
                .attr('r', inerRadius + 40)
                .attr('x', 0)
                .attr('y', 0)
                .attr('fill', 'rgba(255,255,255,0.3)')

        },
    },
}
</script>

<style scoped>
</style> 
