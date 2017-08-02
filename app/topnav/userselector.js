app.directive('appUserselector', function () {
    return {
        restrict: 'C',
        templateUrl: 'topnav/userselector.pug',
        controller: function ($scope, $http, $location, ngDialog) {

            $scope.userName = "";
            $scope.user = "";

            /*$scope.editprofile = function () {
                ngDialog.openConfirm({
                    templateUrl: 'modals/editprofile.pug',
                    className: 'ngdialog-theme-default',
                    width: '450px',
                    controller: 'modals/editprofile'
                });
            }*/

            $scope.$root.$watch('loaded', function () {
                if ($scope.$root.loaded) {
                    $scope.userName = $scope.$root.user.email;
                    $scope.user = './img/avatar.jpg';
                }
            });
        }
    }
});
