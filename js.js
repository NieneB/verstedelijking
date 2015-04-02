
// Ik zou: geojson-bestandjes maken per stad,  
// En dan een paar knoppen/links waarmee je stad kan selecteren!
// En dan als je op zo'n knop drukt, de functie hieronder aanroept voor die stad

var make = ['rgb(84,48,5)','rgb(140,81,10)','rgb(191,129,45)','rgb(223,194,125)','rgb(246,232,195)','rgb(245,245,245)','rgb(199,234,229)','rgb(128,205,193)','rgb(53,151,143)','rgb(1,102,94)','rgb(0,60,48)']


function loadCity(city) {
    
//____ city center coordinates ________ //    
    var center = [5.8456, 51.8454]
    switch(city){
    case "nijmegen":
        center = [5.8456, 51.8454]
        break
    case "amsterdam":
        center = [4.896554, 52.374087]
        break
    case "groningen":
        center = [6.5647519, 53.221705]
        break
    case "denhaag":
        center = [4.3098684, 52.0716543]
        break
    case "breda":
        center = [4.775136, 51.588603]
        break
    default:
        center = [0,0]
    }
        
// ______ load  <city>.geojson _________________//
    
    d3.json(city + ".geojson", function(json) {
        
        
//_______ make color definitions:________________//
        var years = json.features.map(function(feature) { return feature.properties.jaar; });
        var numcolors = years.length     
        var color = d3
            .scale.ordinal()
            .domain(d3.range(years))
            .range(colorbrewer.BrBG[numcolors])
//     var color = prompt("which color do you want the map to be?").toLowerCase()
        // switch(color){
//         case "red":
//             color.range(colorbrewer.Reds[numcolors])
//             break
//         case "blue":
//             color.range(colorbrewer.Blues[numcolors])
//         case "purple":
//             color.range(colorbrewer.Purples[numcolors])
//             break
//         case "orange":
//             color.range(colorbrewer.Oranges[numcolors])
//             break
//         case "all":
//             color.range(colorbrewer.Spectral[numcolors])
//             break
//         case "green":
//             color.range(colorbrewer.Greens[numcolors])
//             break
//         case "grey":
//             color.range(colorbrewer.Greys[numcolors])
//             break
//         default:
//              color.range(colorbrewer.Dark2[numcolors])
//         }
//_______ set city name:________________//
                
        d3.select("#stad").html(json.features[0].properties.stad);

//______ default projection - first guess _________ // 
       // var center =  d3.geo.centroid(json);
        //console.log(center)
       
        var scale = 400000;
        var offset = [ window.innerWidth /1.5 , window.innerHeight /2.5];
        var projection = d3.geo.mercator()
        .scale(scale)
        .center(center)
        .translate(offset)
        
// ______ create the  path __________//
                        
       var path = d3.geo.path()
        .projection(projection);
        
//_______ define better projection _______//
        
        var bound = path.bounds(json)
        var scale = 350000 / Math.max((bound[1][0] - bound[0][0]) / window.innerWidth, (bound[1][1] - bound[0][1]) / window.innerHeight)
        
// _______ make new projection ________ //

        projection  = d3.geo.mercator()
          .center(center)
          .scale(scale)
          .translate(offset);

          path = path.projection(projection);
//________ //draw city features _______ //
               
        var svg = d3.select("#map");


        
        svg.selectAll("path").remove();  
        
        json.features.reverse();
        svg.selectAll("path")
            .data(json.features)
    		.enter()
    	    .append("path")
    		.attr("d", path)
    	
            .style("fill", function(d) {
            return color(d.properties.jaar)     
    		})
            //.style("stroke", "black")
    		.style("stroke-width", "1px");
            
 //----------- // building the legend bar //---------//      
            var width =  100 / years.length
            var height = 50
            var legend = d3.select("#legend");
            legend.selectAll("div").transition()
                 .style("background-color", "red")
              
                 
                 
            legend.selectAll("div").remove()
            
            legend.selectAll("div")
                .data(years)
                .enter()
                .append("div")
                .attr("class", "rect")
                .style("width" , width +"%")
                .style("height" , height+"px")
                .style("background-color", function(c){
                    return color(c)})
                .style("color", "grey")
                .text(function(d){
                    return d
                    console.log(d)
                 })
                 .style("text-align","center")
                 .style("vertical-align" ,"middle")
                 .style("line-height", height +"px")
                 .style("font-weight", "bold")
                 .style("font-size", "18px")
                 .style("font-family","Verdana")
                 
    });   
    
 
}

loadCity('amsterdam')

