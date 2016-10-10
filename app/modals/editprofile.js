app.controller( 'modals/editprofile', function ( $scope, $http, $window, $location, ngDialog, $rootScope ) {

    $scope.user = $rootScope.user;
    $scope.email = "";
    $scope.password = {
        oldPassword: "",
        newPassword1: "",
        newPassword2: ""
    }
    $scope.failed = false;
    $scope.failmsg = "";

    $scope.cancel = function cancel (){
        $window.location.replace( $location.absUrl() );
    }

    $scope.edit = function edit() {

        console.info( 'Try to edit profile', $scope.user );

        console.log(
            $http.put('/api/users/' + $scope.user._id, $scope.user)
            .then( function success(response) {
                console.info('User edit succes', response);

            }, function error(response) {
                console.warn( 'Users edit failed', response );
            })
        );

    };

    $scope.changePassword = function changePassword() {

        console.info( 'Try to change password', $scope.user, $scope.password );

        if($scope.password.newPassword1 == $scope.password.newPassword2){


            $http.post('/api/users/changePwd', {
                oldPassword: $scope.password.oldPassword,
                newPassword: $scope.password.newPassword1
            })
                .then( function success(response) {
                    console.info('User change pwd success', response);
                    $scope.cancel();

                }, function error(response) {
                    console.warn( 'Users change pwd failed', response );
                    $scope.failed = true;
                    $scope.failmsg = response.data;
                })
        }
        else{
            $scope.failed = true;
            $scope.failmsg = "Both new password field are not the same !";
        }
    };

} );
