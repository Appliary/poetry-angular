app.component( 'appAppselector', {
    templateUrl: 'topnav/appselector.pug',
    controller: function ( $scope, $http, $location ) {
        $http.get( '/__apps' )
            .then( function ( r ) {
                $scope.apps = r.data;
            } );

        $scope.current = __appName;
        $scope.select = function ( app ) {
            window.location.replace( '/' + app );
        }
    }
} );
