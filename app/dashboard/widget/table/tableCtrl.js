app.controller('tableCtrl',function($scope,DevicesData,ngDialog,$q,$http,$state){

    $scope.widget.forceReload=false;
    $scope.widget.isChart=true;
    if(!$scope.widget.hasOwnProperty('chartObject')){
        $scope.widget.chartObject = {};
        $scope.widget.chartObject.type = "Table";
        $scope.widget.chartObject.data = [
          ['Name',  "Salary", 'FullTime employee'],
          ['Mike',  {v: 10000, f: '$10,000'}, true],
          ['Jim',   {v:8000,   f: '$8,000'},  false],
          ['Alice', {v: 12500, f: '$12,500'}, true],
          ['Bob',   {v: 7000,  f: '$7,000'},  true]
        ]
    }
        


    // ------------------ Functions -------------------

    $scope.loadData=function(){
        // $scope.loadDeviceLastValue().then(function(res){
        //   console.log('res',$scope.widget.toDisplay)
        //   $scope.widget.legendes=['Device'];
        //   $scope.widget.chartObject.data = [];
        //   // Add columns
        //   for(i=0;i<$scope.widget.toDisplay.length;i++){
        //       for(j=0;j<$scope.widget.toDisplay[i].datas.length;j++){
        //           if($scope.widget.legendes.indexOf($scope.widget.toDisplay[i].datas[j])===-1){
        //               $scope.widget.legendes.push($scope.widget.toDisplay[i].datas[j]);
        //           }
        //       }
        //   }
        //   $scope.widget.chartObject.data.push($scope.widget.legendes);
        //   for(i=0;i<$scope.widget.toDisplay.length;i++){
        //       var line=[];
        //       line.push($scope.widget.toDisplay[i].idDevice);
        //       for(j=1;j<$scope.widget.legendes.length;j++){
        //           try{
        //             var attribute=$scope.widget.toDisplay[i].lastValue[findIndexOfData($scope.widget.toDisplay[i].lastValue,$scope.widget.legendes[j])];
        //             line.push(attribute.value + ' '+attribute.unit);
        //           }
        //           catch(e){
        //             line.push('');
        //           }

        //       }
        //       $scope.widget.chartObject.data.push(line);
        //   }
        // })
        // $scope.widget.forceReload===false;
    };
    function findIndexOfData(object,toFind){
      var index=null;
      angular.forEach(object,function(attribute,key){
        if(attribute.type==toFind){
          index=key;
        }
      })
      return index;
    }
    $scope.clickToOpen = function () {
    ngDialog.openConfirm( {
            template: 'dashboard/modalWidget.pug',
            className: 'ngdialog-theme-default',
            scope:$scope,
            width:'800px'
        } )
        .then( function () {
            $scope.loadData();
        });
    };
    $scope.addDeviceToDisplay=function(device,data)
    {
        var index=null;
        for(i=0;i<$scope.widget.toDisplay.length;i++){
            if($scope.widget.toDisplay[i].idDevice===device.id)
            {
                index=i;
            }
        }
        if(index===null){
             $scope.widget.toDisplay.push({
                 idDevice : device.id,
                 datas : [data],
                 name : device.name
             });
         }
         else
         {
             $scope.widget.toDisplay[index].datas.push(data);
         }
    };
    $scope.removeDeviceToDisplay=function(index){
        $scope.widget.toDisplay.splice(index,1);
    };
    $scope.removeDataToDisplay=function(indexDevice,indexData){
        $scope.widget.toDisplay[indexDevice].datas.splice(indexData, 1);
    };
    $scope.loadDeviceLastValue=function(){
      var deferred = $q.defer();
      var todo = $scope.widget.toDisplay.length;
      angular.forEach($scope.widget.toDisplay,function(device){
        $http.get(window.serverUrl+'/api/myDevices/getlastvalue/'+device.idDevice).then(function(res){
          device.lastValue=[];
          device.lastValue=res.data.lastValue;
          if(!--todo)
              deferred.resolve(device);
        })
      });
      return deferred.promise;
    }
    $scope.checkIfExist=function(attribute){
        if(!angular.isUndefined(attribute)){
            return ' - ';
        }
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
    }
    
});
