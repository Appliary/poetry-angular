app.controller( 'modals/login', function ( $scope, $http ) {

    $scope.login = {};

    $scope.auth = function auth() {

        console.info( 'Try to authenticate', $scope.login.email );

        $http.post( '/login', {

                email: $scope.login.email,
                password: $scope.login.password,
                keep: $scope.login.keep || false

            } )
            .then( function success( response ) {

                console.dir( response.data );

            }, function error( response ) {

                $scope.failed = true;

            } );

    }

} );
