app.controller('gaugeCtrl', function($scope, $location, ngDialog, DevicesData, ngNotify, $http, $state) {

    $scope.linkToDetails = true;
    $scope.loading = false;

    if (!$scope.widget) {
        $scope.widget = {};
    }
    $scope.selectedDevice = {};
    $scope.selectedMeasurement = {};

    $scope.widget.filterDevice = '';

    if (!$scope.widget.hasOwnProperty('chartObject')) {
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

        $scope.widget.chartObject.data = [
            ['Label', 'Value'],
            ['Memory', 80],
            ['CPU', 55]
        ];
    }

    $scope.widget.type = "gauge";
    $scope.widget.forceReload = false;
    $scope.widget.isChart = true;
    $scope.widget.chartObject.type = "Gauge";

    $scope.devicesData = [];
    $scope.devices = [];

    $scope.newWidget = {
      type: "gauge",
      isChart: true,
      chartObject: {
        data: [],
        options: {
          width: 400,
          height: 120,
          redFrom: 75,
          redTo: 100,
          yellowFrom: 50,
          yellowTo: 75,
          minorTicks: 5
        }
      }

    };

    console.log("gauge scope widget", $scope.widget);

    $scope.loadData = function() {

        /*$scope.loading=true;

          $scope.widget.chartObject.data = [

                 [ 'Label', 'Value' ],

                 [ $scope.widget.dataPoint.data, $scope.widget.dataPoint.value ]

             ];

          $scope.widget.chartObject.options = $scope.widget.dataPoint.options;

          $scope.loading=false;

          $scope.widget.forceReload===false;*/

    };

    $scope.clickToOpen = function() {
        ngDialog.openConfirm({
            template: 'dashboard/modalWidget.pug',
            className: 'ngdialog-theme-default',
            scope: $scope,
            width: '800px'
        })
        .then(function(res) {
            console.log("modalWidget res", res);
            $scope.widget = res.newWidget;
            $scope.widget.title = res.title;
        });

    };

    $scope.addDataPoint = function(device, data) {
        $scope.widget.dataPoint.idDevice = device.id;
        $scope.widget.dataPoint.data = data.type;
        $scope.widget.dataPoint.value = data.value;
        $scope.widget.dataPoint.name = device.name;

    };

    $scope.removeDatapoint = function() {
        $scope.widget.dataPoint.device = '';
        $scope.widget.dataPoint.data = '';
        $scope.widget.dataPoint.value = '';

    }

    $scope.editDataPoint = function(device, data) {
        console.log('device', device)
        console.log('data', data)
        $scope.widget.dataPoint.device = device.id;
        $scope.widget.dataPoint.data = data;
        $scope.widget.dataPoint.value = device.lastValue[data.replace(/ /g, "")];
        
        Notify.success({
            title: 'Updated',
            message: 'Your chart has been updated'
        });
    };



    $scope.errorHandler = function(error) {
        //simply remove the error, the user never see it
        //google.visualization.errors.removeError(error.id);
    };

    $scope.goToDetails = function() {
        console.log($scope.widget.dataPoint.device);
        if ($scope.linkToDetails)
            $location.path('/devices/' + $scope.widget.dataPoint.device + '/detail');
    };

    $scope.checkIfExist = function(attribute) {
        if (!angular.isUndefined(attribute)) {
            return ' - ';
        }
    };

    $scope.$watch('widget.forceReload', function() {
        if ($scope.widget.forceReload === true) {
            //$scope.loadData();
        }
    });

    $scope.filterDeviceList = function(filter) {
        console.log('relaod', filter)
        if (filter != '') {
            /*$http.get(window.serverUrl+'/api/myDevices/filter/'+filter)
            .then(function(res){
                $scope.devicesData=res.data;
            })*/
        } else {
            $scope.devicesData = [];
        }
    }

    if ($state.params.id) {
        $scope.isForDevice = true;
        $scope.filterDeviceList($state.params.id);
    } else {
        $scope.filterDevice = '';
    }

    /*if($scope.widget.dataPoint.device){
      $http.get(window.serverUrl+'/api/myDevices/getlastvalue/'+$scope.widget.dataPoint.device)
      .then(function(res){
        angular.forEach(res.data.lastValue,function(value){
          if(value.type==$scope.widget.dataPoint.data){
            $scope.widget.dataPoint.value=value.value;
          }
        })
      });
    }*/

    //google.charts.setOnLoadCallback($scope.loadData());

    $scope.loadDevices = function() {
       $http.get( '/api/devices' )
        .then( function success( response ) {
            $scope.devicesData = response.data.data;
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
      $scope.selectedDevice.last.forEach(function(measurement){
          if(measurement.type == measurementType){
            $scope.selectedMeasurement = measurement;
            $scope.newWidget.chartObject.data = [
              ['Label', 'Value'],
              [measurementType, measurement.value]
            ];
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

    $scope.showWidget = function(){
      console.log("scope widget", $scope.newWidget);
    }

    $scope.createWidget = function(){
      $scope.confirm({
        newWidget : $scope.newWidget,
        title : $scope.$parent.$parent.widget.title
      });
    }

    // ------------ Begining ---------------

    $scope.loadDevices();
});