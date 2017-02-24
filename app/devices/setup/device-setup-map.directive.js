(function () {
    'use strict';

    app.directive('setupMap', setupMap);

    function setupMap() {
        var directive = {
            replace: true,
            restrict: 'E',
            templateUrl: "devices/setup/device-setup-map.directive.html",
            controller: deviceSetupMapController,
            scope:{
                position: "=",
                edit: "=",
                name: "=",
                toggle: "="
            },
            controllerAs: 'vm',
            bindToController: true
        };

        return directive;
    }

    deviceSetupMapController.$inject = [ '$scope', 'leafletData', 'iconsService' ];

    /* @ngInject */
    function deviceSetupMapController( $scope, leafletData, iconsService ) {


        // ***********************************************************
        //                  DECLARE VARIABLES
        var vm = this;
        var defaultCenter = { lat: 50.850402, lng: 4.354102, zoom: 0 };
        var defaultZoom = 0;
        var mapInitialized = false;
        vm.displayMap = false;
        vm.markers = [];
        vm.center = {};
        // ***********************************************************
        //                  MAPPING FUNCTIONS

        // ***********************************************************
        //                  ACTIVATE
        activate();
        // ***********************************************************
        //                  DECLARE FUNCTIONS
        function activate(){
            setCenter( defaultCenter, defaultZoom );
            $scope.$watchCollection('vm.position', function (newVal, oldVal) {
                if (newVal == oldVal) { return; }
                vm.position = formatPosition( vm.position );
                initMap( vm.position, 10 );
            });
            $scope.$watch('vm.toggle', function (newVal, oldVal) {
                if (newVal == oldVal) { return; }
                console.log('PROC');

                //avoid gray area
                leafletData.getMap( vm.name )
                    .then(function ( map ) {
                        map.invalidateSize();
                        setTimeout( function () {
                            map.invalidateSize();
                        },100 );
                    });


                vm.displayMap = vm.toggle;
                if( vm.displayMap ){
                    setCenter( vm.position, 10 );
                }
            });


            var mapActivated = false;
            $scope.$watch('vm.name', function () {
                if( mapActivated ){
                    return
                }

                mapActivated = true;

                iconsService.getIcon( 'ic_brightness_1_black_36dp.png' )
                    .then(function ( res ) {
                        vm.icon = {
                            iconUrl : "data:image/png;base64," + res.data,
                            iconSize: [16, 16],
                            iconAnchor: [8,32]
                        };
                        initMapIconEvent();
                    });
            });
        }

        function initMapIconEvent() {
            leafletData.getMap( vm.name )
                .then( function(map) {

                    new L.Control.GPlaceAutocomplete({
                        position: "topright",
                        callback: function(location){
                            // object of google place is given
                            var bounds = getLeafletBounds( location );
                            map.fitBounds(bounds);
                        }
                    }).addTo( map );


                    if( vm.edit ){
                        map.on("click", function(event){
                            var position = event.latlng;
                            vm.position = formatPosition( position );
                            createMarker( vm.position );
                            setCenter( vm.position );
                        });
                    }
                });
        }

        function getLeafletBounds( googlePlaces ) {
            var viewPort = googlePlaces.geometry.viewport;
            var gPlacesBounds = {
                NE: {},
                SW: {}
            };
            gPlacesBounds.NE.lat = viewPort.f.b;
            gPlacesBounds.NE.lng = viewPort.b.f;
            gPlacesBounds.SW.lat = viewPort.f.f;
            gPlacesBounds.SW.lng = viewPort.b.b;

            //Return default bounds
            var southWest = new L.LatLng(gPlacesBounds.SW.lat, gPlacesBounds.SW.lng);
            var northEast = new L.LatLng(gPlacesBounds.NE.lat, gPlacesBounds.NE.lng);
            return new L.LatLngBounds(southWest, northEast);
        }

        function initMap( position ) {
            if( !position || typeof position.lat != 'number' || typeof position.lng != 'number' ){
                resetMap();
                return;
            }
            mapInitialized ? setCenter(position) : setCenter(position, 10);
            createMarker(position);
            mapInitialized = true;
        }

        function resetMap () {
            vm.markers = [];
            setCenter( defaultCenter, defaultZoom )
        }

        function setCenter( position, zoom ) {
            if( position && typeof position.lat == 'number' && typeof position.lng == 'number' ){
                if( !zoom ){
                    leafletData.getMap( vm.name ).then( function(map) {
                        vm.center = {
                            lat: position.lat,
                            lng: position.lng,
                            zoom: map.getZoom()
                        };
                    });
                }else{
                    vm.center = {
                        lat: position.lat,
                        lng: position.lng,
                        zoom: zoom
                    };
                }
            }
        }

        function formatPosition (position) {
            if( position && position.lat[position.lat.length - 1] != "." && position.lng[position.lng.length - 1] != "." ){
                return {
                    lat: parseFloat(position.lat),
                    lng: parseFloat(position.lng)
                }
            }
            return position;
        }

        function createMarker( position ) {
            vm.markers= [{
                lat: position.lat,
                lng: position.lng,
                icon: vm.icon
            }];
        }
    }
})();

