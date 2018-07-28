var width = 960;
var height = 500;

var lowColor = '#EAEEDA'
var highColor = '#758636'

//var highColor = '#622556'
//var lowColor = '#FCF7FB'

// D3 Projection
var projection = d3.geoAlbersUsa()
  .translate([width / 2, height / 2]) // translate to center of screen
  .scale([1000]); // scale things down so see entire US

// Define path generator
var path = d3.geoPath() // path generator that will convert GeoJSON to SVG paths
  .projection(projection); // tell path generator to use albersUsa projection

//Create SVG element and append map to the SVG
var svg = d3.select("#map")
  .append("svg")
//   .attr("preserveAspectRatio", "xMinYMin meet")
//  .attr("viewBox", "0 0 960 500")
  .attr("width", width)
  .attr("height", height)
  svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "white");

//d3.select("#map").attr("align","center");
var div = d3.select("#map")
            .append("div")   
            .attr("class", "tooltip");
           
			
var t = d3.transition()
  .on("interrupt", function(d,i){
   console.info(i);
  });
// Load in my states data!
d3.csv("sample.csv", function(data) {
    var dataArray = [];
    for (var d = 0; d < data.length; d++) {
        dataArray.push(parseFloat(data[d].value))
    }
    var minVal = d3.min(dataArray)
    var maxVal = d3.max(dataArray)
    var ramp = d3.scaleLinear().domain([minVal,maxVal]).range([lowColor,highColor])
    
	
		
  // Load GeoJSON data and merge with states data
  d3.json("us-states.json", function(json) {

    // Loop through each state data value in the .csv file
    for (var i = 0; i < data.length; i++) {

      // Grab State Name
      var dataState = data[i].state.toLowerCase();
      //console.log(dataState);
      // Grab data value 
      var dataValue = data[i].value;
//console.log(dataValue);
      //Find the corresponding state inside the GeoJSON
         for (var j = 0; j < json.features.length; j++) {
            var jsonState = json.features[j].properties.name.replace(/\s+/g, '').toLowerCase();
      console.log(jsonState , dataState);
            if (dataState == jsonState) {
		         json.features[j].properties.value = parseFloat(dataValue);
				//console.log(dataValue) ;
	 		}
         // break;
        
      }
    }

	
    // Bind the data to the SVG and create one path per GeoJSON feature
    svg.selectAll("path")
      .data(json.features)
      .enter()
      .append("path")
      .attr("d", path)
      .style("stroke", "#fff")
      .style("stroke-width", "1")
      .style("fill", function(d) { 
          if(d.properties.value == -1){
              return '#5d5d5e';
          } else {
          return  ramp(d.properties.value);
          }
        }).on("mouseover", function(d) {  
		
        div.transition()        
           .duration(200)      
           .style("opacity", 1);   
	       d3.select(this)
          .transition(t)
          //.style("fill", "red");	
           var format = d3.format("$,");		  
         // div.text(d.properties.name)
		  div.text(d.properties.name + " : " + format(Math.round(d.properties.value)))
		  //div.text(parseFloat(d.properties.value))
           .style("left", (d3.event.pageX) + "px")     
           .style("top", (d3.event.pageY)  + "px");    
    })   
    // fade out tooltip on mouse out               
    .on("mouseout", function(d) {       
        div.transition()        
           .duration(500)      
           .style("opacity", 0)
		   d3.select(this).interrupt();
        d3.select(this)
          .transition(t)
        //  .style("fill", "#aca");;   
    })
    .on("click", function(d){  
	     var queryString = "?para1=" + d.properties.name;
	     location.href = "index_bar.html" + queryString ;
    })
    ;
    
          //add a legend
		  
		  
  
  //
        var w = 140, h = 300;

        var key = d3.select("#map")
            .append("svg")
            //.attr("viewBox", "0 0 1800 1300")
            // .attr("preserveAspectRatio", "xMinYMin meet")
            // .attr("viewBox", "0 0 1800 1300")
            .attr("width", w)
            .attr("height", h)
            .attr("class", "legend")

        var legend = key.append("defs")
            .append("svg:linearGradient")
            .attr("id", "gradient")
            .attr("x1", "100%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "100%")
            .attr("spreadMethod", "pad")
			;

        legend.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", highColor)
            .attr("stop-opacity", 1);
            
        legend.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", lowColor)
            .attr("stop-opacity", 1);

        key.append("rect")
            .attr("width", w - 100)
            .attr("height", h)
            .style("fill", "url(#gradient)")
			//.attr('x', 1000 + 10)
			//.attr('y', legendRectSize - legendSpacing)
            .attr("transform", "translate(0,10)");

        var y = d3.scaleLinear()
            .range([h, 0])
            .domain([minVal, maxVal]);

        var yAxis = d3.axisRight(y);

        key.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(41,10)")
            .call(yAxis.ticks(10, "s"))
  });
});


