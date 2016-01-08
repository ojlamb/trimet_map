var map = L.map('map').setView([45.533, -122.657], 12);
L.esri.basemapLayer('DarkGray').addTo(map);
var myLayer = L.geoJson().addTo(map);

var mywms = L.tileLayer.wms("http://localhost:8080/geoserver/tm_routes/wms", {
  layers: 'tm_routes',
  format: 'image/png',
  transparent: true,
  version: '1.1.0',
});

mywms.addTo(map);

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
