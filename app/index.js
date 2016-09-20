var app = angular.module( __appName, [ 'ngDialog' ] );

app.config( function ( $locationProvider, $httpProvider ) {
    $locationProvider.html5Mode( true );
    $httpProvider.defaults.withCredentials = true;
} );
