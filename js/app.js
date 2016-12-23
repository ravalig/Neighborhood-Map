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


      function initMap() {
          var map;
          map = new google.maps.Map(document.getElementById('map'), {
          center: placesList[2].center,
          zoom: 3
          });

          for(var i =0; i<placesList.length; i++){
            placesList[i].marker = new google.maps.Marker({
            position: placesList[i].center,
            title: placesList[i].name,
            map: map
            });
          }
      }

//-----------------------------------------------------------------------------------------------------------------
//      VIEWMODEL
//-----------------------------------------------------------------------------------------------------------------

