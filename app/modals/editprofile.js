app.controller( 'modals/editprofile', function ( $scope, $http, $window, $location, ngDialog, $rootScope, $filter ) {

    $scope.user = {
        email: $rootScope.user.email,
        firstName: $rootScope.user.firstName,
        lastName: $rootScope.user.lastName,
        language: $rootScope.user.language,
        locale: $rootScope.user.locale
    };

    $scope.__joi = {};
    $http.put( '/__joi/api/users/me' )
        .then( function success( response ) {
            console.info( 'User edit succes', response );
            toastr.success(
                $filter( 'translate' )( 'The changes you made on your profile has been saved' ),
                $filter( 'translate' )( 'Profile saved' )
            );
            $scope.cancel();

        }, function error( response ) {
            toastr.error(
                $filter( 'translate' )( response.data.message ),
                $filter( 'translate' )( 'Error' )
            );
        } );

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
    $scope.languageList = [ "en", "fr", "nl" ];

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


    $scope.cancel = function cancel() {
        console.log( "Refreshing page" );
        $window.location.replace( $location.absUrl() );
    };

    $scope.edit = function edit() {
        $scope.editState = {
            failed: false,
            saved: false
        };

        console.info( 'Try to edit profile', $scope.user );

        $http.put( '/api/users/me', $scope.user )
            .then( function success( response ) {
                console.info( 'User edit succes', response );
                $scope.editState.saved = true;
                $scope.cancel();

            }, function error( response ) {
                console.warn( 'Users edit failed', response );
                $scope.editState.failed = true;
            } );
    };

    $scope.changePassword = function changePassword() {

        console.info( 'Try to change password', $scope.user, $scope.password );

        if ( !$scope.checkPassword( $scope.password.newPassword1 ) )
            return toastr.error(
                $filter( 'translate' )( "Password must have minimum 8 characters, at least 1 Uppercase Alphabet, 1 Lowercase Alphabet, 1 Number and 1 Special Character" ),
                $filter( 'translate' )( 'Error' )
            );

        if ( $scope.password.newPassword1 != $scope.password.newPassword2 )
            return toastr.error(
                $filter( 'translate' )( 'Both password fields are not the same' ),
                $filter( 'translate' )( 'Error' )
            );

        $http.post( '/api/users/changePwd', {
                oldPassword: $scope.password.oldPassword,
                newPassword: $scope.password.newPassword1
            } )
            .then( function success( response ) {
                toastr.success(
                    $filter( 'translate' )( 'Your password has been changed' ),
                    $filter( 'translate' )( 'Password changed' )
                );
                $scope.cancel();

            }, function error( response ) {
                toastr.success(
                    $filter( 'translate' )( response.data.message ),
                    $filter( 'translate' )( 'Error' )
                );
            } );

    };

    $scope.showEdit = function showEdit() {
        $scope.editView = true;
        $scope.pwdView = false;
    };

    $scope.showChangepwd = function showChangepwd() {
        $scope.editView = false;
        $scope.pwdView = true;
    };

    $scope.checkPassword = function ( password ) {
        console.log( "password to check", password );
        var re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&#])[A-Za-z\d$@$!%*?&#]{8,}/;
        return re.test( password );
    };

} );
