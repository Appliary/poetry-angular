app.directive('appAppselector', function ($window, $timeout) {
    return {
        restrict: 'C',
        templateUrl: 'topnav/appselector.pug',
        controller: function ($scope, $http, $location) {
            $http.get('/__apps')
                .then(function (r) {
                    $scope.apps = r.data;
                    $scope.apps.sort();

                    for (let i = 1; i <= 5; i++) {
                        $timeout(function () {
                            console.log("tabdrop");
                            $('.nav-tabs').tabdrop();
                        }, i * 1000);
                    }
                });

            $scope.current = __appName;
            $scope.select = function (app) {
                window.location.replace('/' + app);
            };
        }
    }
});
