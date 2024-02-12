const { randomInt } = require('d3')
let jsonData = require('./public/gz_2010_us_040_00_5m.json')

//console.log(jsonData.features.length)

let result = []
let dateLastWeek = [
    '2022-11-14',
    '2022-11-15',
    '2022-11-16',
    '2022-11-17',
    '2022-11-18',
    '2022-11-19',
    '2022-11-20',
]

//console.log(randomInt(20)()+'a')
for(let i = 0;i<jsonData.features.length;i++){
    
    //console.log(jsonData.features[i].properties.NAME+','+i*10+','+i)
    for(let j=0;j<7;j++){
        console.log(dateLastWeek[j] + ','+jsonData.features[i].properties.STATE+','+ jsonData.features[i].properties.NAME+','+((i+1)*2*randomInt(20)()+20)+','+j*2*randomInt(8)())
    }

}