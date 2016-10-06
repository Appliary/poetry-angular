var app = angular.module( __appName, __appDependencies );

app.config( function ( $locationProvider, $httpProvider ) {
        $locationProvider.html5Mode( true );
        $httpProvider.defaults.withCredentials = true;
    } )
    .run( function ( $rootScope, $http ) {
        $rootScope.__appName = __appName;

        $http.get( '/api/users' )
            .then( function success( usersResponse ) {

                $rootScope.session = usersResponse.data.session;
                console.log("rootscope session :", $rootScope.session);
                $http.get( '/api/users/' + $rootScope.session.user )
                .then( function success( response ) {

                    console.log(response);
                    $rootScope.user = response.data;

                }, function error( response ) {

                    console.warn( 'Users failed', response );

                } );

            }, function error( usersResponse ) {

                console.warn( 'Users failed', usersResponse );
                $rootScope.session = {};

            } );


        $rootScope.print = function(elem){
        	console.log('elem to print: ', elem);
        }
    } );
