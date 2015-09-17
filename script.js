// function searchKeyPress(e){
//     e = e || window.event;
//     if (e.keyCode == 13) {
//         defineCity();
//     }
// };

// dropdown menu
function openelement() {
    var item = document.getElementById("dropdown");
    item.style.visibility = 'visible'; 
}

function closeelement(item){
        var item = document.getElementById("dropdown");
        item.style.visibility = 'hidden'
}

// // end dropdown

function defineCity(city){
    // var e = document.getElementById("city-input");
//     var city = e.options[e.selectedIndex].text;
    d3.select("#city").html(city);
    console.log(city)
    loadCity(city);
};
var atlas

function loadCity(city) {
    var url = "https://api.histograph.io/search?name=" + city + "&type=hg:Place&dataset=atlas-verstedelijking";
    d3.json(url, function(err, concepts) {

        console.log("Calling api.histograph.io for city: '" + city + "':");
        d3.select("#error").html("");

        // check if concepts exist
        if (concepts.features.length > 0 ) {
            
            // only use concepts containing at least one pit from 'atlas-verstedelijking' souce
            var concept = concepts.features.filter(function(concept) {
              return concept.properties.pits.map(function(pit) {
                  return pit.dataset;
              }).indexOf("atlas-verstedelijking") != -1;
            });

            if (concept.length > 0) {

                // Get all atlas-verstedelijking pits
                var pits = concept[0].properties.pits.filter(function(pit){
                    return pit.dataset == "atlas-verstedelijking"
                });

                pits.sort(function(a, b) {
                    return new Date(b.hasBeginning) - new Date(a.hasBeginning);
                });

                atlas = {
                    type: "FeatureCollection",
                    features: pits.map(function(pit) {
                        return {
                            type: "Feature",
                            properties: pit,
                            geometry: concept[0].geometry.geometries[pit.geometryIndex]
                        };
                    })
                };
                console.log(atlas)
                updateVisualization(atlas);
             } else {
                 d3.select("#error").html("Sorry, deze stad bevat geen verstedelijkingdata. Probeer een andere!");
                 console.log("City does not contain atlas-verstedelijking")
            };
        } else {
            d3.select("#error").html("Dit is geen stad. Probeer opnieuw");
            console.log("not a city");
        };
    });
};

function updateVisualization(atlas) {

  // get years
  var years = atlas.features.map(function(pit) {
      var date =  new Date(pit.properties.validSince[0]);
      var year = date.getFullYear();
      return year;
  });
    console.log(years)
  var name = atlas.features[0].properties.name;
  d3.select("#city-label").html(name);

  // get colors
  var yearCount = years.length;
  var color = d3.scale.ordinal()
      .domain(d3.range(years))
      .range(BGBr[yearCount]);
    
  // projection
  var scale = 1500;
  var offset = [innerWidth / 2, innerHeight / 2.1];
  var center = d3.geo.centroid(atlas.features[yearCount-1].geometry);
  var projection = d3.geo.mercator()
      .scale(scale)
      .center(center)
      .translate(offset);

  // create the path//
  var path = d3.geo.path().projection(projection);

  //new projection//
  var bound = path.bounds(atlas.features[0].geometry);
  scale = 1500 / Math.max(
      (bound[1][0] - bound[0][0]) / window.innerWidth,
      (bound[1][1] - bound[0][1]) / window.innerHeight
  );

  offset = [
      innerWidth - (bound[0][0] + bound[1][0])/2,
      innerHeight - (bound[0][1] + bound[1][1])/2
  ];

  // Set new projection
  projection  = d3.geo.mercator()
      .center(center)
      .scale(scale)
      .translate(offset);
  path = path.projection(projection);

  // Draw city features
  d3.select("#map").selectAll("path").remove();

  d3.select("#map").selectAll("path").data(atlas.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("id", function(d){
        var date = new Date(d.properties.validSince[0])
        var year = date.getFullYear();
        return "_"+year;
      })
      .style("fill", "grey")
      .style("stroke", "#3c4044")
      .style("stroke-width", "-1px")
      .style("opacity", 0.1)
      // .style("mix-blend-mode", "hard-light")
      
      .transition()
      .style("opacity", "1")
      .style("stroke", "#3c4044")
      .style("stroke-width", "0.1px")
      .style("fill", function(d) {
          return color(d.properties.validSince[0]);
      })
      //.style("mix-blend-mode", "multiply")
      .ease("linear")
      .delay(function(d, i) {
          return (years.length-i) * 800;
      })
      .duration(300)
      
  // building the legend bar
  var width = 100 / years.length;
  var height = 35;
  var legend = d3.select("#legend");
  legend.selectAll("div").remove();

  legend.selectAll("div")
      .data(years)
      .enter()
      .append("div")
      .attr("class", "rect")
      .attr("id", function(d,i){
        var date = new Date(atlas.features[atlas.features.length - 1 - i].properties.validSince[0]);
        var year = date.getFullYear();
        return "_"+year;
      })
      .style("width", width +"%")
      .style("height", height+"px")
      .style("background-color", function(d, i) {
          return color(atlas.features[atlas.features.length - 1 - i].properties.validSince[0]);
      })
      .style("color", "black")
      .text(function(d, i) {
          var date = new Date(atlas.features[atlas.features.length - 1 - i].properties.validSince[0]);
          var year = date.getFullYear();
          return year;
      })
      .style("text-align","center")
      .style("vertical-align", "bottom")
      .style("line-height", height + "px")
      .style("font-weight", "bold")
      .style("font-size", "18px")
      .style("font-family", "Verdana")
      .style("opacity", 0.9)
      
      .on("mouseover", function(d){
          d3.select(this)
            .style("height", height+30+"px");
          var jaar = d3.select(this).attr("id")
          d3.select('#'+jaar)
            .style("fill", "yellow")
      })
      .on("mouseout", function(d){
          d3.select(this)
            .style("height", height+"px");
          var jaar = d3.select(this).attr("id")
          console.log("path#"+jaar)
          d3.select('#'+jaar)
            .style("fill", function(d) {
          return color(d.properties.validSince[0]);
        });
      })
      
  

}


loadCity("amsterdam");


function repeat(){
  console.log("nog een keer!")
  updateVisualization(atlas);
}
