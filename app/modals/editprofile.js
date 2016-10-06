app.controller( 'modals/editprofile', function ( $scope, $http, $window, $location, ngDialog, $cookies, $rootScope ) {

    $scope.user = $rootScope.user;
    $scope.email = "";

    $scope.cancel = function cancel (){
        $window.location.replace( $location.absUrl() );
    }

    $scope.edit = function edit() {

        console.info( 'Try to edit profile', $scope.user );

        console.log('ngcookies', $cookies.getAll());

        $http.put('/api/users/' + $scope.user._id, $scope.user)
        .then( function success(response) {
            console.info('User edit succes', response);

        }, function error(response) {
            console.warn( 'Users edit failed', response );
        });

    };

} );
