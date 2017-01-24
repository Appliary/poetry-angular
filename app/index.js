var app = angular.module( __appName, __appDependencies );

try {
    if ( webshims ) {
        webshims.setOptions( 'forms-ext', {
            types: 'date'
        } );
        webshims.polyfill( 'forms forms-ext' );
    }
} catch ( e ) {}

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
                $rootScope.team = usersResponse.data.team;
                $rootScope.loaded = true;

                var lang = usersResponse.data.user.language || 'en'

                $http.get( '/i18n/' + lang )
                    .then( function ok( i18n ) {
                        i18n_registry = i18n.data;
                        i18n_registry.lang = i18n_registry.lang || 'en';
                    } );

                console.groupCollapsed( 'Session [RETRIEVED]' );
                console.log( 'Session:', $rootScope.session );
                console.log( 'User:', $rootScope.user );
                console.log( 'Team:', $rootScope.team );
                console.groupEnd();

            }, function error( usersResponse ) {

                console.group( 'Session [FAILED]' );
                console.warn( usersResponse );
                $rootScope.session = {};
                $rootScope.user = {};
                console.groupEnd();

            } );


        $rootScope.print = function ( elem ) {
            console.log( 'elem to print: ', elem );
        }
    } );
