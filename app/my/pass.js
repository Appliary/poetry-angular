app.directive('passInput', function passInput() {
    return {
        restrict: 'E',
        scope: {
            password: '='
        },
        templateUrl: 'my/pass.pug',
        controller: function passInput($scope) {

            // Be sure the scope property exists
            $scope.password = $scope.password || {};
            $scope.password.errors = $scope.password.errors || [];
            $scope.password.newPassword1 = $scope.password.newPassword1 || '';
            $scope.password.newPassword2 = $scope.password.newPassword2 || '';

            // Watch for changes on password
            $scope.$watchGroup([
                'password.newPassword1',
                'password.newPassword2'
            ], function checkInput() {

                $scope.password.errors = [];

                // Check composition
                checkReg('minLength', /.{8}/);
                checkReg('uppercase', /[A-Z]/);
                checkReg('lowercase', /[a-z]/);
                checkReg('number', /[0-9]/);
                checkReg('special', /\W/);

                // Check both inputs are the same
                if ($scope.password.newPassword1 != $scope.password.newPassword2)
                    $scope.password.errors.push('same');

            });

            function checkReg(err, reg) {
                if (!~$scope.password.newPassword1 || !~$scope.password.newPassword1.search(reg))
                    $scope.password.errors.push(err);
            }

            $('[data-toggle="tooltip"]').tooltip();

        }
    };
});
