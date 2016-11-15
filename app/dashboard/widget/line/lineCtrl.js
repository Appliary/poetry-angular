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
            console.log("confirm edit result", result);
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

    $scope.getDevice = function(name){
        var deviceReturn = {};

        $scope.devicesData.forEach(function(device){
          if(device.name == name){
            deviceReturn = device;
          }
        });

        return deviceReturn;
    }

    $scope.getHistory = function(deviceId, startDate, endDate, measurementType){
        var deferred = $q.defer();
        console.log("getHistory", deviceId, startDate, endDate, measurementType);
    
        var result = [
            [ 'date', deviceId]
        ];

        DevicesData.getDeviceData(deviceId, startDate, endDate, measurementType).then(function(measurements){
            console.log("result from devicedata", measurements);
            if(measurements && measurements.length > 0){
                measurements.forEach(function (measurement){
                    result.push(measurement);
                });
            }
            deferred.resolve(result);
        });

        return deferred.promise;
    }


    $scope.refreshFromDevice = function(){
        console.log("widget in refresh", $scope.widget);
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

            $scope.widget.deviceList.forEach(function(device){
                $scope.addDevice(device.id);
            });

        }
        if($scope.widget.chartObject.data.length == 0){
            $scope.widget.deviceList.forEach(function(device){
                $scope.addDevice(device.id, false);
            });
        }

    }

    $scope.addDevice = function(id, newDevice){
        if(id && $scope.widget.measurementType && $scope.widget.startDate && $scope.widget.endDate){
            var currentDevice = {
                id: id,
                color: "blue"
            }
            if(!$scope.widget.deviceList){
                $scope.widget.deviceList = [];
            }
            if(newDevice){
                $scope.widget.deviceList.push(currentDevice);
            }
            
            console.log("currentDevice to add", currentDevice);

            $scope.getHistory(currentDevice.id, $scope.widget.startDate, $scope.widget.endDate, $scope.widget.measurementType)
            .then(function(result){
                if(!$scope.widget.chartObject.data || !$scope.widget.chartObject.data.length){
                    $scope.widget.chartObject.data = [];
                    result.forEach(function(elem){
                        $scope.widget.chartObject.data.push(elem);
                    });
                }
                else{
                    console.log("chartObject", $scope.widget.chartObject);
                    $scope.mergeData($scope.widget.chartObject.data, result);
                }
                console.log("chart data afer merge", $scope.widget.chartObject.data);
            });
        }
        else{
            console.log("all fields not completed");
        }
    }

    $scope.removeDevice = function(device){
        //TODO
    }

    $scope.mergeData = function(resultData, newData){
        newData.forEach(function(elem){
            var dataRow = $scope.getDataRow(resultData, elem[0]);
            if(dataRow.length){
                dataRow.push(elem[1]);
                console.log("key found", elem);
            }
            else{
                console.log("new key or not found");
                //TODO
            }
        });
    }

    $scope.getDataRow = function (data, key){
        var result = [];
        var found = false
        data.forEach(function(elem){
            var date1 = new Date(key).getTime();
            var date2 = new Date(elem[0]).getTime();
            if((key == 'date' && elem[0] == 'date' || date1 == date2) && !found){
                result = elem;
                found = true;
            }
        })

        return result;
    }

    // ------------------ Begining -----------------


    $scope.loadDevices();

    // ------------- Watchers ---------------------

    $scope.$watch('widget.deviceList', function(OldValue, NewValue){
        if($scope.widget.deviceList && $scope.widget.deviceList.length > 0){
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
