app.controller('lineCtrl',function($scope, ngDialog, DevicesData, $q){
    $scope.loading=false;
    console.log("$scope.widget at begining of lineCtrl", $scope.widget);
    $scope.widget.isChart = true;
    $scope.widget.type = "line";


    // if (!$scope.widget.hasOwnProperty('chartObject') && !$scope.widget.hasOwnProperty('device')) {
    //     $scope.widget.chartObject = {};
    //     $scope.widget.chartObject.type = "LineChart";
    //     $scope.widget.chartObject.data = [
    //         ['Year', 'Sales', 'Expenses'],
    //         ['2004',  1000,      400],
    //         ['2005',  1170,      460],
    //         ['2006',  660,       1120],
    //         ['2007',  1030,      540]
    //     ];
    //     $scope.widget.chartObject.options = {
    //         title: 'Company Performance',
    //         curveType: 'function',
    //         legend: { position: 'bottom' }
    //     };
    //     $scope.widget.show = true;
    // }

    if (!$scope.widget.hasOwnProperty('chartObject') && !$scope.widget.hasOwnProperty('device')) {
        $scope.widget.chartObject = {
            type: "LineChart",
            data: [],
            options: {
                title: 'Device',
                curveType: 'function',
                legend: { position: 'bottom' }
            }
        };
        $scope.widget.show = true;
    }

    // ---------- Old Functions -------------------

    $scope.loadData=function(){
        console.log("lineCtrl loadData toto");
    };

    $scope.clickToOpen = function () {
        //$scope.devicesData=[];
        ngDialog.openConfirm( {
            template: 'dashboard/modalWidget.pug',
            className: 'ngdialog-theme-default',
            scope:$scope,
            width:'800px'
        } )
        .then( function (result) {
            //console.log("confirm edit result", result);
            $scope.widget = result.newWidget;
            $scope.widget.title = result.title;
        } );
    };

    // ---------------- New Functions ------------------

    $scope.loadDevices = function() {
        var deferred = $q.defer();

        console.log("measurementType", $scope.widget.measurementType);
        DevicesData.getDevicesData().then(function(devices){
            console.log("devices", devices);
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
        console.log("deviceName", deviceId);
        $scope.devicesData.forEach(function(device){
            if(device._id == deviceId){
                $scope.widget.selectedDevice = device;
            }
        });
    }
    // Get measurement object of selected device from its type
    $scope.selectMeasurement = function(measurementType){
        console.log("measurementType", measurementType);
        $scope.loadHistory($scope.widget.deviceId, $scope.widget.startDate, $scope.widget.endDate, measurementType, $scope.widget);
        //console.log("measurementType", $scope.measurementType);
    }

    $scope.getDevice = function(name){
        var deviceReturn = {};

        $scope.devicesData.forEach(function(device){
          if(device.name == name){
            deviceReturn = device;
          }
        });

        return deviceReturn;
    }

    // TODO: better management of widget/newidget
    $scope.loadHistory = function(deviceId, startDate, endDate, measurementType, widget){
        console.log("loadHistory", deviceId, startDate, endDate, measurementType);
        //console.log("loadHistory", deviceId, startDate, endDate, measurementType, widget);
        if(!$scope.widget.deviceId ){
            console
            $scope.widget.deviceId = $scope.widget.device.deviceId;
        }
        var result = [
            ['Date', measurementType]
        ];

        DevicesData.getDeviceData(deviceId, startDate, endDate, measurementType).then(function(measurements){
            console.log("result from devicedata", measurements);
            if(measurements && measurements.length > 0){
                measurements.forEach(function (measurement){
                    result.push(measurement);
                });
            }
            widget.chartObject.data = result;
            widget.show = true;
            //console.log("widget", widget);
        });
    }

    $scope.refreshFromDevice = function(){
        if(!$scope.widget.chartObject){
            $scope.widget.chartObject = {
                type: "LineChart",
                data: {},
                options: {
                    title: $scope.widget.device.title,
                    curveType: 'function',
                    legend: { position: 'bottom' }
                }
            };
        }
        else{
            $scope.widget.chartObject.options.title = $scope.widget.device.title;
        }

        $scope.widget.deviceId = $scope.widget.device.id;
        $scope.widget.startDate = $scope.widget.device.startDate;
        $scope.widget.endDate = $scope.widget.device.endDate;
        $scope.widget.measurementType = $scope.widget.device.measurementType;

        
        $scope.loadHistory($scope.widget.device.id, $scope.widget.device.startDate, $scope.widget.device.endDate, $scope.widget.device.measurementType, $scope.widget);
    }

    // ------------------ Begining -----------------


    $scope.loadDevices();

    // ------------- Watchers ---------------------

    $scope.$watch('widget.device.id', function(OldValue, NewValue){
        if($scope.widget.device){
            //console.log("oldvalue", OldValue);
            console.log("NewValue of device id", NewValue);
            if(!$scope.devicesData){
                $scope.loadDevices()
                .then(function(){
                    $scope.refreshFromDevice();
                })
            }
            else{
                $scope.refreshFromDevice();
            }
        }
    });
});
