app.controller('lineCtrl',function($scope,ngDialog,DevicesData,$q,$state,$http){
    $scope.loading=false;
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

    $scope.newWidget = {
        type: "line",
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
            console.log("confirm edit result", result);
            $scope.widget = result.newWidget;
            $scope.widget.title = result.title;
        } );
    };

    // ---------------- New Functions ------------------

    $scope.loadDevices = function() {
        console.log("loading devices");
       $http.get( '/api/devices' )
        .then( function success( response ) {
            console.log("response", response);
            $scope.devicesData = response.data.data;
        }, function error( response ){
            console.log("error in linectrl getdevices", response);
        } );
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
        console.log("measurementType", $scope.measurementType);
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
        console.log("loadHistory", deviceId, startDate, endDate, measurementType, widget);
        var result = [
            ['Date', measurementType]
        ];

        var apiCall = '/api/devices/' + deviceId + '/measurements?before=' + endDate + '&after=' + startDate;
        console.log("apicall", apiCall);

        $http.get( apiCall  )
        .then( function success( response ) {
            console.log("linectrl history success response", response);
            if(response.data.data && response.data.data.length > 0){
                var measurementDatas = response.data.data;
                measurementDatas.forEach(function(measurementData){
                    var dataLine = $scope.getMeasurement(measurementData, measurementType);
                    if(dataLine.length == 2){
                        result.push(dataLine);
                    }

                });
                console.log("result", result);
                widget.chartObject.data = result;
                widget.show = true;
                console.log("widget", widget);

                
            }
            else{
                console.log("data empty");
            }
            
            
        }, function error( response ){
            console.log("error in linectrl loadhistory", response);
        } );

    }

    // Get the right measurement type from a set of measurements with different types
    $scope.getMeasurement = function(measurementData, type){
        var result = [];
        if(measurementData.measurements){
            measurementData.measurements.forEach(function(measurement){
                if(measurement.type == type){
                    var date = new Date(measurementData.timestamp);
                    var dateToShow = date.getDate() + '/' + date.getMonth();
                    result = [dateToShow, measurement.value];
                }
            });
        }        

        return result;
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


    // if($scope.widget.hasOwnProperty('device')){
    //     $scope.refreshFromDevice();
    // }

    // ------------- Watchers ---------------------

    $scope.$watch('widget.device.id', function(OldValue, NewValue){
        if($scope.widget.device){
            console.log("oldvalue", OldValue);
        console.log("NewValue", NewValue);
        $scope.refreshFromDevice();
        }
    });
});
