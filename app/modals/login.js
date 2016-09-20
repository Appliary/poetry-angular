app.controller( 'modals/login', function ( $scope, $http, $location ) {

    $scope.login = {};

    $scope.auth = function auth() {

        console.info( 'Try to authenticate', $scope.login.email );

        $http.post( '/login', {

                email: $scope.login.email,
                password: $scope.login.password,
                keep: $scope.login.keep || false

            } )
            .then( function success( response ) {

                $location.refresh();

            }, function error( response ) {

                $scope.failed = true;

            } );

    }

} );
