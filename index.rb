require 'sinatra'
require 'httparty'
require 'json'

get '/' do
  erb :index
end

get '/locations' do
  url = 'https://developer.trimet.org/ws/v2/vehicles/appID/C0CC51742247874978039EC27'
  response = HTTParty.get(url)
  @data = response.parsed_response
  @geojson = Array.new
  @data["resultSet"]["vehicle"].each do |vehicle|
      @geojson << {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [vehicle["longitude"], vehicle["latitude"]]
        },
        properties: {
          route: vehicle["signMessage"],
          vehicle_type: vehicle["type"],
          next_stop: vehicle["nextLocID"],
          :'marker-color' => '#FE5F55',
          :'marker-symbol' => 'circle',
          :'marker-size' => 'medium'
        },
      }
  end
  return @geojson.to_json
end
