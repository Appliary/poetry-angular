app.directive('appUserselector', function () {
    return {
        restrict: 'C',
        templateUrl: 'topnav/userselector.pug',
        controller: function ($scope, $http, $location, ngDialog) {

            $scope.userName = "";
            $scope.user = "";

            $scope.$root.$watch('loaded', function () {
                if ($scope.$root.loaded) {
                    $scope.userName = $scope.$root.user.email;
                    $scope.user = './img/avatar.jpg';
                }
            });
        }
    }
});
