//-----------------------------------------------------------------------------------------------------------------
//    MODEL
//-----------------------------------------------------------------------------------------------------------------
var placesList =[];
var map;
var service;
var infowindow;

//-----------------------------------------------------------------------------------------------------------------
//      VIEWMODEL
//-----------------------------------------------------------------------------------------------------------------

function createMap() {

    /*
        This function creates the Map with center at new york and
        loads the restaurants data from google places .
        This function invokes the ViewModel.
    */
    var NewYork = {
                lat: 40.758896,
                lng:-73.985130
            };

    map = new google.maps.Map(document.getElementById('map'), {
    center: NewYork,
    zoom: 15
    });

    google.maps.event.addDomListener(window, 'resize', function(){
        map.setCenter(NewYork);
        map.setZoom(13);
    });

    var request = {
                location: NewYork,
                radius: '1000',
                types: ['restaurant']
              };

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);

    function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for(var i=0; i<results.length; i++){
                placesList[i] = results[i];
            }
        ko.applyBindings( new ViewModel());
        }
        else {
            $(".error").text("There is an error loading Google Places!!");
        }
    }
}

function googleError() {
    $(".error").text("There is an error loading Google Maps!!");
    return;
}

var ViewModel = function(){

    var self = this;
    this.showList = ko.observable(true);
    this.showFilteredList = ko.observable(false);
    this.showYelp = ko.observable(false);
    this.query = ko.observable('');
    this.locations = ko.observableArray([]);
    this.filteredPlaces = ko.observableArray([]);
    this.error = ko.observable('');

    this.restaurant = ko.observable('');
    this.phone = ko.observable('');
    this.url = ko.observable('');
    this.address = ko.observable('');

    this.createLocations = function(locations){
        for(var i=0; i<10; i++){
            var location = {
                        name: placesList[i].name,
                        place_id : placesList[i].place_id,
                        center:[ placesList[i].geometry.location.lat(),
                                 placesList[i].geometry.location.lng()
                               ],
                        marker: new google.maps.Marker({
                                    position: {
                                                lat: placesList[i].geometry.location.lat(),
                                                lng: placesList[i].geometry.location.lng()
                                              },
                                    title: placesList[i].name})
                    };
            locations.push(location);

            var marker = self.locations()[i].marker;

            marker.addListener('click', (function(marker) {
                return function() {
                    map.setZoom(18);
                    map.setCenter(marker.getPosition());

                    if(infowindow){
                        infowindow.close(); //Closes any previously opened infoWindow
                    }
                    infowindow = new google.maps.InfoWindow({
                        content: marker.title
                    });

                    marker.setAnimation(google.maps.Animation.BOUNCE);
                    setTimeout(function() {
                        marker.setAnimation(null);
                    },2100);

                    infowindow.open(map, marker);

                };
            })(marker));
        }
    }

    this.displayMarkers = function(locations){
        /*
            This function displays markers on the map
        */
        for(var i=0; i<locations.length; i++){
            locations[i].marker.setMap(map);
        }
    }

    this.createLocations(this.locations());
    this.displayMarkers(this.locations());


    this.displayYelpDetails = function(clickedItem){
    /*
        When clicked on a list item, this function
        displays the details of the location taken from yelp
    */
        function nonceGenerate() {
                return (Math.floor(Math.random() * 1e12).toString());
            }

        var yelpUrl = 'https://api.yelp.com/v2/search/?term='+
                        clickedItem.name;

        console.log(clickedItem.name);

        var YELP_KEY = 'jdNHl27QxX5TBIk5SeBOCg',
            YELP_TOKEN = 'ujhYkF8kbD1xqi0zleUgNMfWdGUp_qyx',
            KEY_SECRET ='nnhSjaynt9XZFWYmxiUKZg6sV4M',
            TOKEN_SECRET = 'UyI4vI1POKV4LeAdiSAtPP9V5O8';

        var parameters = {
                oauth_consumer_key: YELP_KEY,
                oauth_token: YELP_TOKEN,
                oauth_nonce: nonceGenerate(),
                oauth_timestamp: Math.floor(Date.now()/1000),
                oauth_signature_method: 'HMAC-SHA1',
                oauth_version: '1.0',
                callback: 'cb',
                term: 'restaurants',
                location: 'newyork',
                limit:1
        };

        var encodedSignature = oauthSignature.generate('GET',yelpUrl, parameters, KEY_SECRET, TOKEN_SECRET);
        parameters.oauth_signature = encodedSignature;

        var settings = {
        url: yelpUrl,
        data: parameters,
        cache: true,                // This is crucial to include as well to prevent jQuery
        dataType: 'jsonp',          //from adding on a cache-buster parameter "_=23489489749837",
        jsonpCallback: 'cb',        //invalidating our oauth-signature
        success: function(results) {
                    console.log(results.businesses[0].name);
                    self.restaurant(results.businesses[0].name);
                    self.url(results.businesses[0].rating_img_url);
                    self.phone(results.businesses[0].display_phone);
                    self.address(results.businesses[0].display_address);
                },
        error: function(error) {
                    self.error("There is an error loading yelp data");
                }
        };
        $.ajax(settings);
    }

    this.listClick = function(clickedItem){
        /*
            When clicked on a list item, this function does the following:
                - Opens the info window and animates the marker
                - Displays the yelp details asociated for that location
        */
        google.maps.event.trigger(clickedItem.marker, 'click');
        self.showYelp(true);
        self.displayYelpDetails(clickedItem);
    }

    this.filterQuery = function(){

        self.filteredPlaces.removeAll();
        for( var i=0; i<self.locations().length; i++){
            if(self.locations()[i].name.toLowerCase().indexOf(self.query()) > -1){
                self.locations()[i].marker.setVisible(true);
                self.filteredPlaces.push(self.locations()[i]);
            }
            else{
                self.locations()[i].marker.setVisible(false);
            }
        }
        self.showList(false);
        self.showFilteredList(true);
    }
}