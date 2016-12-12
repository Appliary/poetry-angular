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
            $scope.devicesData = [];


            // ------- Functions ---------
            $scope.loadDevices = function(smart){
                DevicesData.getDevicesData(smart)
                .then(function(devices){
                    $scope.devicesData = devices;
                    $scope.selectDevice($scope.deviceId);
                });
            }

            $scope.selectDevice = function(deviceId){
                $scope.devicesData.forEach(function(device){
                    if(device._id == deviceId){
                        $scope.selectedDevice = device;
                    }
                });
            }

            // ------- Begining ----------
            $scope.loadDevices($scope.smart);
        }
    };
}]);