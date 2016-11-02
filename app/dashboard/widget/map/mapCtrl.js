app.controller('mapCtrl',function($scope,DevicesData,ngDialog,olData,$location,$window,$state,$http){
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
        $scope.widget.center={lat : 0,lon: 0, zoom : 5};
    }
    if(!$scope.widget.hasOwnProperty('dataPoints'))
        $scope.widget.dataPoints=[];

    if(!$scope.widget.hasOwnProperty('chartObject')){
        $scope.widget.chartObject={};
        $scope.widget.chartObject.type='Map';
    }
    $scope.labelLegende={
      Name : {'legende' : 'Display device\'s name', 'code' : '[name]'},
      Id : {'legende' : 'Display device\'s id', 'code' : '[id]'},
      Type : {'legende' : 'Display data\'s type (antenna / gps)', 'code' : '[type]'},
      Latitude : {'legende' : 'Display device\'s latitude', 'code' : '[lat]'},
      Longitude : {'legende' : 'Display device\'s longitude', 'code' : '[lon]'},
      Day : {'legende' : 'Display data\'s reception day' , 'code' : '[day]'},
      Hour : {'legende' : 'Display data\'s reception hour' , 'code' : '[hour]'},
      Br : {'legende' : 'Breakline' , 'code' : '[br]'}
    };

    $scope.widget.dataPoints.push({
            marker : {
                lat : 0,
                lon : 0,
                label: {
                    message:'',
                    messageLabel : 'messageForLabel',
                    show: false,
                    showOnMouseOver: true
                }
            }
        });

    $scope.clickToOpen = function() {
    ngDialog.openConfirm({
            template: 'dashboard/modalWidget.pug',
            className: 'ngdialog-theme-default',
            scope:$scope,
            width:'800px'
        })
        .then( function () {
            $scope.calculateCenter();
            $scope.decodeLabel();
        });
    };
    $scope.addDataPoint=function(device,data){

        var date = new Date(device.lastData*1000);
        var lat=0;
        var lon=0;
        var messageForLabel="[name][id][br][type][br][day][hour]";
        if(data==='gps'){
            lat=device.lastValue.gps.latitude;
            lon=device.lastValue.gps.longitude;
        }
        else if(data==='antenna'){
            lat=device.position.antenna.latitude;
            lon=device.position.antenna.longitude;
        }

        $scope.widget.dataPoints.push({
            marker : {
                lat : lat,
                lon : lon,
                label: {
                    message:'',
                    messageLabel : messageForLabel,
                    show: false,
                    showOnMouseOver: true
                },
                type : data,
                onClick: function (event, properties) {
                    $scope.goToDetails(properties.device.id);
                },
                device : {
                    id : device.id,
                    name : device.name,
                    timestamp : device.lastData*1000
                }
            }
        });
    };
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
    $scope.calculateCenter=function(){
      console.log("$scope widget center", $scope.widget.center);
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
                $scope.widget.center.lat=maxLat;
                $scope.widget.center.lon=maxLon;
                $scope.widget.center.zoom=5;
            }
            else{
                $scope.widget.center.lat=(maxLat+minLat)/2;
                $scope.widget.center.lon=(maxLon+minLon)/2;
                var extent=[minLon,minLat,maxLon,maxLat];
                var textent = ol.proj.transformExtent(extent, 'EPSG:4326', 'EPSG:3857');
                var zoom=5;
                var z2=5;
                var to =[];
                // do{
                //     to.push(setTimeout(function(){
                //         map.getView().setZoom(z2);
                //          if(ol.extent.containsExtent(map.getView().calculateExtent(map.getSize()),textent)===true){
                //             $scope.widget.center.zoom=z2;
                //             to.forEach(function(t){
                //                 clearTimeout(t);
                //             });
                //          }
                //          z2--;
                //     },(25-z2) * 1000));
                //     zoom--;
                // }while(zoom >0);
                }
        });
        $scope.widget.forceReload===false;
    };
     $scope.removeDatePoint=function(dataPoint){
        $scope.widget.dataPoints.splice($scope.widget.dataPoints.indexOf(dataPoint), 1);
    };

    $scope.goToDetails=function(id){
        if($scope.linkToDetails)
            $location.path('/devices/'+id+'/detail');
    };
    $scope.checkIfExist=function(attribute){
        if(!angular.isUndefined(attribute)){
            return ' - ';
        }
    };
    $scope.isPosition=function(key){
        if(key === 'gps' || key==='antenna' || key==='static')return key;
    };
    $scope.$watch('widget.resize',function(){
        if($scope.widget.resize===true){
            olData.getMap().then(function(map){
                map.updateSize();
            });
            $scope.calculateCenter();
            $scope.widget.resize=false;
        }
    });
    $scope.decodeLabel=function(){
      var assoc={};
      assoc.name={'path' : 'marker.device.name'};
      assoc.id={'path' : 'marker.device.id'};
      assoc.day={};
      assoc.hour={};
      assoc.lat={'path' : 'marker.lat'};
      assoc.lon={'path' : 'marker.lon'};
      assoc.type={'path' : 'marker.type'};
      assoc.br={};
      angular.forEach($scope.widget.dataPoints,function(dataPoint){
        var toDecode=dataPoint.marker.label.messageLabel;
        console.log('todecode',toDecode);
        angular.forEach(assoc,function(value,key){
          var regex = new RegExp("\\[" + key + "\\]", "g");
          if(value.path){
            var val=getVar(dataPoint,value.path);
            toDecode=toDecode.replace(regex, val+' ');
          }
          else{
            if(key=="day"){
              var date = new Date(dataPoint.marker.device.timestamp);
              toDecode=toDecode.replace(regex, date.toLocaleDateString()+' ');
            }
            else if(key=="hour"){
              var date = new Date(dataPoint.marker.device.timestamp);
              toDecode=toDecode.replace(regex, date.toLocaleTimeString()+' ');
            }
            else{
                toDecode=toDecode.replace(regex, '<br>');
            }
          }
        });
        dataPoint.marker.label.message=toDecode;
        console.log('decode',toDecode);


      })
    };
    $scope.filterDeviceList=function(filter){
      console.log('relaod',filter)
      if(filter!=''){
        $http.get(window.serverUrl+'/api/myDevices/filter/'+filter)
        .then(function(res){
            $scope.devicesData=res.data;
        })
      }else{
        $scope.devicesData=[];
      }

    };
    if($state.params.id){
      $scope.isForDevice=true;
      $scope.filterDeviceList($state.params.id);
    }else{
      $scope.filterDevice='';
    }
    function getVar( object, varName ){
        if( varName.indexOf('.')=='-1' )
            return object[ varName ];

        var vars = varName.split( '.' );

        return getVar( object[ vars.shift() ], vars.join( '.' ));

    }
    angular.element($window).on('resize',function(){
      $scope.widget.resize=true;
    });
    $scope.$watch('widget.forceReload',function(){
      if($scope.widget.forceReload===true)
        $scope.calculateCenter();
    })
});
