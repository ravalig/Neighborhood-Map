//-----------------------------------------------------------------------------------------------------------------
//    MODEL
//-----------------------------------------------------------------------------------------------------------------

var placesList = [
    {
        name: 'Niagara Falls',
        address: 'Newyork',
        center: {
                    lat: 43.092461,
                    lng: -79.047150
                }
    },
    {
        name: 'Honolulu',
        address: 'Hawaii',
        center: {
                    lat: 21.315603,
                    lng: -157.858093
                }
    },
    {
        name: 'Sanfrancisco',
        address: 'California',
        center: {
                    lat:37.7749,
                    lng: -122.4194
                }
    },
    {
        name: 'Yellow Stone National Park',
        address: 'Wyoming',
        center: {
                    lat: 44.4280,
                    lng: -110.5885
                }
    }
]

var infowindow;
var markers = [];
var map;

var Place = function(data){
    this.name =  ko.observable(data.name);
    this.address = ko.observable(data.address);
    this.center = ko.observableArray([data.center.lat, data.center.lng]);
}



//-----------------------------------------------------------------------------------------------------------------
//      VIEWMODEL
//-----------------------------------------------------------------------------------------------------------------


function createMap() {

    map = new google.maps.Map(document.getElementById('map'), {
    center: placesList[2].center,
    zoom: 3
    });

    ko.applyBindings( new ViewModel());

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

    this.displayInfoWindow = function(markers){
        for(var i=0; i<markers.length; i++){
            markers[i].addListener('click', (function(marker){
                return function() {
                    if(infowindow){            // Closes any previously opened infoWindow
                        infowindow.close();
                    }
                    infowindow = new google.maps.InfoWindow({
                        content: marker.title
                    });
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
    this.displayInfoWindow(markers);            // Displays infoWindow when clicked on markers

    this.listClick = function(clickedItem){
        self.clearMarkers(markers);
        self.createMarkers([clickedItem]);
        self.displayMarkers(markers);
        self.displayInfoWindow(markers);
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
    }
}