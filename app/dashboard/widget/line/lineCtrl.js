app.controller('lineCtrl',function($scope, ngDialog, DevicesData){
    $scope.loading=false;
    console.log("$scope.widget at begining of lineCtrl", $scope.widget);
    $scope.widget.isChart = true;
    $scope.widget.type = "line";

    if (!$scope.widget.hasOwnProperty('chartObject') && !$scope.widget.hasOwnProperty('device')) {
        $scope.widget.chartObject = {};
        $scope.widget.chartObject.type = "LineChart";
        $scope.widget.chartObject.data = [
            ['Year', 'Sales', 'Expenses'],
            ['2004',  1000,      400],
            ['2005',  1170,      460],
            ['2006',  660,       1120],
            ['2007',  1030,      540]
        ];
        $scope.widget.chartObject.options = {
            title: 'Company Performance',
            curveType: 'function',
            legend: { position: 'bottom' }
        };
        $scope.widget.show = true;
    }

    if(!$scope.newWidget){
        $scope.newWidget = {
            type: "line",
            deviceId: "",
            controller: "lineCtrl",
            startDate: Date.now(),
            endDate: Date.now(),
            isChart: true,
            chartObject: {
                type: "LineChart",
                data: [],
                options: {
                    title: 'Device',
                    curveType: 'function',
                    legend: { position: 'bottom' }
                }
            }

        };
    }
    else{
        console.log("old newWidget", $scope.newWidget);
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
        DevicesData.getDevicesData().then(function(devices){
            $scope.devicesData = devices;
        });
    }

    // Get device object from its name
    $scope.selectDevice = function(deviceName){
      $scope.devicesData.forEach(function(device){
          if(device.name == deviceName){
            $scope.selectedDevice = device;
          }
        });
    }
    // Get measurement object of selected device from its type
    $scope.selectMeasurement = function(measurementType){
        $scope.loadHistory($scope.selectedDevice._id, $scope.newWidget.startDate, $scope.newWidget.endDate, $scope.measurementType, $scope.newWidget);
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
        //console.log("loadHistory", deviceId, startDate, endDate, measurementType, widget);
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
        
        $scope.loadHistory($scope.widget.device.id, $scope.widget.device.startDate, $scope.widget.device.endDate, $scope.widget.device.measurementType, $scope.widget);
    }

    // ------------------ Begining -----------------


    $scope.loadDevices();

    // ------------- Watchers ---------------------

    $scope.$watch('widget.device.id', function(OldValue, NewValue){
        if($scope.widget.device){
            //console.log("oldvalue", OldValue);
            console.log("NewValue of device id", NewValue);
            $scope.refreshFromDevice();
        }
    });
});
