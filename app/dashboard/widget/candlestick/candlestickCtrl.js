app.controller('candlestickCtrl',function($scope,$http,$interval,$q,$filter,DevicesData,ngDialog,$state){
    $scope.loading=false;
    $scope.widget.isChart = true;

    console.log("dandlestick controller loaded");

    if(!$scope.widget.chartObject){
      $scope.widget.chartObject = {};
      $scope.widget.chartObject.type = "CandlestickChart";
      $scope.widget.chartObject.data = [
        ['Mon', 20, 28, 38, 45],
        ['Tue', 31, 38, 55, 66],
        ['Wed', 50, 55, 77, 80],
        ['Thu', 77, 77, 66, 50],
        ['Fri', 68, 66, 22, 15]
      // Treat first row as data as well.
      ];

      $scope.widget.chartObject.options = {
          legend: 'none',
          bar: { groupWidth: '100%' }, // Remove space between bars.
          candlestick: {
            fallingColor: { strokeWidth: 0, fill: '#a52714' }, // red
            risingColor: { strokeWidth: 0, fill: '#0f9d58' }   // green
          }
      };
    }

    // -------------------- Functions ---------------------

    $scope.loadData=function(){
        // $scope.loading=true;
        // $scope.loadDevicesData().then(function(res){
        //   angular.forEach(res[0].daysData,function(day,keyday){
        //     angular.forEach(res,function(device){
        //       device.a[keyday]={};
        //       device.a[keyday].timestamp=day.timestamp;
        //       angular.forEach(device.datas,function(data,keydata){
        //         device.a[keyday][data]={};
        //         var decalageOpening=1;
        //         var find=false;
        //         var min=1000;
        //         var max=0;
        //         if(device.daysData[keyday].length!=0){
        //           var find=false;
        //           var indexType='';
        //           while(!find){
        //             angular.forEach(device.daysData[keyday][device.daysData[keyday].length-1].data,function(type,keyType){
        //               if(type.type==data){
        //                 find=true;
        //                 indexType=keyType;
        //               }
        //               if(keyType==device.daysData[keyday][device.daysData[keyday].length-1].data.length-1){
        //                 find=true;
        //               }
        //             })
        //            }
        //            device.a[keyday][data].opening=device.daysData[keyday][device.daysData[keyday].length-1].data[indexType].value;
        //            device.a[keyday][data].ending=device.daysData[keyday][0].data[indexType].value;

        //           angular.forEach(device.daysData[keyday],function(dataOfDay){
        //             if(dataOfDay.data){
        //               if(dataOfDay.data[indexType].value<min)
        //                 min=dataOfDay.data[indexType].value;
        //               if(dataOfDay.data[indexType].value>max)
        //                 max=dataOfDay.data[indexType].value
        //             }
        //             device.a[keyday][data].min=min;
        //             device.a[keyday][data].max=max;
        //           })
        //         }
        //       })
        //     })
        //   });
        //   angular.forEach($scope.widget.toDisplay,function(device){
        //     console.log('end device',device)
        //     var keysSorted = Object.keys(device.a).sort(function(a,b){return device.a[a].timestamp-device.a[b].timestamp});
        //     var objSort=[];
        //     var i=0;
        //     angular.forEach(keysSorted,function(key){
        //       objSort[i]=device.a[key];
        //       i++;
        //     })
        //     device.a=objSort;
        //   })

        //   var line=[];
        //   $scope.widget.chartObject.data =[];
        //     for(i=0;i<Object.keys($scope.widget.toDisplay[0].a).length;i++){
        //       line=[];
        //       var push=false;
        //       line.push($filter('date')($scope.widget.toDisplay[0].a[i].timestamp*1000, "dd-MM-yyyy"));
        //       angular.forEach($scope.widget.toDisplay,function(device){
        //         angular.forEach(device.a[i],function(value,key){
        //           if(key!=='timestamp')
        //             if(device.a[i][key].min&&device.a[i][key].max&&device.a[i][key].opening&&device.a[i][key].ending){
        //                 line.push(device.a[i][key].min);
        //                 line.push(device.a[i][key].opening);
        //                 line.push(device.a[i][key].ending);
        //                 line.push(device.a[i][key].max);
        //                 line.push(
        //                   device.idDevice+' - '+key+'\n'+
        //                   'min : '+device.a[i][key].min+'\n'+
        //                   'max : '+device.a[i][key].max+'\n'+
        //                   'opening : '+device.a[i][key].opening+'\n'+
        //                   'ending : '+device.a[i][key].ending
        //                 );
        //                 push=true;
        //             }
        //             else{
        //               line.push(null,null,null,null,null);
        //             }
        //         })

        //       })

        //       if(push){
        //         var lineLength=line.length-1;
        //         $scope.widget.chartObject.data.push(line);
        //       }
        //     }
        //     $scope.widget.chartObject.data= google.visualization.arrayToDataTable($scope.widget.chartObject.data,true);
        //     var nbTooltip=lineLength/5;
        //     for(i=1;i<=nbTooltip;i++){
        //       $scope.widget.chartObject.data.setColumnProperty(i*5, 'role', 'tooltip');
        //     }
        //     $scope.loading=false;
        //    // Treat first row as data as well.
        // })
        // $scope.widget.forceReload===false;
    };
    $scope.loadDevicesData=function(){
        var after=new Date($scope.widget.beginningdate).getTime()/1000;
        var before = (new Date($scope.widget.endingdate).getTime()/1000)+24*60*60;

        var deferred = $q.defer();
        var todo = $scope.widget.toDisplay.length*((before-after)/(24*60*60));
        angular.forEach($scope.widget.toDisplay,function(device){
          var tmpAfter=after;
          var tmpBefore= tmpAfter + 24*60*60;
            device.daysData=[];
            while(tmpBefore<=before){
              (function(tmpAfter){
              DevicesData.getDeviceData(device.idDevice,null,tmpBefore,tmpAfter).then(function(res){
                  res.timestamp=tmpAfter;
                  device.daysData.push(res);
                  device.a={};
                  if(!--todo)
                      deferred.resolve($scope.widget.toDisplay);
              });
              })(tmpAfter);
              tmpAfter=tmpBefore;
              tmpBefore= tmpBefore + 24*60*60;

            }
        });
        return deferred.promise;
    }
    $scope.clickToOpen = function () {
    ngDialog.openConfirm( {
            template: 'dashboard/modalWidget.pug',
            className: 'ngdialog-theme-default',
            scope:$scope,
            width:'800px'

        } )
        .then(function () {
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
    $scope.checkDate=function(){
      var check=true;
      if(new Date($scope.widget.beginningdate).getTime()>new Date($scope.widget.endingdate).getTime()){
        check=false;
        $scope.error="Choose an ending date greater than the beggining date";
      }
      else if((new Date($scope.widget.endingdate).getTime()/1000-new Date($scope.widget.beginningdate).getTime()/1000)>7*24*60*60){
        check=false;
        $scope.error="Pick a max range of 7 days";
      }
      else{
        delete $scope.error;
      }
      return check;
    };
    $scope.errorHandler=function(error) {
        //simply remove the error, the user never see it
        google.visualization.errors.removeError(error.id);
    };
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
    };

    function compare(a,b) {
      if (a.timestamp < b.timestamp)
        return -1;
      if (a.timestamp > b.timestamp)
        return 1;
      return 0;
    };

    // --------------------- Watchers --------------------

    $scope.$watch('widget.forceReload',function(){
        if($scope.widget.forceReload===true)
            $scope.loadData();
    });
})
