app.service('DevicesData', function($http, $q, ngNotify) {

    this.getDevicesData = function () {
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
        var url = '';

        if(startDate && endDate && measurementType){
            var newStart = new Date(startDate).getTime();
            var newEnd = new Date(endDate).getTime();
            url = '/api/devices/' + device + '/measurements?before=' + newEnd + '&after=' + newStart + '&sort=asc';
        }
        else{
            url = '/api/devices/' + device;
        }
        var datas = [];
        console.log("getdevicesdata url", url);
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
                                var dateToShow = date.getHours() + ' - ' + date.getDate() + '/' + date.getMonth();
                                datas.push([date, measurement.value]);
                            }
                        });
                    }  

                });
            } 
                
            // }
            else {
                datas = response.data;
            }

            deferred.resolve(datas);

        });

        return deferred.promise;

    };

    this.getDashboardFromDb = function(){
        var deferred = $q.defer();
        var url = '/api/myDashboards';

        $http.get(url)
        .then(function(res) {
            deferred.resolve(res.data);

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

        $http.post('/api/myDashboards', dashboard)
        .then(function(res) {
            if (res.status === 200) {
                deferred.resolve(res.data);
                /*Notify.success({
                   title: 'Stored to DB',
                   message: 'OK'
                 });*/
            } else {
                console.log("Can't store your dashboard", res);
            }
        });


        return deferred.promise;

    };

    this.deleteDashboard = function(dashboardId){

        var deferred = $q.defer();

        $http.delete('/api/myDashboards/' + dashboardId)
        .then(function(res) {
            if (res.status === 200) {
                deferred.resolve(res.data);
                /*Notify.success({
                   title: 'Stored to DB',
                   message: 'OK'
                 });*/
            } else {
                console.log("Can't delete your dashboard", res);
            }
        });


        return deferred.promise;

    };

});