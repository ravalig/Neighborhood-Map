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
                },
        marker: {}
    },
    {
        name: 'Honolulu',
        address: 'Hawaii',
        center: {
                    lat: 21.315603,
                    lng: -157.858093
                },
        marker: {}
    },
    {
        name: 'Sanfrancisco',
        address: 'California',
        center: {
                    lat:37.7749,
                    lng: -122.4194
                },
        marker: {}
    },
    {
        name: 'Yellow Stone National Park',
        address: 'Wyoming',
        center: {
                    lat: 44.4280,
                    lng: -110.5885
                },
        marker: {}
    }
]

var infowindow;

var Place = function(data){
    this.name =  ko.observable(data.name);
    this.address = ko.observable(data.address);
    this.center = ko.observableArray([data.center.lat, data.center.lng]);
}



//-----------------------------------------------------------------------------------------------------------------
//      VIEWMODEL
//-----------------------------------------------------------------------------------------------------------------

var ViewModel = function(map){

    var self = this;
    this.placesArray = ko.observableArray([]);
    this.map = map;
    placesList.forEach(function(placeItem){
        self.placesArray.push(new Place(placeItem));
    })


    this.createMarkers = function() {
        for(var i =0; i<placesList.length; i++){

            placesList[i].marker = new google.maps.Marker({
            position: placesList[i].center,
            title: placesList[i].name
            });
        }
    }

    this.displayMarkers = function(map) {

        for(var i =0; i<placesList.length; i++){
            placesList[i].marker.setMap(null);
        }

        for(var i =0; i<placesList.length; i++){
            placesList[i].marker.setMap(map);
        }
    }

    this.displayInfoWindow = function(map){
        for(var i =0; i<placesList.length; i++){
            placesList[i].marker.addListener('click', (function(placesList) {
                return function() {

                    var contentString = '<h5>'+placesList.name+'</h5>'+
                    '<h6>'+placesList.address+'</h6>';

                    if(infowindow){            // Closes any previously opened infoWindow
                        infowindow.close();
                    }
                    infowindow = new google.maps.InfoWindow({
                        content: contentString
                    });
                    infowindow.open(map, placesList.marker);

                };
            })(placesList[i]));
        }
    }


    this.createMarkers();
    this.displayMarkers(this.map);
    this.displayInfoWindow(this.map);
}


function createMap() {
    var map;
    map = new google.maps.Map(document.getElementById('map'), {
    center: placesList[2].center,
    zoom: 3
    });

    ko.applyBindings( new ViewModel(map));

}




