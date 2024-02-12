<template>
  <div class="chart-bar" :id="id" ref="chart">
    <div id="barchart-title">Top 20 States</div>
		<div id="barchart-graph"></div>
  </div>
</template>

<script>
import * as d3 from "d3";

var rawData = []
var retData = []

export default {
  name: "bar-chart",
  data(){
    return{
      id:"chart",
      width: 800,
      height: 500,
      data: [],
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      //get raw data
      rawData = this.getCovidData()
      let category = "cases"
      this.procData('2022-11-20',category)

      var svgMargin = {
        top: 20,
        right: 50,
        bottom: 90,
        left: 90,
      };
      var svgWidth = this.width;
      var svgHeight = this.height;
      var mainColorList = [
        "#f6e242",
        "#ebec5b",
        "#d2ef5f",
        "#b1d894",
        "#97d5ad",
        "#82d1c0",
        "#70cfd2",
        "#63c8ce",
        "#50bab8",
        "#38a99d",
      ];
      var topColorList = [
        "#e9d748",
        "#d1d252",
        "#c0d75f",
        "#a2d37d",
        "#83d09e",
        "#68ccb6",
        "#5bc8cc",
        "#59c0c6",
        "#3aadab",
        "#2da094",
      ];
      var rightColorList = [
        "#dfce51",
        "#d9db59",
        "#b9d54a",
        "#9ece7c",
        "#8ac69f",
        "#70c3b1",
        "#65c5c8",
        "#57bac0",
        "#42aba9",
        "#2c9b8f",
      ];
      d3.select("#svg-column").remove();//remove old svg
      var svg = d3
        .select("#barchart-graph")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .attr("id", "svg-column");
      var transform = d3.geoTransform({
        point: function(x, y) {
          this.stream.point(x, y);
        },
      });

      this.data = retData
      //define path of geo
      var path = d3.geoPath().projection(transform);

      let xLineScale = d3
        .scaleBand()
        .domain(
          this.data.map(function(di) {
            return di.short_name;
          })
        )
        .range([0, svgWidth - svgMargin.right - svgMargin.left], 1.1);
      var xAxis = d3.axisBottom(xLineScale).ticks(this.data.length);
      //draw x-axis
      var x_Axisg = svg
        .append("g")
        .call(xAxis)
        .attr("transform", "translate(" + svgMargin.left + "," + (svgHeight - svgMargin.bottom+40) + ")");

      //remove old
      x_Axisg.select("path").remove();
      x_Axisg.selectAll("line").remove();
      //draw new cubic x-axis
      x_Axisg
        .append("path")
        .datum({
          type: "Polygon",
          coordinates: [
            [
              [20, 0],
              [0, 15],
              [svgWidth - svgMargin.right - svgMargin.left, 15],
              [svgWidth + 20 - svgMargin.right - svgMargin.left, 0],
              [20, 0],
            ],
          ],
        })
        .attr("d", path)
        .attr("fill", "rgb(187,187,187)");
      x_Axisg
        .selectAll("text")
        .attr("font-size", "12px")
        .attr("fill", "#646464")
        .attr("text-anchor","middle")
        .attr("dx", 20)
        .attr("dy", 10)
        .attr("transform", "rotate(30)")

      this.dataProcess(xLineScale); 

      var yLineScale;
      //create line scale for y-axis
      yLineScale = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(this.data, function(di) {
            return di.value * 1;
          }) * 1.2,
        ])
        .range([svgHeight - svgMargin.top - svgMargin.bottom, 0]);

      //dfine y-axis
      var yAxis = d3.axisLeft(yLineScale).ticks(6);

      //draw y-axis
      var y_Axisg = svg
        .append("g")
        .call(yAxis)
        .attr("transform", "translate(" + (svgMargin.left + 10) + "," +( svgMargin.top+40) + ")");
      y_Axisg
        .selectAll("text")
        .attr("font-size", "14px")
        .attr("fill", "#636363");
      //remove old
      y_Axisg.select("path").remove();
      y_Axisg.selectAll("line").remove();
      //add grid line
      var myGrid = svg
        .selectAll(".grid")
        .data(yLineScale.ticks(5))
        .enter()
        .append("g")
        .attr("class", "grid");
      myGrid
        .append("line")
        .attr("y1", yLineScale)
        .attr("y2", yLineScale)
        .attr("x1", 100)
        .attr("x2", svgWidth-30)
        .attr("stroke", "#cccccc");


      //define tip timer config
      var tipTimerCfg = {
        longer: 0,
        target: null,
        exist: false,
        winEvent: window.event,
        boxHeight: 398,
        boxWidth: 376,
        maxWidth: 376,
        maxHeight: 398,
        tooltip: null,
        showTime: 3500,
        hoverTime: 300,
        displayText: "",
        show: function(val, e) {
          "use strict";
          var self = this;

          if (e != null) {
            self.winEvent = e;
          }

          self.displayText = val;

          self.calcBoxAndShow();

          self.createTimer();
        },
        calcBoxAndShow: function() {
          "use strict";
          var self = this;
          var _x = 0;
          var _y = 0;
          var _w = document.documentElement.scrollWidth;
          var _h = document.documentElement.scrollHeight;
          var wScrollX = window.scrollX || document.body.scrollLeft;
          var wScrollY = window.scrollY || document.body.scrollTop;
          var xM = self.winEvent.x + wScrollX;
          if (_w - xM < self.boxWidth) {
            _x = xM - self.boxWidth - 10;
          } else {
            _x = xM;
          }

          var _yM = self.winEvent.y + wScrollY;
          if (_h - _yM < self.boxHeight + 18) {
            _y = _yM - self.boxHeight - 25;
          } else {
            _y = _yM + 18;
          }

          self.addMyTooltip(_x, _y);
        },
        addMyTooltip: function(page_x, page_y) {
          var self = this;

          self.tip = document.createElement("div");
          self.tip.style.left = page_x + "px";
          self.tip.style.top = page_y + "px";
          self.tip.style.position = "absolute";
          self.tip.style.background = "#cccccc";

          self.tip.style.width = self.boxWidth + "px";
          self.tip.style.height = self.boxHeight + "px";
          self.tip.className = "my-tooltip";

          var divInnerHeader = self.createMyInner();
          divInnerHeader.innerHTML = self.displayText;
          self.tip.appendChild(divInnerHeader);

          document.body.appendChild(self.tip);
        },
        createMyInner: function() {
          var self = this;
          var divInnerHeader = document.createElement("div");
          divInnerHeader.style.width = self.boxWidth + "px";
          divInnerHeader.style.height = self.boxHeight + "px";
          return divInnerHeader;
        },
        ClearTagDiv: function() {
          var delDiv = document.body.getElementsByClassName("my-tooltip");
          for (var i = delDiv.length - 1; i >= 0; i--) {
            document.body.removeChild(delDiv[i]);
          }
        },
        createMyTimer: function() {
          var self = this;
          var delTip = self.tooltip;
          var delTarget = tipTimerCfg.target;
          var removeTimer = window.setTimeout(function() {
            try {
              if (delTip != null) {
                document.body.removeChild(delTip);
                if (tipTimerCfg.target == delTarget) {
                  self.exist = false;
                }
              }
              clearTimeout(removeTimer);
            } catch (e) {
              clearTimeout(removeTimer);
            }
          }, self.showTime);
        },
        hoverMyTimerFn: function(showTip) {
          var self = this;

          var showTarget = tipTimerCfg.target;

          var hoverTimer = window.setInterval(function() {
            try {
              if (tipTimerCfg.target != showTarget) {
                clearInterval(hoverTimer);
              } else if (!tipTimerCfg.exist && new Date().getTime() - self.longer > self.hoverTime) {
                //show
                tipTimerCfg.show(showTip);
                tipTimerCfg.exist = true;
                clearInterval(hoverTimer);
              }
            } catch (e) {
              clearInterval(hoverTimer);
            }
          }, tipTimerCfg.hoverTime);
        },
      };

      var createMyTipTableData = function(info) {
        var ary = [];
        ary.push("<div class='tip-hill-div'>");
        ary.push("<div>state: " + info.name + "</div>");
        ary.push("<div>cases: " + info.value);
        ary.push("</div>");
        return ary.join("");
      };

      function clumnMyMouseout() {
        d3.select(this)
          .selectAll(".transparentPath")
          .attr("opacity", 1);
        tipTimerCfg.target = null;
        tipTimerCfg.ClearTagDiv();
      }

      //draw
      var g = svg
        .selectAll(".g")
        .data(this.data)
        .enter()
        .append("g")
        .on("mouseover", function($event,d) {
          //set opacity to 0.8
          d3.select(this)
            .selectAll(".transparentPath")
            .attr("opacity", 0.8);
          //add div
          tipTimerCfg.target = this;
          tipTimerCfg.longer = new Date().getTime();
          tipTimerCfg.exist = false;
          //get coordinate
          tipTimerCfg.winEvent = {
            x: event.clientX - 100,
            y: event.clientY,
          };
          tipTimerCfg.boxHeight = 50;
          tipTimerCfg.boxWidth = 180;
          //hide
          tipTimerCfg.ClearTagDiv();
          //show
          tipTimerCfg.hoverMyTimerFn(createMyTipTableData(d));
        })
        .on("mouseout", clumnMyMouseout)
        .attr("transform", function(di) {
          return "translate(" + (di.ox + svgMargin.left + 20) + "," + (svgHeight - svgMargin.bottom + 15) + ")";
        });

      g.transition()
        .duration(2500)
        .attr("transform", function(di) {
          return (
            "translate(" + (di.ox + svgMargin.left + 20) + ", " + (yLineScale(di.value) + svgMargin.bottom - 15) + ")"
          );
        });

      g.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("class", "transparentPath")
        .attr("width", function(di) {
          return di.ow;
        })
        .attr("height", function(di) {
          return di.oh;
        })
        .style("fill", function(d, i) {
          return mainColorList[i % 8];
        })
        .transition()
        .duration(2500)
        .attr("height", function(di) {
          return svgHeight - svgMargin.bottom - svgMargin.top - yLineScale(di.value);
        });

      g.append("path")
        .attr("class", "transparentPath")
        .attr("d", function(di) {
          return "M0,0 L" + di.p1.x + "," + di.p1.y + " L" + di.p2.x + "," + di.p2.y + " L" + di.ow + ",0 L0,0";
        })
        .style("fill", function(d, i) {
          return topColorList[i%8];
        });

      g.append("path")
        .attr("class", "transparentPath")
        .attr("d", function(di) {
          return (
            "M" +
            di.ow +
            ",0 L" +
            di.p2.x +
            "," +
            di.p2.y +
            " L" +
            di.p3.x +
            "," +
            di.p3.y +
            " L" +
            di.ow +
            "," +
            di.oh +
            " L" +
            di.ow +
            ",0"
          );
        })
        .style("fill", function(d, i) {
          return rightColorList[i%8];
        })
        .transition()
        .duration(2500)
        .attr("d", function(di) {
          return (
            "M" +
            di.ow +
            ",0 L" +
            di.p2.x +
            "," +
            di.p2.y +
            " L" +
            di.p3.x +
            "," +
            (di.p3.y + svgHeight - svgMargin.top - svgMargin.bottom - yLineScale(di.value)) +
            " L" +
            di.ow +
            "," +
            (svgHeight - svgMargin.top - svgMargin.bottom - yLineScale(di.value)) +
            " L" +
            di.ow +
            ",0"
          );
        });
    },
    //core logic to process data
    dataProcess(xLineScale) {
      var angle = Math.PI / 2.3;
      for (var i = 0; i < this.data.length; i++) {
        var di = this.data[i];
        var depth = 10;
        di.ow = xLineScale.bandwidth() * 0.7;
        di.ox = xLineScale(di.short_name);
        di.oh = 1;
        di.p1 = {
          x: Math.cos(angle) * di.ow,
          y: -Math.sin(angle) - depth,
        };
        di.p2 = {
          x: di.p1.x + di.ow,
          y: di.p1.y,
        };
        di.p3 = {
          x: di.p2.x,
          y: di.p2.y + di.oh,
        };
      }
    },
    procData(date, category) {
      let tmpData = rawData.filter(item => item.date === rawData[rawData.length - 1].date)
      tmpData.forEach((item) => {
        retData.push({
          name: item.name,
              short_name: item.shortName,
              value: item[category]
        })
      })
      retData = this.shuffle(   retData.sort( (a, b) => a.value > b.value ).slice(0, 20) )// top 20
    },
    shuffle(arr) {
    let m = arr.length;
    while (m > 1){
        let index = Math.floor(Math.random() * m--)
        let n = arr[m]
        arr[m] = arr[index]
        arr[index] = n
    }
    return arr;
  }},
  watch: {
    
  },

}
</script>

<style scoped></style>
