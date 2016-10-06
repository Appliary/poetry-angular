app.controller( 'modals/editprofile', function ( $scope, $http, $window, $location, ngDialog, $rootScope ) {

    $scope.user = {
        "status": "",
        "role": "",
        "language": "",
        "firstName": "",
        "lastName": "",
        "phone": "",
        "email": ""
    };
    $scope.email = "";

    $scope.edit = function edit() {

        console.info( 'Try to edit profile', $scope.user );
        console.log('scope', $scope);
        console.log('root', $rootScope);

        

        // $http.post( '/login', {

        //         email: $scope.login.email,
        //         password: $scope.login.password,
        //         keep: $scope.login.keep || false

        //     } )
        //     .then( function success( response ) {

        //         console.info( 'Now authenticated', response.data );
        //         console.info($location.absUrl());
        //         $window.location.replace( $location.absUrl() );

        //     }, function error( response ) {

        //         console.warn( 'Authentication failed', response );
        //         $scope.failed = true;

        //     } );

    };

} );
