app.controller('pieCtrl', function($scope, $location, ngDialog, DevicesData, ngNotify, $http, $state, $q) {

    if (!$scope.widget) {
        $scope.widget = {};
    }
    $scope.selectedDevice = {};
    $scope.selectedMeasurement = {};

    if (!$scope.widget.hasOwnProperty('chartObject')) {
        $scope.loading = true;
        $scope.widget.chartObject = {};
        $scope.widget.chartObject.options = {
            legend: { position: 'bottom' }
        };

        $scope.widget.chartObject.data = [];
    }

    $scope.widget.type = "pie";
    $scope.widget.forceReload = false;
    $scope.widget.isChart = true;
    $scope.widget.chartObject.type = "PieChart";

    if($scope.widget.deviceList){
        $scope.tempDeviceList = $scope.widget.deviceList.slice(0);
    }
    else{
        $scope.tempDeviceList = [];
    }

    $scope.loadData = function() {
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

    // Get measurement object of selected device from its type
    $scope.getMeasurement = function(device, measurementType){
        var result = null;
        var found = false;
        device.last.forEach(function(measurement){
            if(measurement.type == measurementType && !found){
                result = measurement;
                found = true;
            }
        });

        return result;
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

    $scope.selectDevice = function(deviceId){
        $scope.devicesData.forEach(function(device){
            if(device._id == deviceId){
                $scope.widget.selectedDevice = device;
            }
        });
    }

    $scope.showWidget = function(){
      console.log("scope widget", $scope.newWidget);
    }

    $scope.addDevice = function(id){
        if($scope.widget.measurementType){
            DevicesData.getDeviceData(id)
            .then(function(result){
                var measurement = $scope.getMeasurement(result, $scope.widget.measurementType);
                if(!$scope.widget.chartObject.data || $scope.widget.chartObject.data.length == 0){
                    $scope.widget.chartObject.data = [['Device', $scope.widget.measurementType]];
                }
                if(measurement != null){
                    $scope.widget.chartObject.data.push([id, measurement.value]);
                    console.log("$scope.widget.chartObject.data", $scope.widget.chartObject.data);
                    $scope.widget.chartObject.options.title = $scope.widget.measurementType;
                    $scope.loading = false;
                }
                    
            });
        }
    }

    $scope.refreshFromDevice = function(){
        if(!$scope.widget.chartObject){
            $scope.widget.chartObject = {
                type: "PieChart",
                data: [],
                options: {
                    legend: { position: 'bottom' }
                }
            };
        }      
        
        if($scope.widget.deviceList && $scope.widget.deviceList.length > 0 ){
            $scope.widget.deviceList.forEach(function(device){
                $scope.addDevice(device.id);
            });
        }
    }

    $scope.apply = function(){
        $scope.widget.deviceList = $scope.tempDeviceList;
        $scope.widget.chartObject.data = [];
        
        console.log("deviceList in apply", $scope.widget.deviceList);
        $scope.widget.deviceList.forEach(function(device){
            $scope.addDevice(device.id);
        });

        $scope.confirm({
            'newWidget' : $scope.widget,
            'title' : $scope.$parent.$parent.widget.title
        });
    }

    $scope.addTempDevice = function(deviceId){
        var device = {id: deviceId}
        $scope.tempDeviceList.push(device);
    }

    $scope.removeDevice = function(device){
        var position = -1;
        for(i=0; i<$scope.tempDeviceList.length; i++){

            if($scope.tempDeviceList[i].id == device.id)
                position = i;
        }

        if(position >= 0){

            $scope.tempDeviceList.splice(position - 1, 1);
        }
        else{
            console.log("device to remove not found");
        }
    }

    // ------------ Begining ---------------

    $scope.loadDevices()
    .then(function(){
        if($scope.widget.chartObject.data.length == 0 && $scope.widget.deviceList){
            $scope.refreshFromDevice();
        }
    })
});