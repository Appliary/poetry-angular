var app = angular.module( __appName, __appDependencies );

app.config( function ( $locationProvider, $httpProvider ) {
        $locationProvider.html5Mode( true );
        $httpProvider.defaults.withCredentials = true;
    } )
    .run( function ( $rootScope ) {
        $rootScope.__appName = __appName;
    } );
