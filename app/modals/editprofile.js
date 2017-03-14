app.controller( 'modals/editprofile', function ( $scope, $http, $window, $location, ngDialog, $rootScope ) {

    $scope.user = {
        email: $rootScope.user.email,
        firstName: $rootScope.user.firstName,
        lastName: $rootScope.user.lastName,
        language: $rootScope.user.language
    };

    $scope.__joi = {};
    $http.put( '/__joi/api/users/me' )
        .then( function success( response ) {
            return ( $scope.__joi = response.data.payload );
        }, function error( err ) {} );

    $rootScope.user;
    $scope.email = "";
    $scope.password = {
        oldPassword: "",
        newPassword1: "",
        newPassword2: ""
    };

    $scope.failedEdit = false;
    $scope.failEditMsg = "";
    $scope.failedChangepwd = false;
    $scope.failChangepwdMsg = "";
    $scope.editView = true;
    $scope.pwdView = false;
    $scope.languageList = ["en", "fr", "nl"];

    $scope.error = false;
    $scope.success = false;


    $scope.pwdState = {
      failed: false,
      saved: false
    };

    $scope.editState = {
      failed: false,
      saved: false
    };


    $scope.cancel = function cancel (){
        console.log("Refreshing page");
        $window.location.replace( $location.absUrl() );
    }

    $scope.edit = function edit() {
      $scope.editState = {
        failed: false,
        saved: false
      };

        console.info( 'Try to edit profile', $scope.user );

        $http.put('/api/users/me', $scope.user)
        .then( function success(response) {
            console.info('User edit succes', response);
            $scope.editState.saved = true;
            $scope.cancel();

        }, function error(response) {
            console.warn( 'Users edit failed', response );
            $scope.editState.failed = true;
        })
    };

    $scope.changePassword = function changePassword() {

        console.info( 'Try to change password', $scope.user, $scope.password );

        if($scope.checkPassword($scope.password.newPassword1)){
            if($scope.password.newPassword1 == $scope.password.newPassword2){

                $http.post('/api/users/changePwd', {
                    oldPassword: $scope.password.oldPassword,
                    newPassword: $scope.password.newPassword1
                })
                    .then( function success(response) {
                        console.info('User change pwd success', response);
                        $scope.failedChangepwd = true;
                        $scope.failChangepwdMsg = "Password successfully updated";
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
        }
        else{
            $scope.failedChangepwd = true;
            $scope.failChangepwdMsg = "Password must have minimum 8 characters, at least 1 Uppercase Alphabet, 1 Lowercase Alphabet, 1 Number and 1 Special Character";
        }


    };

    $scope.showEdit = function showEdit(){
        $scope.editView = true;
        $scope.pwdView = false;
    }

    $scope.showChangepwd = function showChangepwd(){
        $scope.editView = false;
        $scope.pwdView = true;
    }

    $scope.checkPassword = function(password){
        console.log("password to check", password);
        var re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&#])[A-Za-z\d$@$!%*?&#]{8,}/;
        return re.test(password);
    }

} );
