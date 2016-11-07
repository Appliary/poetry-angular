app.service('DevicesData', function($http, $q, ngNotify) {

    this.getDevicesData=function () {
        var deferred = $q.defer();
        var devices = [];

        $http.get( '/api/devices' )
            .then( function ( res ) {
              //console.log('res',res)
                if ( res.status == 200 )
                    devices = res.data.data;
                else
                    console.log("error in getdevices", res);
                deferred.resolve(devices);
        });
        return deferred.promise;
    };

    this.getDeviceData = function(device, startDate, endDate, measurementType){

        var deferred = $q.defer();
        var url = '/api/devices/' + device + '/measurements?before=' + endDate + '&after=' + startDate;
        var datas = [];

        $http.get(url)
        .then(function(response) {
            if (response.data.data) {
                var measurementDatas = response.data.data;
                measurementDatas.forEach(function(measurementData){
                    var found = false;
                    if(measurementData.measurements){
                        measurementData.measurements.forEach(function(measurement){
                            if(measurement.type == measurementType && !found){
                                found = true;
                                var date = new Date(measurementData.timestamp);
                                var dateToShow = date.getDate() + '/' + date.getMonth();
                                datas.push([dateToShow, measurement.value]);
                            }
                        });
                    }  

                });
            } 
                
            // }
            else {
                console.log("error in getdevicedata", response);
            }

            deferred.resolve(datas);

        });

        return deferred.promise;

    };

    this.getDashboardFromDb = function(idDevice){
        var deferred = $q.defer();
        var url = '';

        if (idDevice !== false)
            url = window.serverUrl + '/api/myDevices/dashboard/' + idDevice;
        else
            url = window.serverUrl + '/api/myDashboards';

        $http.get(url)
        .then(function(res) {
            //console.log("----------res in devicesData-----------", res);
            deferred.resolve(res);

            if (res.status !== 200) {
                console.log("Can't load your dashboard", res);
            }
        });

        return deferred.promise;

    };

    var time = 5000;
    var timeout;

    this.saveDashboardToDb = function(dashboard){

        var deferred = $q.defer();

        if (timeout)
            clearTimeout(timeout);

        timeout = setTimeout(function() {
            var url = '';

            if (dashboard.isDevice)
                url = window.serverUrl + '/api/myDevices/editDashboard/' + dashboard.id;
            else
                url = window.serverUrl + '/api/myDashboards';

            var post = {};

            if (dashboard.id !== null)
                post.id = dashboard.id;

            post.dashboard = dashboard.data;
            post.name = dashboard.name;

            $http.post(url, post)
            .then(function(res) {
                if (res.status === 200) {
                    deferred.resolve(res.data.id);
                    /*Notify.success({
                       title: 'Stored to DB',
                       message: 'OK'
                     });*/
                } else {
                    console.log("Can't store your dashboard", res);
                }
            });
        }, time);

        return deferred.promise;

    };

});