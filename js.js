

var cities = [
    "nijmegen"
];

// Ik zou: geojson-bestandjes maken per stad,  
// En dan een paar knoppen/links waarmee je stad kan selecteren!
// En dan als je op zo'n knop drukt, de functie hieronder aanroept voor die stad

function loadCity(city) {
     // laad hier <stad>.geojson in
        d3.json(city + ".geojson", function(json) {
           
            // kleur definities:
        var years = json.features.map(function(feature) { return feature.properties.jaar; });
        var numcolors = years.length      
        var color = d3.scale.ordinal()
            .domain(d3.range(years))
        var kleur = prompt("which color do you want the map to be?").toLowerCase()        
        switch(kleur){
        case "red": 
            color.range(colorbrewer.Reds[numcolors])
            break
        case "blue":        
            color.range(colorbrewer.Blues[numcolors])
        case "purple":
            color.range(colorbrewer.Purples[numcolors])
            break
        case "orange":
            color.range(colorbrewer.Oranges[numcolors])
            break
        case "all":
            color.range(colorbrewer.Spectral[numcolors])
            break
        case "green":
            color.range(colorbrewer.Greens[numcolors])
            break
        case "grey":
            color.range(colorbrewer.Greys[numcolors])
            break
        default:
             color.range(colorbrewer.Dark2[numcolors])
        }
    
        // set city name      
        d3.select("#stad").html(json.features[0].properties.stad);
        
        // set city coordinates
        
        var center = [5.8456, 51.8454];
        var scale  = 300000;

        var projection = d3.geo.mercator()
          .center(center)
          .scale(400000)
          .translate([window.innerWidth / 2, window.innerHeight / 2]);

        var path = d3.geo.path()
        	.projection(projection);


        var svg = d3.select("#map");
        
        //draw city features
        json.features.reverse();
        svg.selectAll("path")
            .data(json.features)
    		.enter()
    	    .append("path")
    		.attr("d", path)
    		.style("fill", function(d) {
            return color(d.properties.jaar)     
    		})
    		.style("stroke", "black")
    		.style("stroke-width", "1.5px");
    
    });   
}
               
loadCity(cities[0]);