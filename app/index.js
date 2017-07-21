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
    .run( function ( $rootScope, $http, AppUserService, $location ) {
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
                $rootScope.role = usersResponse.data.role;

                $rootScope.loaded = true;

                var lang = usersResponse.data.user.language || 'en';

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

                console.warn("listening to appRouteChange");
                $rootScope.$on('appRouteChange',
                  function(event, args){
                    console.log("current path:",args.current.path);
                    var authorized = AppUserService.hasApp(__appName, args.current.module.name);
                    if(!authorized){
                        var noPermissionPath = '/error/403';
                        if(args.current.path != noPermissionPath){
                          console.groupCollapsed( 'Permission [FAILED]' );
                          console.log("stack:", "APP");
                          console.log("service:",__appName);
                          console.log("module:",args.current.module.name);
                          console.groupEnd();
                          $location.path(noPermissionPath);
                        }
                    }
                });

            }, function error( usersResponse ) {

                console.group( 'Session [FAILED]' );
                console.warn( usersResponse );
                $rootScope.session = {};
                $rootScope.user = {};
                console.groupEnd();

            } );



        $rootScope.print = function ( elem ) {
            console.log( 'elem to print: ', elem );
        };
    } );
