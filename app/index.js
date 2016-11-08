var app = angular.module( __appName, __appDependencies );

app.config( function ( $locationProvider, $httpProvider ) {
        $locationProvider.html5Mode( true );
        $httpProvider.defaults.withCredentials = true;
    } )
    .run( function ( $rootScope, $http ) {
        $rootScope.__appName = __appName;
        $rootScope.loaded = false;

        /**
         * Retrieve session
         */
        $http.get( '/api/users/me' )
            .then( function success( usersResponse ) {

                $rootScope.session = usersResponse.data.session;
                $rootScope.user = usersResponse.data.user;
                $rootScope.loaded = true;

                console.groupCollapsed( 'Session [RETRIEVED]' );
                console.log( 'Session:', $rootScope.session );
                console.log( 'User:', $rootScope.user );
                console.groupEnd();

            }, function error( usersResponse ) {

                console.group( 'Session [FAILED]' );
                console.warn( usersResponse );
                $rootScope.session = {};
                $rootScope.user = {};
                console.groupEnd();

            } );


        $rootScope.print = function(elem){
        	console.log('elem to print: ', elem);
        }
    } );
