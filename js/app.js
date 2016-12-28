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
    this.center = ko.observableArray([data.geometry.location.lat(), data.geometry.location.lng()]);
}

//-----------------------------------------------------------------------------------------------------------------
//      VIEWMODEL
//-----------------------------------------------------------------------------------------------------------------

function createMap() {

    var plano = {
                lat:33.019844,
                lng:-96.698883
            };

    map = new google.maps.Map(document.getElementById('map'), {
    center: plano,
    zoom: 15
    });

    var request = {
                location: plano,
                radius: '1000',
                types: ['restaurant']
              };

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);

    function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for(var i=0; i<results.length; i++){
                // console.log(placesList[i].geometry.location);
                placesList[i] = results[i];
            }
        ko.applyBindings( new ViewModel());
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
    this.query = ko.observable('');
    this.placesArray = ko.observableArray([]);
    this.filteredPlaces = ko.observableArray([]);
    this.map = map;
    placesList.forEach(function(placeItem){
        self.placesArray.push(new Place(placeItem));
    })


    this.createMarkers = function(places) {         // This function creates markers
        self.clearMarkers(markers);                 // for the places passed as an argument
        markers = [];
        for(var i=0; i<places.length; i++){
            markers.push(new google.maps.Marker({
                position: {lat: places[i].center()[0], lng: places[i].center()[1]},
                title: places[i].name()
                })
            );
        }
    }

    this.clearMarkers = function(markers){      // This function clears the markers on the map
        for(var i=0; i<markers.length; i++){
            markers[i].setMap(null);
        }
    }

    this.displayMarkers = function(markers){    // This function displays markers on the map
        for(var i=0; i<markers.length; i++){
            markers[i].setMap(map);
        }
    }

    this.onClickMarker = function(markers){
        for(var i=0; i<markers.length; i++){
            markers[i].addListener('click', (function(marker){
                return function() {
                    if(infowindow){            // Closes any previously opened infoWindow
                        infowindow.close();
                    }
                    infowindow = new google.maps.InfoWindow({
                        content: marker.title
                    });

                    if (marker.getAnimation() == null) {
                        marker.setAnimation(google.maps.Animation.BOUNCE);
                    }
                    else {
                        marker.setAnimation(null);
                    }
                    infowindow.open(map, marker);
                };
            })(markers[i]));
        }
    }

    this.openInfoWindow = function(map, markers){
        infowindow = new google.maps.InfoWindow({
                        content: markers[0].title
                    });
        infowindow.open(map, markers[0]);
    }

    this.createMarkers(this.placesArray());     // Initially, create markers for all locations
    this.displayMarkers(markers);               // Displays markers on the map
    this.onClickMarker(markers);            // Displays infoWindow when clicked on markers

    this.listClick = function(clickedItem){
        self.clearMarkers(markers);
        self.createMarkers([clickedItem]);
        self.displayMarkers(markers);
        self.onClickMarker(markers);
        self.openInfoWindow(map, markers);
    }

    this.filterQuery = function(){
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