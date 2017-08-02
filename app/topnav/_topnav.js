app.component('appTopnav', {
    templateUrl: 'topnav/_topnav.pug',
    controller: function ($scope, $http, $location, ngDialog) {

        $scope.userName = "";

        /*$scope.editprofile = function () {
            return ngDialog.open({
                templateUrl: 'modals/editprofile.pug',
                controller: 'modals/editprofile',
                showClose: true,
                className: 'editprofile'
            });
        }*/

        $scope.editprofile = function () {
            ngDialog.openConfirm({
                templateUrl: 'modals/editprofile.pug',
                className: 'ngdialog-theme-default',
                width: '450px',
                controller: 'modals/editprofile'
            });
        }

        $scope.$root.$watch('loaded', function () {
            if ($scope.$root.loaded)
                $scope.userName = $scope.$root.user.email;
        });
    }
});
