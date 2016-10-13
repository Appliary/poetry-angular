var app = angular.module( __appName, __appDependencies );

app.config( function ( $locationProvider, $httpProvider ) {
        $locationProvider.html5Mode( true );
        $httpProvider.defaults.withCredentials = true;
    } )
    .run( function ( $rootScope, $http ) {
        $rootScope.__appName = __appName;

        $http.get( '/api/users/me' )
            .then( function success( usersResponse ) {

                $rootScope.session = usersResponse.data.user;
                $rootScope.user = usersResponse.data.session;
                console.log("root session :", $rootScope.session);
                console.log("root user :", $rootScope.user);

            }, function error( usersResponse ) {

                console.warn( '/me failed', usersResponse );
                $rootScope.session = {};
                $rootScope.user = {};

            } );


        $rootScope.print = function(elem){
        	console.log('elem to print: ', elem);
        }
    } );
