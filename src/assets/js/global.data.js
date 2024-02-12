import * as d3 from 'd3';


var covidData = []

//加载全局数据
function loadData(covidDataCallback) {

	//read short name of state 
	d3.csv('./state.csv', m => ({
		name: m.state,
		shortName: m.short_name
	})).then(function (d) {
		const shortNameData = JSON.parse(JSON.stringify(d));
		let shortNameMap = {}
		for (let i = 0; i < shortNameData.length; i++) {
			shortNameMap[shortNameData[i].name] = shortNameData[i].shortName
		}
		console.log(shortNameMap)
		//read covid data
		d3.csv('./covid.csv', d => ({
			id: d.id,
			name: d.name,
			date: d.date,
			cases: +d.cases,
			deaths: +d.deaths,
			shortName: shortNameMap[d.name]
		})).then(function (d) {
			covidData = JSON.parse(JSON.stringify(d));
			console.log('load data,covidData.length:' + covidData.length)

			covidDataCallback(covidData);
		})

	})


}


function getCovidData() {
	return covidData;
}



export default {
	install: function(Vue) {
		Vue.prototype.loadData = (covidDataCallback,
		) => loadData(
			covidDataCallback)
		Vue.prototype.getCovidData = () => getCovidData()
	}

}
