app.component('appSidebar', {
    templateUrl: 'sidebar/_sidebar.pug',
    controller: function ($element, $window, $location, $scope, $stateParams, $http) {
        $http.get('/__apps')
            .then(function (r) {
                $scope.apps = r.data;
                $scope.apps.sort();
            });

        $scope.current = __appName;
        $scope.select = function (app) {
            if (app != $scope.current)
                window.location.replace('/' + app);
        };

        $scope.$root.go = $scope.go = function (module) {
            for (var key in $stateParams) {
                $stateParams[key] = undefined;
            }
            $location.path(module.path);
            minify();
        };


        var minify = function minify() {
            if ($window.innerWidth >= 600) return;
            $scope.$root.collapseSidebar = false;
        };

    }
});
