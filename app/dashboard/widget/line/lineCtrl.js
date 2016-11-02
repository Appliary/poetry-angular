app.controller('lineCtrl',function($scope,ngDialog,DevicesData,$q,$state,$http){
    $scope.loading=false;
    $scope.widget.isChart = true;
    $scope.widget.type = "line";

    if (!$scope.widget.hasOwnProperty('chartObject')) {
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

    console.log("line scope widget", $scope.widget);


    // ---------- Functions -------------------

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
        $scope.loadHistory();
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

    $scope.loadHistory = function(){
        var result = [
            ['Date', $scope.measurementType]
        ];
        var beforeDate = new Date($scope.newWidget.endDate);
        var before = beforeDate.getTime();
        var afterDate = new Date($scope.newWidget.startDate);
        var after = afterDate.getTime();
        
        $http.get( '/api/devices/' + $scope.selectedDevice._id + '/measurements?before=' + before + '&after=' + after  )
        .then( function success( response ) {
            console.log("linectrl history success response", response);
            if(response.data.data && response.data.data.length > 0){
                var measurementDatas = response.data.data;
                measurementDatas.forEach(function(measurementData){
                    var dataLine = $scope.getMeasurement(measurementData, $scope.measurementType);
                    if(dataLine.length == 2){
                        result.push(dataLine);
                    }

                });
                console.log("result", result);
                $scope.newWidget.chartObject.data = result;
            }
            else{
                console.log("data empty");
            }
            
            
        }, function error( response ){
            console.log("error in linectrl loadhistory", response);
        } );

    }

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

    // ------------------ Begining -----------------

    $scope.loadDevices();
});
