app.service('DevicesData', function($http, $q, ngNotify) {

    this.getDevicesData = function (smart) {
        var deferred = $q.defer();
        var devices = [];

        var url = smart ? '/api/smartdevices' : '/api/devices';

        $http.get( url )
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

    this.getDeviceData = function (device, startDate, endDate, measurementType, smart, aggregation){

        var deferred = $q.defer();
        var apiUrl = smart ? '/api/smartdevices/' : '/api/devices/'
        var url = '';

        let smartAggregation = (smart && aggregation) ? aggregation : "";

        if(startDate && endDate && measurementType){
            var newStart = new Date(startDate).getTime();
            var newEnd = new Date(endDate).getTime();
            url = apiUrl + device + '/measurements' + smartAggregation + '?before=' + newEnd + '&after=' + newStart + '&sort=asc';
        }
        else{
            url = apiUrl + device;
        }
        var datas = [];
        let result = {};
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

                                if(!result.unit){
                                    result.unit = measurement.unit;
                                }
                            }
                        });
                    }  

                });
            } 
                
            // }
            else {
                datas = response.data;
            }

            result.datas = datas;

            deferred.resolve(result);

        });

        return deferred.promise;

    };

    this.getLastData = function (device, measurementType, smart){

        var deferred = $q.defer();
        var apiUrl = smart ? '/api/smartdevices/' : '/api/devices/'
        var url = apiUrl + device + '/measurements?limit=1';
        var result = {};

        console.log("getdevicesdata url", url);
        $http.get(url)
        .then(function(response) {
            if (response.data.data && response.data.data.length > 0) {
                var measurementData = response.data.data[0];
                var found = false;
                if(measurementData.measurements){
                    measurementData.measurements.forEach(function(measurement){

                        if(measurement.type == measurementType && !found){
                            found = true;
                            result = measurement;
                        }
                    });
                }  
            } 

            deferred.resolve(result);

        });

        return deferred.promise;

    };

    this.searchDevice = function (search, smart){
        var deferred = $q.defer();
        var apiUrl = smart ? '/api/smartdevices' : '/api/devices'
        var url = apiUrl + '?limit=20&search=' + encodeURIComponent( search || '' ) ;

        $http.get(url)
        .then( function success ( res ) {
            console.log("searchDevice res", res);
            deferred.resolve(res.data.data || []);
        } );

        return deferred.promise;
    };

    this.getDashboardFromDb = function (){
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