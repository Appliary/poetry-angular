app.controller('gaugeCtrl', function($scope, $location, ngDialog, DevicesData, ngNotify, $http, $state, $q) {

    if (!$scope.widget) {
        $scope.widget = {};
    }
    $scope.selectedDevice = {};
    $scope.selectedMeasurement = {};

    if (!$scope.widget.hasOwnProperty('chartObject')) {
        $scope.loading = true;
        $scope.widget.chartObject = {};
        $scope.widget.chartObject.options = {
            width: 400,
            height: 120,
            redFrom: 90,
            redTo: 100,
            yellowFrom: 75,
            yellowTo: 90,
            minorTicks: 5
        };

        $scope.widget.chartObject.data = [];
    }

    $scope.widget.type = "gauge";
    $scope.widget.forceReload = false;
    $scope.widget.isChart = true;
    $scope.widget.chartObject.type = "Gauge";

    $scope.devicesData = [];
    $scope.devices = [];

    $scope.loadData = function() {

        //console.log("loadData", $scope.widget);
        // if($scope.widget.deviceList && $scope.widget.deviceList.length > 0 ){
        //     $scope.widget.deviceId = $scope.widget.deviceList[0].id;
        //     $scope.addDevice();
        // }

    };

    $scope.clickToOpen = function() {
        ngDialog.openConfirm({
            template: 'dashboard/modalWidget.pug',
            className: 'ngdialog-theme-default',
            scope: $scope
        })
        .then(function(res) {
            console.log("modalWidget res", res);
            $scope.widget = res.newWidget;
            $scope.widget.title = res.title;
        });

    };


    $scope.loadDevices = function() {
        var deferred = $q.defer();

        DevicesData.getDevicesData().then(function(devices){
            $scope.devicesData = devices;
            deferred.resolve(devices);
            if($scope.widget.deviceId){
                $scope.selectDevice($scope.widget.deviceId);
            }
        });

        return deferred.promise;

    }

    // Get device object from its name
    $scope.selectDevice = function(deviceId){

        var deferred = $q.defer();
        DevicesData.getDeviceData(deviceId)
        .then(function(result){
            $scope.selectedDevice = result;
            deferred.resolve(result);
        });

        return deferred.promise;
    }
    // Get measurement object of selected device from its type
    $scope.selectMeasurement = function(measurementType){
        $scope.selectedDevice.last.forEach(function(measurement){
            if(measurement.type == measurementType){
                $scope.selectedMeasurement = measurement;
                $scope.widget.chartObject.data = [
                    ['Label', 'Value'],
                    [measurementType, measurement.value]
                ];
            }
        });
    }

    $scope.getDevice = function(id){
        var deviceReturn = {};

        $scope.devicesData.forEach(function(device){
          if(device.id == id){
            deviceReturn = device;
          }
        });

        return deviceReturn;
    }

    $scope.showWidget = function(){
      console.log("scope widget", $scope.newWidget);
    }

    $scope.addDevice = function(){
        if($scope.widget.deviceId && $scope.widget.measurementType){
            $scope.selectDevice($scope.widget.deviceId)
            .then(function(result){
                $scope.selectMeasurement($scope.widget.measurementType);
                $scope.widget.device = {
                    id: $scope.widget.deviceId,
                    type: $scope.widget.measurementType,
                    value: $scope.selectedMeasurement.value
                };
                $scope.widget.deviceList = [{
                    id: $scope.widget.deviceId
                }];
                $scope.loading = false;
            });
        }
    }

    $scope.refreshFromDevice = function(){
        if(!$scope.widget.chartObject){
            $scope.widget.chartObject = {
                type: "Gauge",
                data: {},
                options: $scope.widget.options
            };

        }      
        
        if($scope.widget.deviceList && $scope.widget.deviceList.length > 0 ){
            $scope.widget.deviceId = $scope.widget.deviceList[0].id;
            $scope.addDevice();
        }

    }

    // ------------ Begining ---------------

    $scope.loadDevices()
    .then(function(){
        if(!$scope.widget.device && $scope.widget.deviceList){
            $scope.refreshFromDevice();
        }
    })

    // ------------- Watchers --------------

    // $scope.$watch('widget.deviceList', function(OldValue, NewValue){
    //     if($scope.widget.deviceList && $scope.widget.deviceList.length > 0){
    //         //console.log("oldvalue", OldValue);
    //         if(!$scope.devicesData){
    //             $scope.loadDevices()
    //             .then(function(){
    //                 $scope.refreshFromDevice();
    //             })
    //         }
    //         else{
    //             $scope.refreshFromDevice();
    //         }
    //     }
    // });
});