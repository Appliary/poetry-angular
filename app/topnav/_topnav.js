app.component('appTopnav', {
    templateUrl: 'topnav/_topnav.pug',
    controller: function ($scope, $http, $location, ngDialog) {

        $scope.userName = "";

        $scope.editprofile = function () {
            ngDialog.openConfirm({
                templateUrl: 'modals/editprofile.pug',
                className: 'ngdialog-theme-default',
                controller: 'modals/editprofile'
            });
        }

        $scope.$root.$watch('loaded', function () {
            if ($scope.$root.loaded)
                $scope.userName = $scope.$root.user.email;
        });
    }
});
