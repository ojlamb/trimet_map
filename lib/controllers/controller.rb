require 'sinatra'
require 'httparty'
require 'json'

class Trimet < Sinatra::Base
  use Rack::MethodOverride
  set :views, proc { File.join(root, '..', 'views') }
  enable :sessions
  set :public_folder, 'public'


  get '/' do
    erb :index
  end

 post '/map' do
   p "Hello World"
    @route = params[:name]
    @direction = params[:direction]
    erb :map
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
          },
        }
    end
    return @geojson.to_json
  end

  # start the server if ruby file executed directly
  run! if app_file == $0
end
