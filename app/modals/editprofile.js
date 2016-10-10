app.controller( 'modals/editprofile', function ( $scope, $http, $window, $location, ngDialog, $rootScope ) {

    $scope.user = { 
        email: $rootScope.user.email, 
        firstName: $rootScope.user.firstName,
        lastName: $rootScope.user.lastName
    }
    $rootScope.user;
    $scope.email = "";
    $scope.password = {
        oldPassword: "",
        newPassword1: "",
        newPassword2: ""
    }
    $scope.failedEdit = false;
    $scope.failEditMsg = "";
    $scope.failedChangepwd = false;
    $scope.failChangepwdMsg = "";


    $scope.cancel = function cancel (){
        $window.location.replace( $location.absUrl() );
    }

    $scope.edit = function edit() {

        console.info( 'Try to edit profile', $scope.user );

        $http.put('/api/users/' + $rootScope.user._id, $scope.user)
        .then( function success(response) {
            console.info('User edit succes', response);
            $scope.cancel();

        }, function error(response) {
            console.warn( 'Users edit failed', response );
            $scope.failedEdit = true;
            $scope.failEditMsg = response.data;
        })
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
                    $scope.failedChangepwd = true;
                    $scope.failChangepwdMsg = response.data;
                })
        }
        else{
            $scope.failedChangepwd = true;
            $scope.failChangepwdMsg = "Both new password field are not the same !";
        }
    };

} );
