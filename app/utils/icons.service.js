app.factory('iconsService', iconsService);

iconsService.$inject = ['$http', '$q'];

/* @ngInject */
function iconsService($http, $q) {

    return {
        getIcons: getIcons,
        getIcon: getIcon,
    };

    function getIcons () {
        var defer = $q.defer();
        $http.get('/api/devices/icons')
            .then(function (response) {
                defer.resolve( response.data );
            })
            .catch(function (error) {
                defer.reject(error);
            });
        return defer.promise;
    }

    function getIcon ( fileName ) {
        var defer = $q.defer();
        $http.get('/api/devices/icon/' + fileName )
            .then(function (response) {
                defer.resolve( response.data );
            })
            .catch(function (error) {
                defer.reject(error);
            });
        return defer.promise;
    }
}



