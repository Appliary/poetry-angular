app.controller('mapCtrl',function($scope,DevicesData,ngDialog,olData,$location,$window,$state,$http, $q){
    angular.extend($scope, {
        defaults: {
             events: {
                 map: ['movestart,pointerdrag,moveend']
             }
         }
        });
    $scope.linkToDetails=true;
    if(!$scope.widget)
        $scope.widget={};
    $scope.widget.type="map";
    $scope.widget.forceReload=false;
    $scope.widget.isMap=true;
    if(!$scope.widget.hasOwnProperty('center')){
        $scope.widget.center = {
          lat : 0,
          lon: 0,
           zoom : 5
        };
    }
    $scope.loading = true;
    if(!$scope.widget.hasOwnProperty('dataPoints'))
        $scope.widget.dataPoints=[];

    if(!$scope.widget.hasOwnProperty('chartObject')){
        $scope.widget.chartObject={};
        $scope.widget.chartObject.type='Map';
    }

    if($scope.widget.deviceList){
        $scope.tempDeviceList = $scope.widget.deviceList.slice(0);
    }
    else{
        $scope.tempDeviceList = [];
    }

    $scope.clickToOpen = function() {
        ngDialog.openConfirm({
            template: 'dashboard/modalWidget.pug',
            className: 'ngdialog-theme-default',
            scope:$scope,
            width:'800px'
        })
        .then( function (result) {
            $scope.widget = result.newWidget;
            $scope.widget.title = result.title;
            $scope.calculateCenter();
        });
    };

    $scope.addDataPoint = function(device,positionType){
        var date = new Date(device.timestamp);
        var measurement = $scope.findMeasurement(device, positionType);
        if(measurement != null){
          var lat = parseFloat(measurement.value.lat);
          var lon = parseFloat(measurement.value.lng);
          var message = '<div>' + device.name + '</div>' + '<div>' + date + '</div>';

          $scope.widget.dataPoints.push({
              marker : {
                  lat : lat,
                  lon : lon,
                  label: {
                      message: message,
                      messageLabel : '',
                      show: false,
                      showOnMouseOver: true
                  },
                  type : positionType,
                  onClick: function (event, properties) {
                      $scope.goToDetails(properties.device.id);
                  },
                  device : {
                      id : device._id,
                      name : device.name,
                      timestamp : date
                  }
              }
          });
        }
        else{
          console.log("no positionType found in this measurement");
        }
        
    };

    $scope.calculateCenter=function(){
      if(!$scope.loading){
        olData.getMap().then(function(map){
            var minLon=$scope.widget.dataPoints[0].marker.lon;
            var minLat=$scope.widget.dataPoints[0].marker.lat;
            var maxLon=$scope.widget.dataPoints[0].marker.lon;
            var maxLat=$scope.widget.dataPoints[0].marker.lat;
            angular.forEach($scope.widget.dataPoints,function(dataPoint){
                if(dataPoint.marker.lat>maxLat)
                    maxLat=dataPoint.marker.lat;
                if(dataPoint.marker.lat<minLat)
                    minLat=dataPoint.marker.lat;
                if(dataPoint.marker.lon>maxLon)
                    maxLon=dataPoint.marker.lon;
                if(dataPoint.marker.lon<minLon)
                    minLon=dataPoint.marker.lon;
            });
            if($scope.widget.dataPoints.length===1){
              console.log("calculateCenter 1 dataPoint");
                $scope.widget.center.lat=maxLat;
                $scope.widget.center.lon=maxLon;
                $scope.widget.center.zoom=15;
            }
            else{
              console.log("calculateCenter more than 1 datapoint");
                $scope.widget.center.lat=(maxLat+minLat)/2;
                $scope.widget.center.lon=(maxLon+minLon)/2;
                var extent=[minLon,minLat,maxLon,maxLat];
                var textent = ol.proj.transformExtent(extent, 'EPSG:4326', 'EPSG:3857');
                var zoom=25;
                var z2=25;
                var to =[];
                do{
                    to.push(setTimeout(function(){
                        map.getView().setZoom(z2);
                         if(ol.extent.containsExtent(map.getView().calculateExtent(map.getSize()),textent)===true){
                            $scope.widget.center.zoom=z2;
                            to.forEach(function(t){
                                clearTimeout(t);
                            });
                         }
                         z2--;
                    },(25-z2) * 1000));
                    zoom--;
                }while(zoom >0);
            }
        });
        $scope.widget.forceReload===false;
      }
      
    };

    $scope.goToDetails=function(id){
      console.log("go to detailes", id);
        if($scope.linkToDetails)
            $location.path('/devices/'+id+'/detail');
    };

    // ------------------ New Functions ---------------

    $scope.loadDevices = function() {
        var deferred = $q.defer();

        DevicesData.getDevicesData().then(function(devices){
            $scope.devicesData = devices;
            deferred.resolve(devices);
        });

        return deferred.promise;
    }

    // Select device object from its id
    $scope.selectDevice = function(deviceId){
        $scope.devicesData.forEach(function(device){
            if(device._id == deviceId){
                $scope.widget.selectedDevice = device;
            }
        });
    }

    $scope.filterMeasurement = function(measurement){
      return measurement.type == "position";
    }

    $scope.refreshFromDeviceList = function(){
        var deferred = $q.defer();
        $scope.widget.dataPoints = [];

        if($scope.widget.deviceList){
            var device = $scope.widget.deviceList.length;

            for (i = 0; i < $scope.widget.deviceList.length; i++) { 
                var device = $scope.widget.deviceList[i];
                if(i == $scope.widget.deviceList.length - 1){
                  DevicesData.getDeviceData(device.id)
                  .then(function(deviceData){
                    $scope.addDataPoint(deviceData, device.positionType);
                    setTimeout(function(){
                      deferred.resolve(deviceData);
                    }, 100);
                  })
                }
                else{
                  DevicesData.getDeviceData(device.id)
                  .then(function(deviceData){
                    $scope.addDataPoint(deviceData, device.positionType);
                  })
                }
            }
        }
        $scope.widget.refreshed = true
        return deferred.promise;
    }

    $scope.addTempDevice = function(device, positionType){
        var currentDevice = {
            id: device._id,
            positionType: positionType
        };

        $scope.tempDeviceList.push(currentDevice);
    }

    $scope.removeDevice = function(device){
        var position = -1;
        for(i=0; i<$scope.tempDeviceList.length; i++){

            if($scope.tempDeviceList[i].id == device.id)
                position = i;
        }

        if(position >= 0){

            $scope.tempDeviceList.splice(position, 1);
        }
        else{
            console.log("device to remove not found");
        }
    }

    $scope.apply = function(){

        // TODO
        $scope.widget.deviceList = $scope.tempDeviceList;
        $scope.refreshFromDeviceList()
        .then(function(){
          $scope.confirm({
            'newWidget' : $scope.widget,
            'title' : $scope.$parent.$parent.widget.title
          });
          setTimeout(function(){
            $scope.calculateCenter();
          }, 2000);
          
        })        
    }

    // ------------------ Utils --------------------

    $scope.findMeasurement = function(device, positionType){
      var returnMeasurement = null;
      device.last.forEach(function(measurement){
        if(measurement.id == positionType)
          returnMeasurement = measurement;
      });

      return returnMeasurement;
    }
    
    // ------------------ Watchers -----------------

    $scope.$watch('widget.resize',function(){
      setTimeout(function(){
        if($scope.widget.resize===true){
            olData.getMap().then(function(map){
                map.updateSize();
            });
            $scope.calculateCenter();
            $scope.widget.resize=false;
            console.log("resize widget");
        }
      }, 1000);
      
        
    });

    $scope.$watch('widget.forceReload',function(){
      if($scope.widget.forceReload===true)
        console.log("forceReload");
        $scope.calculateCenter();
    })

    // ------------------ Begining -----------------

    olData.getMap().then(function(map) {
        function disableSave(evt) {
          $scope.disableSave();
        }
        function enableSave(evt) {
        $scope.enableSave();
      }
      map.on('pointerdrag', disableSave);
      map.on('moveend', enableSave);
      map.getView().on('propertychange', function(e) {
          disableSave();
      });

    });

    angular.element($window).on('resize',function(){
      $scope.widget.resize=true;
    });

    $scope.loadDevices()
    .then(function(res){
        if(!$scope.widget.refreshed){
          $scope.refreshFromDeviceList()
          .then(function(){
              $scope.loading = false;
              setTimeout(function(){
                $scope.calculateCenter();
              }, 500);
              
          });
        }
        else{
            $scope.loading = false;
        }
        
    });
});
