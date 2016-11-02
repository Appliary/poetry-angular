app.service('DevicesData',function($http,$q,ngNotify){
        this.getDevicesData=function () {
            var deferred = $q.defer();

            $http.get( '/api/devices' )
                .then( function ( res ) {
                  console.log('res',res)
                    if ( res.status == 200 )
                        devices = res.data.data;
                    else
                        Notify.danger( {
                            title: 'Error',
                            message: 'Unable to get your device list.'
                    });
                    deferred.resolve(res);
            });
            return deferred.promise;
        };
    this.getDeviceData=function(device,typeData,before,after)
    {
      var deferred = $q.defer();
      var url = window.serverUrl + '/api/myDevices/getData/'+device+'?before='+before+'&after='+after;
      var datas=[];
      $http.get( url )
          .then(function(res){
            if(typeData!==null){
              angular.forEach(res.data,function(aData){
                angular.forEach(aData.data,function(data){
                  try{
                    if(data.type==typeData)
                      datas.push({type : data.type,value : data.value, unit : data.unit ,timestamp : aData.timestamp});
                  }catch(e){
                    console.log('error')
                  }
                });
              })
            }else{
              datas=res.data;
            }


          deferred.resolve(datas);
      });
      return deferred.promise;
  };
    this.getDashboardFromDb=function(idDevice){
        var deferred = $q.defer();
        var url='';
        if(idDevice!==false)
          url = window.serverUrl + '/api/myDevices/dashboard/'+idDevice;
        else
          url = window.serverUrl + '/api/myDashboards';
        $http.get(url)
            .then( function ( res ) {
                console.log("----------res in devicesData-----------", res);
                deferred.resolve(res);
                if(res.status !== 200 ){
                    Notify.danger({
                        title: 'Error',
                        message: 'Can\'t load your Dashboard'
                    });
                }

        });
        return deferred.promise;
    };

    var time=5000;
    var timeout;

    this.saveDashboardToDb=function(dashboard)
    {
        var deferred = $q.defer();
        if(timeout)
            clearTimeout(timeout);
        timeout=setTimeout(function(){
            var url = '';
            if(dashboard.isDevice)
              url = window.serverUrl + '/api/myDevices/editDashboard/'+dashboard.id;
            else
              url = window.serverUrl + '/api/myDashboards';
            var post={};
            if(dashboard.id!==null)
                post.id=dashboard.id;
            post.dashboard=dashboard.data;
            post.name=dashboard.name;
            $http.post(url, post)
                    .then( function ( res ) {
                        if ( res.status === 200 ){
                            deferred.resolve(res.data.id);
                             /*Notify.success({
                                title: 'Stored to DB',
                                message: 'OK'
                              });*/
                            }
                        else{
                            Notify.danger({
                                title: 'Error',
                                message: 'Can\'t store dashboard to database'
                                });
                        }
                });
        },time);
        return deferred.promise;
    };
    this.deleteDashboard=function(id){
      $http.delete( window.serverUrl + '/api/myDashboards/'+id )
          .then( function ( res ) {
              if ( res.status == 200 )
                  devices = res.data;
              else
                  Notify.danger( {
                      title: 'Error',
                      message: 'Can\'t remove your dashboard'
              });
      });
    }
});
