app.controller( 'map/list.js', function ( $scope, $http, $location, ngDialog , olData) {

    console.log('hello2');
    $scope.markers = [];

    $scope.defaultCenter = {
        "lat" : 50,
        "lon" : 4,
        "zoom" : 3
    };
    $scope.center = {
        "lat" : $scope.defaultCenter.lat,
        "lon" : $scope.defaultCenter.lon,
        "zoom" : $scope.defaultCenter.zoom
    }
    $scope.devicesToDisplay = [];
    $scope.selectedDevices = [];
    $scope.data = [];
    $scope.positionTypes = ['best','gps','antenna','static'];
    $scope.activePositions = [];
    $scope.startDate = new Date();
    $scope.endDate = new Date();
    $scope.marker_style = {
         image: {
             icon: {
                 anchor: [0.5, 1],
                 anchorXUnits: 'fraction',
                 anchorYUnits: 'fraction',
                 opacity: 1,
                 src: 'http://openlayers.org/en/v3.18.2/examples/data/icon.png'
             }
         }
     };


    $http.get( '/api/devices' )
            .then( function success( response ) {
                console.log("api/devices answer : ", response);

                $scope.data = response.data.data
                console.info( 'data :', $scope.data);

                //$scope.columns = Object.keys($scope.data[0]);
                $scope.columns = ["_id", "team", "status", "name", "type", "brand", "model"]

            }, function error( response ) {

                console.warn( 'get devices failed', response );
                $scope.failed = true;

            } );

    // Add elements to markers to display list from a list of devices.
    $scope.createMarkers = function createMarkers(devices){
        devices.forEach(function(device){
            var newMarker = 
            {
                lat : device.last[0].value["lat"],
                lon : device.last[0].value["lng"],
                label: {
                  message:"Marker",
                  show: false,
                  showOnMouseOver: true
                },
                custom_style : $scope.marker_style,
                style : $scope.marker_style
            }
            $scope.markers.push(newMarker);
        });
        console.log("markers", $scope.markers);
    }

    // Add or remove a device from current selected devices.
    $scope.selectDevice = function selectDevice( device) {
        console.log("device selected : ", device);
        var index = $scope.getIndex(device, $scope.selectedDevices);
        console.log("index", index);
        if(index > -1){
            $scope.selectedDevices.splice(index, 1);
            console.log('device already slected');
        }
        else{
            $scope.selectedDevices.push(device);
            console.log('device not slected');
        }
        console.log("devices selected : ", $scope.selectedDevices);
        $scope.refreshMarkers();
    }


    // Utility function, should be in utils.js somewhere...
    $scope.getIndex = function getIndex(device, myArray){
        var index = -1;
        for (var i=0; i < myArray.length; i++) {
            if (myArray[i]._id === device._id) {
                index = i;
            }
        }
        return index;
    }

    $scope.refreshMarkers = function refreshMarkers(){
        $scope.markers = [];
        console.log("refreshMarkers, selecteddevices : ", $scope.selectedDevices.length);
        
        if($scope.selectedDevices.length == 0){
            $scope.center = {
                "lat" : $scope.defaultCenter.lat,
                "lon" : $scope.defaultCenter.lon,
                "zoom" : $scope.defaultCenter.zoom
            }
        }
        else {
            $scope.createMarkers($scope.selectedDevices);
            $scope.calculateCenter();
        }
        
    }

    // Set the center of the map and the zoom to a position where you can see every marker.
    $scope.calculateCenter=function(){
      if($scope.markers.length!==0)
        olData.getMap().then(function(map){
            var minLon = $scope.markers[0].lon;
            var minLat = $scope.markers[0].lat;
            var maxLon = $scope.markers[0].lon;
            var maxLat = $scope.markers[0].lat;

            angular.forEach($scope.markers,function(marker){
                    if(marker.lat>maxLat)
                        maxLat=marker.lat;
                    if(marker.lat<minLat)
                        minLat=marker.lat;
                    if(marker.lon>maxLon)
                        maxLon=marker.lon;
                    if(marker.lon<minLon)
                        minLon=marker.lon;
            });
            if($scope.markers.length===1){
                $scope.center.lat=maxLat;
                $scope.center.lon=maxLon;
                $scope.center.zoom=17;
            }
            else{
                $scope.center.lat=(maxLat+minLat)/2;
                $scope.center.lon=(maxLon+minLon)/2;

                var extent=[minLon,minLat,maxLon,maxLat];
                var textent = ol.proj.transformExtent(extent, 'EPSG:4326', 'EPSG:3857');
                var zoom = 25;
                var z2 = 25;
                var to = [];
                do{
                    to.push(setTimeout(function(){
                        map.getView().setZoom(z2);
                         if(ol.extent.containsExtent(map.getView().calculateExtent(map.getSize()),textent)===true){
                            $scope.center.zoom=z2;
                            to.forEach(function(t){
                                clearTimeout(t);
                            });
                         }
                         z2--;
                    },(25-z2) * 1000));
                    zoom--;
                }while(zoom >0);
            }
        });
    };

    $scope.zoomTo = function zoomTo(marker){

        $scope.center.lat = marker.lat;
        $scope.center.lon = marker.lon;
        $scope.center.zoom = 15;
    }

    $scope.selectType = function selectType(type){
        var index = $scope.activePositions.indexOf(type);
        if(index != -1){
            $scope.activePositions.splice(index, 1);
        }
        else{
            $scope.activePositions.push(type);
        }
        
        console.log("active positions", $scope.activePositions);
    }

    $scope.checkIfActive = function checkIfActive (positionType){
        return $scope.activePositions.indexOf(positionType);
    };

    $scope.loadHistoric = function loadHistoric(device){
        var after = new Date($scope.dateForHistoric).getTime()/1000;
        var before = after+24*60*60;
        angular.forEach($scope.deviceToDisplay,function(device){
            $http.get(window.serverUrl+'/api/myDevices/getPosition/'+device.id+'?after='+after+'&before='+before).then(function(res){
                console.log('resres',res)
                try{
                    res.data[0].color=device.logo.color;
                    res.data[0].path=device.logo.svg.path;
                }
                catch(e){
                    if(res.data.length!==0){
                        res.data[0].color='#007fff';
                        res.data[0].path='ic_assistant_48px.svg';
                    }
                }
                //devicePosHistoric.push(res.data);
            })
        })
    }
});

