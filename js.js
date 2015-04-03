
// Ik zou: geojson-bestandjes maken per stad,  
// En dan een paar knoppen/links waarmee je stad kan selecteren!
// En dan als je op zo'n knop drukt, de functie hieronder aanroept voor die stad
loadCity('amsterdam');
function loadCity(city) {
    // city center coordinates //    
    var center = [0, 0];
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
        case "rotterdam":
            center = [4.4904063, 51.9279723]
            break
        case "denbosch":
            center = [5.3181784, 51.7148187]
            break
        case "rotterdam":
            center = [4.4904063, 51.9279723]
            break
        default:
            center = [0,0]
    }; 
    // Load  <city>.geojson //
    d3.json(city + ".geojson", function(json){
        // set city name:_//
        d3.select("#stad").html(json.features[0].properties.stad);
        
     
        
        //make color definitions://
        var years = json.features.map(function(feature) { return feature.properties.jaar; });
        console.log(years)
        var numcolors = years.length;
        var color = d3
            .scale.ordinal()
            .domain(d3.range(years))
            .range(colorbrewer.BrBG[numcolors]);
        
        json.features.reverse();
        // projection//
        var scale = 400000;
        var offset = [ window.innerWidth /1.5 , window.innerHeight /2.5];
        var projection = d3.geo.mercator()
            .scale(scale)
            .center(center)
            .translate(offset);

        // create the  path//
        var path = d3.geo.path()
            .projection(projection);

        //new projection//
        var bound = path.bounds(json);
        var scale = 350000 / Math.max((bound[1][0] - bound[0][0]) / window.innerWidth, (bound[1][1] - bound[0][1]) / window.innerHeight);

        //set new projection //
        projection  = d3.geo.mercator()
            .center(center)
            .scale(scale)
            .translate(offset);
        path = path.projection(projection);
        
        ///draw city features//
        var svg = d3.select("#map");
        svg.selectAll("path").remove();  
        
        svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("fill", "grey")
            .style("stroke", "#3c4044")
            .style("stroke-width", "1px")
            .style("opacity", "0.1")
            .transition()
            .style("opacity", "1")
            .style("fill", function(d) {
                return color(d.properties.jaar)     
                })
            .style("stroke", "none")
            .ease("linear")
            .delay(function(d,i){
                return (years.length-i) * 400
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
            .style("background-color", function(c){
                return color(c)
            })
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
};




