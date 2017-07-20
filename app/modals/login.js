app.controller( 'modals/login', function ( $scope, $http, $window, $location, ngDialog ) {

    $scope.login = {};

    $scope.auth = function auth() {

        console.info( 'Try to authenticate', $scope.login.email );

        $http.post( '/login', {

                email: $scope.login.email,
                password: $scope.login.password,
                keep: $scope.login.keep || false

            } )
            .then( function success( response ) {

                console.info( 'Now authenticated', response.data );
                console.info($location.absUrl());
                $window.location.replace( $location.absUrl() );

            }, function error( response ) {

                console.warn( 'Authentication failed', response );
                $scope.failed = true;

            } );

    };

    $scope.register = function register() {

        console.info( 'Try to Register', $scope.register.email );

        return ngDialog.open( {
            templateUrl: 'modals/register.pug',
            controller: 'modals/register',
            showClose: false,
            className: 'register center-block'
        } );
    };


} );
