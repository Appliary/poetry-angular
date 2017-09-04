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
    .run( function ( $rootScope, $http, $location, AppUserService ) {
        $rootScope.__appName = __appName;
        $rootScope.loaded = false;

        toastr.options = {
            "newestOnTop": true,
            "progressBar": true,
            "positionClass": "toast-top-right",
            "timeOut": "6000"
        };

        /**
        * on route change
        if(!AppUserService.hasApp(__appName)){
          if($location.path() != '' ){
            return $location.path( '/error/403' );
          }
        }
        */

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

                console.warn( "listening to appRouteChange" );
                $rootScope.$on( 'appRouteChange',
                    function ( event, args ) {
                        console.log( "current path:", args.current.path );
                        var authorized = AppUserService.hasApp( __appName, args.current.module.name );
                        if ( !authorized ) {
                            var noPermissionPath = '/error/403';
                            if ( args.current.path != noPermissionPath ) {
                                console.groupCollapsed( 'Permission [FAILED]' );
                                console.log( "stack:", "APP" );
                                console.log( "service:", __appName );
                                console.log( "module:", args.current.module.name );
                                console.groupEnd();
                                $location.path( noPermissionPath );
                            }
                        }
                    } );


                var loadingFirstModule = false;
                console.warn( "listening to appRouteUnhandled" );
                $rootScope.$on( 'appRouteUnhandled',
                    function ( event, args ) {

                      // matrix
                      console.log("%cappRouteUnhandled","background-color: black; color: #2BFF00");

                      if(loadingFirstModule) return;
                      loadingFirstModule = true;

                      if(!(args.current.path == "/")) {
                        loadingFirstModule = false;
                        return;
                      }

                      if(AppUserService.hasApp(__appName)){

                        AppUserService.getPermissions().then(
                          function(res){
                            loadingFirstModule = false;
                            goToFirstModule(res.data);
                          },
                          function(){
                            loadingFirstModule = false;
                            // if could not retrieve permissions from the API
                            goToFirstModule(AppUserService.getPermissionsLocal());
                          }
                        )
                      }

                      function goToFirstModule(permissions){

                        var appPerm = permissions.APP && permissions.APP[__appName] ? permissions.APP[__appName] : {};
                        var __modules = $rootScope.__modules;
                        var __moduleNames = Object.keys(__modules);

                        if(angular.isObject(appPerm)){
                          var __module = {};

                          // go to the first permitted module if it exists
                          if(Object.keys(appPerm).some(function(moduleName){
                            __module = __modules[moduleName];
                            return appPerm[moduleName] && __moduleNames.indexOf(moduleName);
                          })){
                            if(loadingFirstModule == false){
                              $rootScope.go(__module);
                            }
                          }
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
