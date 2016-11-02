app.controller('svgCtrl',function($scope,DevicesData,Notify,ngDialog,$interval,$filter,$state,$http){

  if(!$scope.widget){
    $scope.widget={};
  }
  if(!$scope.widget.color){
    $scope.widget.color={
      main : "#b3b3b3",
      second : "#666666",
      font : "black"
    };
  }

  $scope.widget.type="svg";
  if(!$scope.widget.hasOwnProperty('chartObject')){
      $scope.widget.chartObject={};
  }
  if(!$scope.widget.hasOwnProperty('data'))
    $scope.widget.data={};
  $scope.widget.chartObject.type='Svg';
  $scope.widget.isSVG=true;
  $scope.filterDeviceList=function(filter){
    console.log('reload',filter)
    if(filter!=''){
      $http.get(window.serverUrl+'/api/myDevices/filter/'+filter)
      .then(function(res){
          $scope.devicesData=res.data;
      })
    }else{
      $scope.devicesData=[];
    }
  }
  if($state.params.id){
    $scope.isForDevice=true;
    $scope.filterDeviceList($state.params.id);
  }else{
    if($scope.widget.idDevice){
      $scope.filterDevice=$scope.widget.deviceName;
    }
    else{
      $scope.filterDevice='';
    }

  }
  $scope.clickToOpen = function () {
      if($scope.filterDevice!='')
        $scope.filterDeviceList($scope.filterDevice);
      ngDialog.openConfirm({
              template: 'dashboard/modalWidget.pug',
              className: 'ngdialog-theme-default',
              scope:$scope,
              width:'800px'
          })
          .then( function () {
          });
  };
  $scope.applyData=function(selected,value){
    $scope.widget.data.value=value;
    $scope.widget.idDevice=selected.id;
    $scope.widget.deviceName=selected.name;
    $scope.widget.data.date=$filter('date')(new Date(selected.lastData*1000), 'dd-MM-yyyy');
    $scope.filterDevice=$scope.widget.deviceName;
  };

});
