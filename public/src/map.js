var map = L.map('map').setView([45.533, -122.657], 12);
var layer = L.esri.basemapLayer('DarkGray').addTo(map);
var myLayer = L.geoJson().addTo(map);
var bufferLayer = L.geoJson().addTo(map);
var userLocation;

/* Get bus route poly lines"*/
var mywms = L.tileLayer.wms("http://localhost:8080/geoserver/tm_routes/wms", {
  layers: 'tm_routes',
  format: 'image/png',
  transparent: true,
  version: '1.1.0',
});
mywms.addTo(map);

/*Locate user and add a point"*/
function myFunction(data) {
  map.setView([data.latitude, data.longitude], 16)
  var latlng = L.latLng(data.latitude, data.longitude);
  var marker = L.marker(latlng).addTo(map);
  userLocation = turf.point([data.latlng.lng, data.latlng.lat]);
  /* Set a buffer around user */
  var unit = 'miles';
  var buffered = turf.buffer(userLocation, .5, unit);
  var result = turf.featurecollection([buffered.features, userLocation]);
  bufferLayer.addData(buffered);
  checkBus(myLayer, result.features[0][0]);

}
map.locate();
map.on('locationfound', myFunction);

checkBus = function(pt,poly){
  console.log(pt,poly)
    var isBusClose = turf.inside(pt, poly);
  };




/*Load trimet bus geojson every 5 seconds */
setInterval(function() {
  $.ajax({
    dataType: 'text',
    url: '/locations',
    success: function(data) {
      var geojson;
      geojson = $.parseJSON(data);
      myLayer.clearLayers()
      myLayer.addData(geojson);
    }
  });
}, 5000);

myLayer.on('layeradd', function(e) {
  var busIcon = L.icon({
    iconUrl: "images/bus2.png",
    iconSize: [20, 20],
    iconAnchor: [8, 8],
    popupAnchor: [0, 0]
  });
  var marker, popupContent, properties;
  marker = e.layer;
  feature = marker.feature;
  marker.setIcon(busIcon);
  properties = marker.feature.properties;
  popupContent =  '<div class="popup"><h3>'+ properties.route+ '</h3>'+
               '<p><strong>Next Stop:</strong> ' + properties.next_stop + '</p>' +
               '<p><strong>Type:</strong> ' + properties.vehicle_type + '</p>' +
               '</div>'
  return marker.bindPopup(popupContent, {
    closeButton: false,
    minWidth: 250
  });
});

myLayer.on('click', function(e) {
  map.panTo(e.layer.getLatLng());
});

/*Change basemap to whatever*/
function setBasemap(basemap) {
  if (layer) {
    map.removeLayer(layer);
  }
  layer = L.esri.basemapLayer(basemap);
  map.addLayer(layer);
  if (layerLabels) {
    map.removeLayer(layerLabels);
  }

  if (basemap === 'ShadedRelief' || basemap === 'Oceans' || basemap === 'Gray' || basemap === 'DarkGray' || basemap === 'Imagery' || basemap === 'Terrain') {

    layerLabels = L.esri.basemapLayer(basemap + 'Labels');
    map.addLayer(layerLabels);
  }
}

var basemaps = document.getElementById('basemaps');

basemaps.addEventListener('change', function(){
  setBasemap(basemaps.value);
});
