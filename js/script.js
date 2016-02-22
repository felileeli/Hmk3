// This script demonstrates some simple things one can do with leaflet.js


var map = L.map('map').setView([40.71,-73.93], 11);

// set a tile layer to be CartoDB tiles 
var CartoDBTiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',{
  attribution: 'Map Data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> Contributors, Map Tiles &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
});

// add these tiles to our map
map.addLayer(CartoDBTiles);

// add in OSM Mapnik tiles
var OSMMapnikTiles = L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',{
  attribution: 'Map Data and Tiles &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> Contributors'
});
// do not add to the map just yet, but add varible to the layer switcher control 

// add in MapQuest Open Aerial layer
var MapQuestAerialTiles = L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png',{
  attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">'
});


// create global variables we can use for layer controls
var wifihotspotGeoJSon;
var neighborhoodsGeoJSON;


// start the chain reaction by running the addSubwayLines function
addWifihotspotData();

// use jQuery get geoJSON to grab geoJson layer, parse it, then plot it on the map
// because of the asynchronous nature of Javascript, we'll wrap each "getJSON" call in a function, and then call each one in turn. This ensures our layer will work  

function addWifihotspotData() {
    // let's add pawn shops data
    $.getJSON( "geojson/NYC Wi-Fi Hotspot Locations.geojson", function( data ) {
        // ensure jQuery has pulled all data out of the geojson file
        var wifihotspot = data;

        // pawn shop dots
        var wifihotpotspotPointToLayer = function (Feature, latlng){
            var wifihotspotMarker= L.circle(latlng, 100, {
                stroke: false,
                fillColor: '#2ca25f',
                fillOpacity: 0.5
            });
            
            return wifihotspotMarker;  
        }

        var WifihotspotClick = function (Feature, layer) {

            // let's bind some feature properties to a pop up
            layer.bindPopup("<strong>Name:</strong> " + feature.properties.name+ "<br/><strong>Location:</strong>" + feature.properties.location + "<br/><strong>Provider</strong>" + feature.properties.provider);
        }

        // create Leaflet layer using L.geojson; don't add to the map just yet
        wifihotspotGeoJSON = L.geoJson(wifihotspot, {
            pointToLayer: wifihotspotPointToLayer,
            onEachFeature: wifihotspotClick
        });

        // don't add the pawn shop layer to the map yet

        // run our next function to bring in the Pawn Shop data
        addNeighborhoodData();

    });

}

function addNeighborhoodData() {

    // let's add neighborhood data
    $.getJSON( "geojson/NYC_neighborhood_data.geojson", function( data ) {
        var neighborhoods = data;
        var povertyStyle = function (feature){
            var value = feature.properties.PovertyPer;
            var style = {
                weight: 1,
                opacity: .1,
                color: 'white',
                fillOpacity: 0.75,
                stroke: "#aeaeae",
            };

            return style;
        }

        var povertyClick = function (feature, layer) {
            var percent = feature.properties.PovertyPer * 100;
            percent = percent.toFixed(0);
            // let's bind some feature properties to a pop up
            layer.bindPopup("<strong>Neighborhood:</strong> " + feature.properties.NYC_NEIG);
        }

        // create Leaflet layer using L.geojson; don't add to the map just yet
        neighborhoodsGeoJSON = L.geoJson(neighborhoods, {
            style: povertyStyle,
            onEachFeature: povertyMouseover
        });

        // now lets add the data to the map in the order that we want it to appear

        // neighborhoods on the bottom
        neighborhoodsGeoJSON.addTo(map);
        wifihotspotGeoJSON.addTo(map);
       
        // now create the layer controls!
        createLayerControls(); 

    });

}

function createLayerControls(){

    // add in layer controls
    var baseMaps = {
        "CartoDB": CartoDBTiles,
        "OSM Mapnik": OSMMapnikTiles,
        "Mapquest Aerial": MapQuestAerialTiles
    };

    var overlayMaps = {
        "Povery Map": neighborhoodsGeoJSON,
        "wifihotspot": wifihotspotGeoJSON
    };

    // add control
    L.control.layers(baseMaps, overlayMaps).addTo(map);

}
