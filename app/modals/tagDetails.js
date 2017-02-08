app.controller( 'modals/tagDetails', function ( $scope, $http, $window, $location, ngDialog ) {

    $scope.devices = {};

    $scope.ngDialogData.devices.forEach(function (device){
        if(device.last){
            device.last.forEach(function (measurement){
                if(measurement.type == $scope.ngDialogData.type && measurement.id == $scope.ngDialogData.id)
                {
                    $scope.devices[device._id] = {
                        name: device.name,
                        value: measurement.value,
                        unit: measurement.unit
                    };
                }
            });
        }
    });
} );
