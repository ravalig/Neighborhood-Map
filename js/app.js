//-----------------------------------------------------------------------------------------------------------------
//    MODEL
//-----------------------------------------------------------------------------------------------------------------
var placesList =[];
var markers = [];
var map;
var service;
var infowindow;

var Place = function(data){
    this.name =  ko.observable(data.name);
    this.place_id = ko.observable(data.place_id);
    this.center = ko.observableArray([data.geometry.location.lat(),
                                      data.geometry.location.lng()]);
}

this.error = ko.observable('');

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
    this.error("There is an error loading Google Maps!!");
    return;
}


var ViewModel = function(){

    var self = this;
    this.showList = ko.observable(true);
    this.showFilteredList = ko.observable(false);
    this.showYelp = ko.observable(false);
    this.query = ko.observable('');
    this.placesArray = ko.observableArray([]);
    this.filteredPlaces = ko.observableArray([]);
    this.yelpContent = ko.observable('');
    this.map = map;

    for(var i=0; i<10; i++){
        self.placesArray.push(new Place(placesList[i]));
    }


    this.createMarkers = function(places) {
        /*
            This function creates markers for the places passed as an argument
        */
        self.clearMarkers(markers);
        markers = [];
        for(var i=0; i<places.length; i++){
            var mark = {value:  new google.maps.Marker({
                                    position: {lat: places[i].center()[0],
                                    lng: places[i].center()[1]},
                                    title: places[i].name()}),
                place_id:places[i].place_id()
            };
            markers.push(mark);
        }
    }

    this.clearMarkers = function(markers){
        /*
            This function clears the markers on the map
        */
        for(var i=0; i<markers.length; i++){
            markers[i].value.setMap(null);
        }
    }

    this.displayMarkers = function(markers){
    /*
        This function displays markers on the map
    */
        for(var i=0; i<markers.length; i++){
            markers[i].value.setMap(map);
        }
    }

    this.onClickMarker = function(markers){
    /*
        When clicked on a marker, this function opens the infowindow
        and animates the marker
    */
        for(var i=0; i<markers.length; i++){
            markers[i].value.addListener('click', (function(marker){
                return function() {
                    if(infowindow){
                        infowindow.close(); //Closes any previously opened infoWindow
                    }
                    infowindow = new google.maps.InfoWindow({
                        content: marker.value.title
                    });

                    // if (marker.value.getAnimation() == null) {
                    //     marker.value.setAnimation(google.maps.Animation.BOUNCE);
                    // }
                    // else {
                    //     marker.value.setAnimation(null);
                    // }

                    marker.value.setAnimation(google.maps.Animation.BOUNCE);

                    infowindow.open(map, marker.value);
                };
            })(markers[i]));
        }
    }

    this.openInfoWindow = function(map, markers){
        infowindow = new google.maps.InfoWindow({
                        content: markers[0].value.title
                    });
        infowindow.open(map, markers[0].value);
        if (markers[0].value.getAnimation() == null) {
            markers[0].value.setAnimation(google.maps.Animation.BOUNCE);
        }
        else {
            markers[0].value.setAnimation(null);
        }
    }

    this.createMarkers(this.placesArray());     // Initially, create markers for all locations
    this.displayMarkers(markers);               // Displays markers on the map
    this.onClickMarker(markers);            // Displays infoWindow when clicked on markers

    this.displayYelpDetails = function(clickedItem){
    /*
        When clicked on a list item, this function
        displays the details of the location taken from yelp
    */
        function nonceGenerate() {
                return (Math.floor(Math.random() * 1e12).toString());
            }

        var yelpUrl = 'https://api.yelp.com/v2/search/?term='+
                        clickedItem.name();

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
                    self.showYelp(true);
                    $('.yelp').text("");
                    console.log(results.businesses[0].review_count);
                    var temp;
                    temp =  '<h4>'+results.businesses[0].name+'</h4>'+
                            '<div>'+
                                '<img '+'src='+results.businesses[0].rating_img_url+'>'+'<br>'+
                                'Phone:  ' + results.businesses[0].display_phone+'<br>'+
                                 results.businesses[0].location.display_address+'<br>'+
                                '</div>'+
                            '<img class="yelpImg" src="img/yelp.png">';
                    $('.yelp').append(temp);
                },
        error: function(error) {
                    this.error("There is an error loading yelp data");
                }
        };
        $.ajax(settings);
    }


    this.listClick = function(clickedItem){
    /*
        When clicked on a list item, this function does the following:
            - Clears previous markers on the map
            - Creates a marker for the list item
            - Displays the marker on the map
            - Opens the info window and animates the marker
            - Displays the yelp details asociated for that location
    */
        self.clearMarkers(markers);
        self.createMarkers([clickedItem]);
        self.displayMarkers(markers);
        self.onClickMarker(markers);
        self.openInfoWindow(map, markers);
        self.displayYelpDetails(clickedItem);
    }

    this.filterQuery = function(){
    /*
        When user inputs value to filter, this function does the following:
            - Displays the location items that contains the entered input
            - clears previous markers on the map
            - creates markers  for the filtered items
            - displays markers on the map
            - Opens the info window
            - When clicked on the marker animates the marker
    */
        self.filteredPlaces.removeAll();
        for( var i=0; i<self.placesArray().length; i++){
            if(self.placesArray()[i].name().toLowerCase().indexOf(self.query()) > -1){
                self.filteredPlaces.push(self.placesArray()[i]);
            }
        }
        self.showList(false);
        self.showFilteredList(true);
        self.clearMarkers(markers);
        self.createMarkers(self.filteredPlaces());
        self.displayMarkers(markers);
        self.onClickMarker(markers);
    }
}