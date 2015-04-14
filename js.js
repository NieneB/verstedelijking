function searchKeyPress(e)
  {
      // look for window.event in case event isn't passed in
      e = e || window.event;
      if (e.keyCode == 13)
      {
          defineCity()
      }
  }

function defineCity(){
var city = document.getElementById("myText").value
console.log(city)
    loadCity(city)
}

loadCity("Amsterdam")
function loadCity(city) {
    var url = "http://api.histograph.io/search?name=" + city + "&type=hg:Place";
    d3.json(url, function(err, concepts) {
        console.log("Calling api.histograph.io for city: '" + city + "':");
        d3.select("#Error").html(city + " wordt getekend");
        if (concepts.features.length > 0 ) {                          // checks if concepts exist! // 
            
            var concept = concepts.features.filter(function(concept) {
              return concept.properties.pits.map(function(pit) {
                  return pit.source;
              }).indexOf("atlas-verstedelijking") != -1; 
            });
            
            
            if (concept.length > 0) {                // check if concept contains atlas-verstedelijking //
               
                
                //Get all atlas-verstedelijking properties //
                var pits = concept[0].properties.pits.filter(function(pit){ 
                    return pit.source == "atlas-verstedelijking"
                });
                
                pits.sort(function(a, b) {
                    return new Date(b.hasBeginning) - new Date(a.hasBeginning);
                });
                
                var atlas = {
                    type: "FeatureCollection",
                    features: pits.map(function(pit) {
                        return {
                            type: "Feature",
                            properties: pit,
                            geometry: concept[0].geometry.geometries[pit.geometryIndex]
                        };
                    })
                };
                
                
                // get years //
                var years = atlas.features.map(function(pit) { 
                    var date =  new Date(pit.properties.hasBeginning)
                    var year = date.getFullYear() 
                    return year 
                });
               
                var name = atlas.features[0].properties.name;
                // maak d3 json tekeningen \/ //
            
                // // d3.json making //
                 // city name //
                d3.select("#stad").html(name);
                // colors //
                var numcolors = years.length;
                
                var color = d3
                    .scale.ordinal()
                    .domain(d3.range(years))
                    .range(colorbrewer.BrBG[numcolors]);
                
                // projection//
                var scale = 150;
                var offset = [innerWidth/2, innerHeight/2];
                var center = d3.geo.centroid(atlas.features[numcolors-1].geometry)
                var projection = d3.geo.mercator()
                .scale(scale)
                .center(center)
                .translate(offset);

                // create the path//
                var path = d3.geo.path().projection(projection);

                //new projection//
                var bound = path.bounds(atlas.features[0].geometry);
                scale = scale / Math.max((bound[1][0] - bound[0][0]) / window.innerWidth, (bound[1][1] - bound[0][1]) / window.innerHeight);

                offset  = [innerWidth - (bound[0][0] + bound[1][0])/2,
                    innerHeight - (bound[0][1] + bound[1][1])/2];
                
                //set new projection //
                projection  = d3.geo.mercator()
                    .center(center)
                    .scale(scale)
                    .translate(offset);
                path = path.projection(projection);
                
                //draw city features//
                d3.select("#map").selectAll("path").remove();
                
                d3.select("#map").selectAll("path").data(atlas.features)
                    .enter()  
                    .append("path")
                    .attr("d", path)
                    .style("fill", "black")
                    .style("stroke", "#3c4044")
                    .style("stroke-width", "1px")
                    .style("opacity", "0.1")
                    // .style("mix-blend-mode", "hard-light")
                    .transition()
                    .style("opacity", "1")
                    .style("stroke", "none")
                    .style("fill", function(d) {
                        return color(d.properties.hasBeginning)
                        })
                    //.style("mix-blend-mode", "multiply")
                    .ease("linear")
                    .delay(function(d,i){
                        return (years.length-i) * 800
                    })
                    .duration(300);
                    
                    
                
                // building the legend bar //      
                var width =  100 / years.length;
                var height = 35;
                var legend = d3.select("#legend");
                legend.selectAll("div").remove();
                
                legend.selectAll("div")
                    .data(years)
                    .enter()
                    .append("div")
                    .attr("class", "rect")
                    .style("width" , width +"%")
                    .style("height" , height+"px")
                    .style("background-color", function(d, i) {                        
                        return color(atlas.features[atlas.features.length - 1 - i].properties.hasBeginning);                        
                    })
                    .style("color", "black")
                    .text(function(d, i) {
                        var date = new Date(atlas.features[atlas.features.length - 1 - i].properties.hasBeginning);
                        var year = date.getFullYear();
                        return year;
                     })
                     .style("text-align","center")
                     .style("vertical-align" ,"middle")
                     .style("line-height", height +"px")
                     .style("font-weight", "bold")
                     .style("font-size", "18px")
                     .style("font-family","Verdana")
                     .style("opacity", "0.9")
                            
             } else{
                 d3.select("#Error").html("Sorry, deze stad bevat geen verstedelijking data.. Probeer een andere!");
                 console.log("City does not contain atlas-verstedelijking")};
        } else { d3.select("#Error").html("Dit is geen stad. Probeer opnieuw");
            console.log("not a city")};
    }); // close json call    
}; // close loadcity
      