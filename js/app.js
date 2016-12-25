//-----------------------------------------------------------------------------------------------------------------
//    MODEL
//-----------------------------------------------------------------------------------------------------------------

placesList = [
    {
        name: 'Niagara Falls',
        address: 'New Jersey',
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

var Place = function(data){
    this.name =  ko.observable(data.name);
    this.address = ko.observable(data.address);
    this.center = ko.observableArray([data.center.lat, data.center.lng]);
    // this.marker = ko.observable(data.marker);

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

    createMarkers(this.map);
}


function createMap() {
    var map;
    map = new google.maps.Map(document.getElementById('map'), {
    center: placesList[2].center,
    zoom: 3
    });

    ko.applyBindings( new ViewModel(map));

}

function createMarkers(map) {
    for(var i =0; i<placesList.length; i++){
        placesList[i].marker = new google.maps.Marker({
        position: placesList[i].center,
        title: placesList[i].name,
        map: map
        });
    }
}

