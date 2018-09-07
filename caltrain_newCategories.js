
//TODO:
$(function() {
	// Window has loaded
	queue()
	//	.defer(d3.json, "static/geojson/lines.geojson")
		//.defer(d3.json, "static/geojson/stations.geojson")
		.defer(d3.json, data)
		.defer(d3.json, blocks)
		.defer(d3.json, boundary)
		.defer(d3.json, water)
	.await(dataDidLoad);
})

var rentTiers = {
"SE_T102_002":"Renter-occupied housing units with cash rent: Gross Rent: Less than $300",
"SE_T102_003":"Renter-occupied housing units with cash rent: Gross Rent: $300 to $599",
"SE_T102_004":"Renter-occupied housing units with cash rent: Gross Rent: $600 to $799",
"SE_T102_005":"Renter-occupied housing units with cash rent: Gross Rent: $800 to $999",
"SE_T102_006":"Renter-occupied housing units with cash rent: Gross Rent: $1,000 to $1,249",
"SE_T102_007":"Renter-occupied housing units with cash rent: Gross Rent: $1,250 to $1,499",
"SE_T102_008":"Renter-occupied housing units with cash rent: Gross Rent: $1,500 to $1,999",
"SE_T102_009":"Renter-occupied housing units with cash rent: Gross Rent: $2,000 or More",
}

function dataDidLoad(error,data,blocks,boundary,water) {
	//console.log(data)
	var svg = d3.select("#subway")
		.append("svg")
		.attr("width",mapWidth)
		.attr("height",mapHeight)
	//drawWater(water,svg,"none","#333","water")
	//drawWater(water,svg,"none","#ddd","water")
	//drawWater(boundary,svg,"none","#ddd","city")
	//drawLineGraph("RED",data)
	//d3.selectAll(".rolloverpath").attr("opacity",1)
	//formatSubwayStopsByLine(stations,data,blocks,svg)

     drawColorKey(rentTiers)
    d3.select("#charts svg").remove()
    var margin = {top: 20, right: 20, bottom: 140, left: 50},
        width = 1000 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;
    var chartSvg = d3.select("#charts")
    	.append("svg")
    	.attr("width",width)
    	.attr("height",height)
    var colorScale = d3.scale.linear().domain([0,10]).range(["green","red"])
    var max = 100
    var colorIndex = 0
    for(var tier in rentTiers){
        var column = tier
        var description = rentTiers[tier]
        //console.log(description)
            var currentColor = colorScale(colorIndex)
          //  console.log(currentColor)
            drawLineGraph(initialLineToDraw,data,column,max,column,chartSvg,currentColor)
            colorIndex+=1
    }
   
}

function drawColorKey(rentTiers){
    var labels = []    
    
    for(var tier in rentTiers){
        labels.push(rentTiers[tier])
    }
    
    var colorKeySvg = d3.select("#colorKey").append("svg")
        .attr("width",400)
    var colorScale = d3.scale.linear().domain([0,10]).range(["green","red"])
    
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
function addButton(line, data, className,column, max, divName){
    d3.select("#"+divName)
    .html(className)
    .on("click",function(){
    	drawLineGraph(initialLineToDraw,data,column,max,className)
    })
    .style("cursor", "pointer");
    
}
function capitalCase(string){
	string = string.toLowerCase()
	string = string.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
	string = string.replace(/'([a-z])/g, function (g) { return "'"+g[1].toUpperCase(); });
	string = string.replace("/", "-")
	string = string.replace(/-([a-z])/g, function (g) { return "-"+g[1].toUpperCase(); });
	
	return string
}
function undoHighlight(station){
	//console.log("undo "+station)
	d3.select("#chart-title").html("")
	d3.selectAll(".rollovers"+stripSpecialCharactersAndSpace(station)).attr("opacity",0)
}

function formatDetailedData(station,data){
	var stationName = data.stns[station].name
	var blockgroups = data.stns[station].bgrs
	var stationData = calculateRent(blockgroups)
    console.log(blockgroups)
    console.log(stationData)
    var population = stationData[1]
	var quantity = stationData[0]
	
	
	var currentStation = capitalCase(stationName)
	return "<strong>"+currentStation+"</strong><br/>"+quantity+" Blockgroups in 1 Mile Radius"+"<br/>Number of Renter Households: "+population}


function highlightCurrentStation(station,data){
	var station_name = data.stns[station].name
	//console.log("highlight"+stripSpecialCharactersAndSpace(station_name))
	d3.selectAll(".rollovers"+stripSpecialCharactersAndSpace(station_name)).attr("opacity",.4)	
	d3.select("#chart-title").html(formatDetailedData(station,data))

}
function stripSpecialCharactersAndSpace(inputString){
	var newString = inputString.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"")
	newString = newString.replace(/\s/g, '')
	newString = newString.replace(/['"]+/g, '')
	newString = newString.replace("@","")
	//console.log("class: "+newString)
	return newString
}
function calculateRent(blockgroups,column){
	var sum = 0
	var populationTotal = 0
	var max = 0
	var min = 100
	for(var i in blockgroups){
		var blockgroup = blockgroups[i]
        
        // get percent commute method
		var currentMethod = parseFloat(blockgroup[1][column])
        var currentPopulation = parseFloat(blockgroup[1]["SE_T102_001"])
        var currentPercentage = currentMethod/currentPopulation*100
		if( currentPercentage > max){
			max =  currentPercentage
		}
		if ( currentPercentage < min){
			min =  currentPercentage
		}
		if(isNaN(currentPopulation)){
			currentPopulation = 0
		}
				
		if(isNaN(currentMethod)){
			currentMethod = 0
			currentpopulation = 0
		}
		if(min == 100){
			min = 0
		}
		sum +=currentMethod
		populationTotal = populationTotal+currentPopulation
		var averagePercent = sum/populationTotal*100
		if(sum == 0){
			averageIncome =0
			max = 0
			min = 0
			//populationTotal = 0
		}else{
			max = parseInt(max)
			min = parseInt(min)
			averagePercent = parseInt(averagePercent)
			populationTotal = parseInt(populationTotal)
		}
	}
	// console.log(["income data function",blockgroups.length,populationTotal,sum/populationTotal,min,max])
	return [blockgroups.length,populationTotal,averagePercent,min,max]
}
function calculateIncomeData(blockgroups){
	var sum = 0
	var populationTotal = 0
	var max = 0
	var min = 100000000000000
	for(var i in blockgroups){
		var blockgroup = blockgroups[i]
		//console.log(blockgroup)
		var income = parseFloat(blockgroup[1]["SE_T057_001"])
		if(income > max){
			max = income
		}
		if (income < min){
			min = income
		}
		var population = parseFloat(blockgroup[1]["SE_T001_001"])
		if(isNaN(population)){
			population = 0
		}
		
		var populationProportion = parseFloat(blockgroup[1]["popp"])
		
		if(isNaN(income)){
			income = 0
			population = 0
		}
		if(min == 100000000000000){
			min = 0
		}
		income = income*(population*populationProportion)
		sum +=income
		populationTotal = populationTotal+population*populationProportion
		var averageIncome = sum/populationTotal
		if(sum == 0){
			averageIncome =0
			max = 0
			min = 0
			populationTotal = 0
		}else{
			max = parseInt(max)
			min = parseInt(min)
			averageIncome = parseInt(averageIncome)
			populationTotal = parseInt(populationTotal)
		}
	}
	// console.log(["income data function",blockgroups.length,populationTotal,sum/populationTotal,min,max])
	
	return [blockgroups.length,populationTotal,averageIncome,min,max]
}
/*function calculateLineWideAverage(graphData){
	
}*/
function calculateAverages(data){
	//console.log(data.lines)
	//console.log(data.stns["NAYLOR ROAD METRO STATION"])
	var incomeAverages = []
	//console.log(data.lines["WIL"])
	var allLinesIncomeSum = 0
	var allLinesPopSum = 0
	for(var line in data.lines){
		//console.log(data.lines[line])
		var lineName = data.lines[line]["line_name"]
		var lineIncomeSum = 0
		var linePopSum = 0
		var lineData = data.lines[line]
		var stations = lineData.stns
		for (var station in stations){
			var currentStation = stations[station]
			var blockGroups = data.stns[currentStation].bgrs
			//console.log(blockGroups)
			for(var blockGroup in blockGroups){
				var currentBlockGroup = blockGroups[blockGroup][1]
				var population = parseFloat(currentBlockGroup["SE_T102_001"])
				var income = parseFloat(currentBlockGroup["SE_T104_001"])
				if (isNaN(income)){
					income = 0
					population = 1
				}
				var proportion = parseFloat(currentBlockGroup["popp"])
				
				var weightedPopulation = population*proportion
				var incomeTotal = income*weightedPopulation
				lineIncomeSum = lineIncomeSum+incomeTotal
				linePopSum = linePopSum+weightedPopulation
				lineAverage = lineIncomeSum/linePopSum
			}
		}
		incomeAverages.push([line,lineAverage,linePopSum])
		allLinesIncomeSum +=lineIncomeSum
		allLinesPopSum +=linePopSum
		allLinesAverage = allLinesIncomeSum/allLinesPopSum
		
	}
	incomeAverages.push(["all",allLinesAverage,allLinesIncomeSum])
	//console.log(incomeAverages)
	return incomeAverages
}
function calculateDistance(origin,coordinates) {
	var lat1 = origin[1]
	var lon1 = origin[0]
	var lat2 = coordinates[1]
	var lon2 = coordinates[0]
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}
function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function formatLineData(lineColor,column,data){
	var currentData = data.lines[lineColor]["stns"]
	var orderedStations = data.lines[lineColor]["prir"][0]
	var stationList = []
	var cummulativeDistance = 0
	//for each station, get groups and average data
	for(var station in orderedStations){
		var currentStation = orderedStations[station]
		var originStation = orderedStations[0]
		//console.log([originStation,currentStation])
		var blockgroups = data.stns[currentStation]["bgrs"]
		//console.log(blockgroups)
		var coordinates = data.stns[currentStation]["coor"]
		if(station == 0){
			var origin = data.stns[originStation]["coor"]
		}else{
			var origin = data.stns[orderedStations[station-1]]["coor"]
		}
		//var incomeData = calculateIncomeData(blockgroups)
		var incomeData=calculateRent(blockgroups,column)
        var income = incomeData[2]
		var minIncome = incomeData[3]
		var maxIncome = incomeData[4]
		var distance = calculateDistance(origin,coordinates)
		//added to space out the chart and labels
		
		//if(distance < 0.8){
		//	distance = 0.8
		//}
		cummulativeDistance = cummulativeDistance+distance
		//console.log([distance,cummulativeDistance])
		stationList.push([currentStation,income,cummulativeDistance,minIncome,maxIncome])
		
	}
	
	return stationList
}

function drawLineGraph(lineColor,data,column,max,className,chartSvg,color){
	var averages = calculateAverages(data)
	//console.log('lineColor',lineColor)
	//console.log('averages',averages)
	var graphData = formatLineData(lineColor,column,data)
	
        
		
	var maxDistance = graphData[graphData.length-1][2]
	var maxIncomes = []
		for(var i in graphData){
			maxIncomes.push(graphData[i][4])
		}
        
    var margin = {top: 20, right: 20, bottom: 140, left: 50},
        width = 1000 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;
	var maxIncome = Math.max.apply(null, maxIncomes);
	//	console.log(incomes)
	//	console.log(maxIncome)
	//var incomeScale = d3.scale.linear().domain([0,maxIncome]).range([height- margin.top,margin.bottom])
	var incomeScale = d3.scale.linear().domain([0,max]).range([height- margin.top,margin.bottom])
	var coordinateScale = d3.scale.linear().domain([-.5,maxDistance]).range([margin.left,width - margin.right])	
	
	for(var i in averages){
		var averagesLineColor = averages[i][0]
		if(averagesLineColor == lineColor){
			var averageIncomeLineColor = averages[i][1]
		//	console.log('averageIncomeLineColor',averageIncomeLineColor)
			//console.log(colorDictionary[lineNameToLine[lineColor]])
		}
	}
	
	var lineName = capitalCase(data.lines[lineColor]["line_name"].replace("Line", ""))

		if (lineNameToLine.hasOwnProperty(lineColor)) {
			lineName = lineNameToLine[lineColor].replace("Line", "")
		}
		
	d3.select("#line-title").html("<strong>"+lineName+" Line </strong><br/> Average Median Household Income: $"+parseInt(averageIncomeLineColor))
	chartSvg.append("text")
	.text("Weighted Line Average: $"+parseInt(averageIncomeLineColor))
	.attr("x",width)
	.attr("y",incomeScale(averageIncomeLineColor)-margin.bottom-3)
	.attr("text-anchor", "end")
	.attr("fill", colorDictionary[lineColor])
	//draw averages
	chartSvg.selectAll("rect")
	.data(averages)
	.enter()
	.append("rect")
	.attr("x",function(d){
		return margin.left-8
	})
	.attr("y",function(d){
		return incomeScale(d[1])-margin.bottom
	})
	.attr("width",width)
	.attr("height",2)
	.attr("fill",function(d){
		//return colorDictionary[d[0]]
		//console.log(d[0])
		return colorDictionary[d[0]]
	})
	.attr("opacity",0.3)
	//.on("mouseover",function(d){
		//console.log(["line average",d])
	//})
	//console.log(graphData)
	for(var i in graphData){
		chartSvg.append("text")
			.attr("id","stationLabel")
			.text(function(d){
				var stationLabel = data.stns[graphData[i][0]].name
				var currentStation = capitalCase(stationLabel)
				for(var word in wordsToReplace){
					var currentWord = wordsToReplace[word]
					currentStation = currentStation.replace(currentWord, "")
				}
				return currentStation
			})
			.attr("x", function(d){
				return coordinateScale(graphData[i][2])
			})
			.attr("y", function(d,i){
				return height-margin.bottom-margin.top
			})
			.attr("dy", 5)
			.style("text-anchor","start")
	}
	

	chartSvg.append("rect")
		.attr("y",height-margin.bottom-20)
		.attr("x",margin.left)
		.attr("width",width-margin.left-margin.right)
		.attr("height",1)
		.attr("fill","#aaa")
	
	var yAxis = d3.svg.axis()
	    .scale(incomeScale)
	    .orient("left")
        .ticks(6)
		//.tickValues([50000,100000,150000,200000,250000]);	
	chartSvg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
		.attr("fill","#aaa")
        .attr("transform", "translate("+margin.left+","+-margin.bottom+")")
      chartSvg
		.append("text")
        .attr("x",0)
		.attr("y", -55)
		.attr("transform","rotate(90)")
        .style("text-anchor", "start")
        .text(className+column)
		.attr("fill","#aaa");
	//line graph 		
	var line = d3.svg.line()
		.x(function(d){
			return coordinateScale(d[2])
		})
		.y(function(d){
			var income = d[1]
			if(isNaN(income)){
				income = 0
			}
			return incomeScale(income)-margin.bottom
		})
        .interpolate("basis");
        
	chartSvg.append("path")
		.datum(graphData)
		.attr("class",className)
		.attr("d",line)
		.attr("fill","none")
		.style("stroke", color)
		.style("stroke-width", 2)
		.style("opacity",.6)

	
	  var tip = d3.tip()
	    .attr('class', 'chart-tip')
	    .offset([-4, 0])
	 chartSvg.call(tip)
			
	chartSvg.selectAll("circle .average")
		.data(graphData)
		.enter()
		.append("circle")
		.attr("class", "average")
		.attr("class",function(d){
			
			return stripSpecialCharactersAndSpace(d[0])
		})
		.attr("cx", function(d){
			return coordinateScale(d[2])
		})
		.attr("cy", function(d){
			return incomeScale(d[1])-margin.bottom
		})
		.attr("r", 3)
		.attr("fill",color)
		.style("opacity",.6)
        
	chartSvg.selectAll("circle .average")
		.data(graphData)
		.enter()
		.append("circle")
		//.attr("class", "rollovers")
		.attr("class",function(d){
			return "rollovers"+stripSpecialCharactersAndSpace(data.stns[d[0]].name)
		})
		.attr("cx", function(d){
			return coordinateScale(d[2])
		})
		.attr("cy", function(d){
			return incomeScale(d[1])-margin.bottom
		})
		.attr("r",8)
		.attr("fill",color)
		.attr("opacity",0)	
		.on("mouseover",function(d){
			var tipText =parseInt(d[1])+"%"
			tip.html(tipText)
			tip.show()
			d3.select(this).attr("opacity",.5)

			highlightCurrentStation(d[0],data)
		})
		.on("mouseout", function(d){
			tip.hide()
			d3.select(this).attr("opacity",0)
			undoHighlight(data.stns[d[0]].name)
		})
	
}

function buildStationLineDictionary(data){
	var stationLineDictionary = {}
	for(var line in data.lines){
		var currentLine = data.lines[line]
		for(var station in currentLine.prir[0]){
			var currentStationID = currentLine.prir[0][station]
			stationLineDictionary[currentStationID]=line
		}
	}
	return stationLineDictionary
}
function formatSubwayStopsByLine(stops,data,blocks,svg){
	var stationLineDictionary = buildStationLineDictionary(data)	
	var projection = d3.geo.mercator()
		.scale(scale)
		.center(center)
		.translate(translate)
	
	var linesData = data.lines
	var stationData = data.stns
	var stationLocationData = data.stns
	var index = 0
	for(var line in linesData){
		index +=1
		var offset = offsetDictionary[line]
		var currentRoute = linesData[line]['prir'][0]
		var color = line
		//console.log('color',color)
		drawSubwayLines(currentRoute,data,svg,color,offset)

		for(var station in currentRoute){
			//console.log('currentRoute',currentRoute)
			//console.log('station',station)
			var currentStationID = currentRoute[station]
			var currentStation = stationData[currentStationID]
			var currentStationCoordinates = [currentStationID,currentStation.coor]
			var routes = stationLineDictionary[currentStationID].split(",")
			for(var route in routes){
				var fill = colorDictionary[routes[route].replace(/\s+/g, '')]
				var radius = 3
				//console.log([radius,fill])
				drawSubwayStops(blocks,currentStationCoordinates,data,svg,color,radius,offset)
			}
		}
	}
	
}
function drawSubwayLines(route,data,svg,color,offset){
	//console.log('offset',offset)
//	console.log(route)
//	console.log(data)
	var routeLine = []
	for(var station in route){
		var currentStation = route[station]
		var stations = data.stns
		var coordinates = stations[currentStation].coor
		//console.log(coordinates)
		routeLine.push(coordinates)
	}
	var projection = d3.geo.mercator()
		.scale(scale)
		.center(center)
		.translate(translate)
		
	var line = d3.svg.line()
	    .x(function(d) { 
			return parseInt(projection(d)[0])+offset[0]; 
		})
	    .y(function(d) { 
			//console.log(["y",projection(d)[1]]);
			return parseInt(projection(d)[1])+offset[1]; 
		});
		//var tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d;});
	//	var clicked = null;
//below is invisible path for rollovers
	svg.selectAll("path ."+color)
        .data(routeLine)
        .enter()
        .append("path")
		.attr("class","subwayLine"+" "+color)
		.attr("d",line(routeLine))
		.attr("fill","none")
		.style("stroke-width", .8)
		.style("stroke",colorDictionary[color])
		.style("stroke-opacity",0)
		.transition()
		.duration(2000)
		.style("stroke-opacity",1)

	svg.selectAll("path ."+color)
	    .data(routeLine)
	    .enter()
	    .append("path")
		.attr("class","rolloverpath")
		.attr("d",line(routeLine))
		.attr("fill","none")
		.style("stroke-width", 10)
		.style("stroke",colorDictionary[color])
		.style("opacity", 0)
		.style("stroke-linecap", "round")
		.on("click",function(d){
		})
		.on("mouseover",function(d){
			var lineColor = color
			drawLineGraph(lineColor,data)
			//d3.select(this).style("opacity",0.2)
		})
		.on("mouseout",function(d){
			//d3.selectAll(".rolloverpath").style("opacity",0)
			//d3.selectAll(".selected").style("opacity",.2)
		})		


}
function drawSubwayStops(blocks,currentCoordinates,data,svg,fill,radius,offset){
	var projection = d3.geo.mercator()
		.scale(scale)
		.center(center)
		.translate(translate)
	var stationsData = data.stns
	svg.append("circle")
		.attr("cx", projection(currentCoordinates[1])[0]+offset[0])
		.attr("cy", projection(currentCoordinates[1])[1]+offset[1])
		.attr("r",3)
		.attr("class",function(d){
			return stripSpecialCharactersAndSpace(stationsData[currentCoordinates[0]].name)
		})
	    .style("fill",colorDictionary[fill])
		.attr("opacity", .8)
		//.attr("stroke","#fff")
		
		
	var mapTip = d3.tip()
		.attr('class', 'map-tip')
		.offset([-4, 0])
	
	svg.call(mapTip)
	svg.append("circle")
		.attr("cx", projection(currentCoordinates[1])[0]+offset[0])
		.attr("cy", projection(currentCoordinates[1])[1]+offset[1])
		.attr("r",6)
		.attr("class",function(d){
			
			return "rollovers"+stripSpecialCharactersAndSpace(stationsData[currentCoordinates[0]].name)
		})
	    .style("fill",colorDictionary[fill])
		.attr("opacity", 0)
		.on("mouseover", function(){
			drawLineGraph(fill,data)

			d3.select(this).attr("opacity",.2)
			//drawBlocks(blocks,currentCoordinates,data)
			currentStation = stationsData[currentCoordinates[0]].name
			highlightCurrentStation(currentCoordinates[0],data)
			var tipText = capitalCase(currentStation)
			mapTip.html(tipText)
			mapTip.show()
			//console.log(fill)
			//d3.selectAll("."+fill).attr("opacity",.2)
			
		//	var stationData = displayDataByStation(station,data)
			//d3.select("#station_rollover").html("stop:"+d.properties.STATION+"</br> line:"+d.properties.LINE+"</br>"+stationData)			
		})
		.on("mouseout",function(d){
			undoHighlight(currentStation)
			//console.log(data.stns[currentStation])
			//console.log(data.stns)
			mapTip.hide()
			//d3.selectAll(".rolloverpath").attr("opacity",0)
			//d3.selectAll(".selected").style("opacity",.2)
			
			//d3.selectAll("path .rolloverpath ."+fill).attr("opacity",0)
		})
		.on("click",function(d){
			d3.selectAll(".rolloverpath").style("opacity",0)
			
		//	d3.selectAll(".selected").classed("selected",false).attr("class","rolloverpath")
		//	console.log(fill)
		})
}
