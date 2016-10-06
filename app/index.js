var app = angular.module( __appName, __appDependencies );

app.config( function ( $locationProvider, $httpProvider ) {
        $locationProvider.html5Mode( true );
        $httpProvider.defaults.withCredentials = true;
        
        // (function loadCustomRoutes() {
        //     $http.get( '/' + __appName + '/__routes.json' )
        //         .then(function (result) {
        //             var Routes = {};

        //             for (var key in result.data) {
        //                 var _route = result.data[key];
        //                 Routes[key] = _route;
        //             }

        //             $urlRouterProvider.otherwise( '/404' );
        //             Object.keys( Routes )
        //                 .forEach( function ( route ) {
        //                     console.log('Registering route: ' + route);
        //                     $stateProvider.state( route, Routes[ route ] );
        //                 });

        //         })
        //         .catch(function (err) {
        //             console.log('No custom routes found.')
        //         });
        // }) ();
    } )
    .run( function ( $rootScope ) {
        $rootScope.__appName = __appName;
    } );
