app.controller( 'modals/register', function ( $scope, $http, $location ) {

    $scope.register = {};

    $scope.createUser = function createUser() {

        console.info( 'Try to register', $scope.register.email );

        $http.post( '/register', {

                email: $scope.register.email,
                language : $scope.register.language,
                firstName : $scope.register.firstName,
                lastName : $scope.register.lastName,
                phone : $scope.register.phone,
                teamName : $scope.register.teamName,

            } )
            .then( function success( response ) {
                console.log(response);

                $window.location.replace( $location.absUrl() );

            }, function error( response ) {
                console.log(response);
                $scope.failed = true;

            } );

    }

} );
