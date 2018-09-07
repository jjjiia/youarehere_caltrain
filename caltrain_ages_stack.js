
//TODO:
$(function() {
	// Window has loaded
	queue()
	//	.defer(d3.json, "static/geojson/lines.geojson")
		//.defer(d3.json, "static/geojson/stations.geojson")
		.defer(d3.json, data)
		.defer(d3.json, blocks)
	.await(dataDidLoad);
})

var columns = {
"SE_T008_002":"Total: Under 5 years",
"SE_T008_003":"Total: 5 to 9 years",
"SE_T008_004":"Total: 10 to 14 years",
"SE_T008_005":"Total: 15 to 17 years",
"SE_T008_006":"Total: 18 and 19 years",
"SE_T008_007":"Total: 20 years",
"SE_T008_008":"Total: 21 years",
"SE_T008_009":"Total: 22 to 24 years",
"SE_T008_010":"Total: 25 to 29 years",
"SE_T008_011":"Total: 30 to 34 years",
"SE_T008_012":"Total: 35 to 39 years",
"SE_T008_013":"Total: 40 to 44 years",
"SE_T008_014":"Total: 45 to 49 years",
"SE_T008_015":"Total: 50 to 54 years",
"SE_T008_016":"Total: 55 to 59 years",
"SE_T008_017":"Total: 60 and 61 years",
"SE_T008_018":"Total: 62 to 64 years",
"SE_T008_019":"Total: 65 and 66 years",
"SE_T008_020":"Total: 67 to 69 years",
"SE_T008_021":"Total: 70 to 74 years",
"SE_T008_022":"Total: 75 to 79 years",
"SE_T008_023":"Total: 80 to 84 years",
"SE_T008_024":"Total: 85 years and over"
}

function dataDidLoad(error,data,blocks) {
	//console.log(data)
    //drawColorKey(rentTiers)
    //list stations in order from sf to gil
    var stations = data.lines["_Lo-121"].prir[0].reverse()
    var dataByStation = {}
    var testArray = []
    for(var i in stations){
       // console.log(stations[i])
        var currentStation = stations[i]
       // var blockgroups = data.stns[currentStation].bgrs
        //console.log(blockgroups)
        var currentStationData = calculateColumnsByStation(currentStation, data)
        dataByStation[currentStation]=currentStationData
        testArray.push(currentStationData)
    }
    
    drawStackedAreaGraph(testArray)
}

function drawStackedAreaGraph(data){
   // console.log(data)
    var max = 18
    var colorScale = d3.scale.linear().domain([0,max/2,max]).range(["green","yellow","red"])
    var colorArray = []
    for(var i =0; i<max;i++){
        colorArray.push(colorScale(i))
    }
    
    
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 1200 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;
    var x = d3.scale.linear().domain([0,29])
        .range([0, width]);

    var y = d3.scale.linear().domain([0,100])
        .range([height, 0]);
        
    var color = d3.scale.category20();
   // var color = d3.scale.linear().range(colorArray)
    color.domain(d3.keys(data[0]))
   // console.log(d3.keys(data[0]))
    
    var area = d3.svg.area()
        .x(function(d,i) { return x(i); })
        .y0(function(d) { return y(d.y0); })
        .y1(function(d) { return y(d.y0 + d.y); });
    
    var stack = d3.layout.stack()
        .values(function(d) {return d.values; });
    
    data.forEach(function(d,i) {
        d.station = i;
    });
    
    var stations = stack(color.domain().map(function(name) {
      return {
        name: name,
        values: data.map(function(d,i) {
          return {station:i, y: d[name]};
        })
      };
    }));
    // console.log(stations)
    //console.log(data)
    var svg = d3.select("#charts").append("svg")
        .attr("width", width)
        .attr("height", height)
   // console.log(stations)
    var chart = svg.selectAll(".station")
        .data(stations)
        .enter()
        .append("g")
        .attr("class", function(d){
     //       console.log(d)
            return "stations"
        });
        
    chart.append("path")
          .attr("class", "area")
          .attr("d", function(d) {return area(d.values); })
          .style("stroke","#fff")
          .style("fill", function(d,i) { return colorScale(i); })
            .on("mouseover",function(d){
                console.log(d)
                var text = columns[d.name]+"<br/> "
                d3.select("#label").html(text)
            });

}

function calculateColumnsByStation(currentStation,data){
    var blockgroups = data.stns[currentStation].bgrs
    
	var populationTotal = 0
    var dataByStation = {}
    for(var k in blockgroups){
        var currentPopulation = parseFloat(blockgroups[k][1]["SE_T001_001"])
        //console.log(currentPopulation)
       // dataByStation[blockgroups[k][0]]=[]
        populationTotal+=currentPopulation
    }

//    console.log(populationTotal)
    //for each station, a list of block groups
    var columnData = []
	for(var j in columns){
		var column = j
        var sum = 0
        var min = 100
        var max = 0
        for(var i in blockgroups){
            var currentGroup = blockgroups[i][1]
            var currentGroupId = blockgroups[i][0]
            var value = parseFloat(currentGroup[column])
            sum += value
            if(value>max){max = value}
            if(value<min){min = value}
    	}
        var percent = parseInt(sum/populationTotal*100)
        //columnData.push(percent)
        dataByStation[column] = percent
       // dataByStation[column] = sum
        
    }
    //dataByStation[currentGroupId] = columnData
    //console.log(dataByStation)
    return dataByStation
}
function drawColorKey(rentTiers){
    var labels = []    
    
    for(var tier in rentTiers){
        labels.push(rentTiers[tier])
    }
    
    var colorKeySvg = d3.select("#colorKey").append("svg")
        .attr("width",130)
    .attr("height",800)
    var colorScale = d3.scale.linear().domain([0,11,22]).range(["green","yellow","red"])
    
    colorKeySvg.selectAll(".key")
        .data(labels)
        .enter()
        .append("circle")
        .attr("r",5)
        .attr("class","key")
        .attr("cx",function(d){return 10})
        .attr("cy",function(d,i){return i*20+5})
        .attr("fill",function(d,i){return colorScale(i)})
		.style("opacity",.6)
    
    colorKeySvg.selectAll(".keyLabel")
        .data(labels)
        .enter()
        .append("text")
        .text(function(d){console.log(d);return d})
        .attr("x",function(d){return 22})
        .attr("y",function(d,i){ return i*20+10})
        .attr("fill","#666")
    
       
}  
function capitalCase(string){
	string = string.toLowerCase()
	string = string.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
	string = string.replace(/'([a-z])/g, function (g) { return "'"+g[1].toUpperCase(); });
	string = string.replace("/", "-")
	string = string.replace(/-([a-z])/g, function (g) { return "-"+g[1].toUpperCase(); });
	
	return string
}
function highlightCurrentStation(station,data){
	var station_name = data.stns[station].name
	//console.log("highlight"+stripSpecialCharactersAndSpace(station_name))
	d3.selectAll(".rollovers"+stripSpecialCharactersAndSpace(station_name)).attr("opacity",.4)
	d3.select("#chart-title").html(formatDetailedData(station,data))

}

