app.directive('measurementSelector', [ '$q', '$http', 'DevicesData', function($q, $http, DevicesData) {
    return {
        restrict: 'E',
        transclude: true,
        scope: { 
            deviceId: '=',
            measurementType: '=',
            smart: '=',
            addMeasurement: '&'
        },
        templateUrl: 'dashboard/directives/measurement-selector.directive.pug',
        link: function( $scope ){

            // ------- Variables ---------
            $scope.searchResults = [];
            $scope.deviceSearch = "";


            // ------- Functions ---------
            $scope.loadDevices = function(smart){
                DevicesData.getDevicesData(smart)
                .then(function(devices){
                    $scope.searchResults = devices;
                    $scope.selectDevice($scope.deviceId);
                });
            }

            $scope.selectDevice = function(deviceId){
                $scope.searchResults.forEach(function(device){
                    if(device._id == deviceId){
                        $scope.selectedDevice = device;
                    }
                });
            }

            // ------- Begining ----------
            $scope.loadDevices($scope.smart);

            $scope.searchDevice = function ( ) {
                console.log("searching devices...")

                DevicesData.searchDevice($scope.deviceSearch, $scope.smart)
                .then(function (devices){
                    $scope.searchResults = devices;
                });

            }

            $scope.$watch( 'deviceSearch', $scope.searchDevice );
        }
    };
}]);