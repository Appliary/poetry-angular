app.component( 'appRouter', {
    templateUrl: 'router/_router.pug',
    controller: function (
        $window,
        $http,
        $scope,
        $rootScope,
        $location,
        $templateCache,
        $controller,
        $customRoutesProvider,
        ngDialog
    ) {


        var lastModule = null;


        /**
         * Retrieve the modules from config
         */
        $http.get( '/' + __appName + '/__sidebar.json' )
            .then( function onReceiveModulesList( r ) {
                var modules = {
                    'error': {
                        name: 'error',
                        templateUrl: 'generic/error.pug',
                        hidden: true
                    },
                };

                r.data.forEach( function ( module ) {

                    if ( typeof module == 'string' )
                        module = {
                            name: module
                        };

                    if ( !module.name )
                        throw console.error( 'This module has no name', module );

                    if ( !module.icon )
                        module.icon = module.name;

                    if ( !module.templateUrl && !module.template ) {
                        if ( $templateCache.get( module.name + '/list.pug' ) )
                            module.templateUrl = module.name + '/list.pug';
                        else
                            module.templateUrl = 'generic/list.pug';
                    }

                    if ( !module.api )
                        module.api = '/api/' + module.name;

                    if ( !module.controller ) {
                        module.controller = 'generic/list';
                    }

                    if ( module.path === undefined )
                        module.path = module.name;

                    modules[ module.path ] = module;

                } );

                $scope.$root.__modules = modules;

                $http.get( '/' + __appName + '/__routes.json' )
                    .then( function ( result ) {
                        var Routes = {};

                        for ( var key in result.data ) {
                            var _route = result.data[ key ];
                            console.log( 'Registering route: ' + key );
                            $customRoutesProvider.addState( key, _route );
                        }


                        route( null, $window.location.pathname );
                        $scope.$on( '$locationChangeStart', route );

                    } )
                    .catch( function ( err ) {
                        console.log( 'No custom routes found.' );

                        route( null, $window.location.pathname );
                        $scope.$on( '$locationChangeStart', route );
                    } );

            } );


        /**
         * Redirect to the route
         *
         * @arg {Unknown} ev
         * @arg {String} nextUrl
         * @arg {String} oldUrl
         * @arg {Unknown} n
         */
        function route( ev, nextUrl, oldUrl, n ) {
            nextUrl = nextUrl.replace( '://', '' );
            var path = nextUrl.split( '/' )
                .slice( 2 );

            if ( !$scope.$root.__modules[ path[ 0 ] ] ) {
                console.warn( 'Unhandled route :', path );
                if ( $scope.$root.__module && !$scope.$root.__module.dynamic ) {
                    $scope.$root.__module = undefined;
                }
                $scope.__id = undefined;
                $scope.__view = undefined;

                // unhandled route
                $rootScope.$broadcast( "appRouteUnhandled", {
                    current: {
                        module: $scope.$root.__module || {},
                        path: $location.path() || "/"
                    },
                    old: {
                        module: lastModule
                    }
                } );
                // var foundState = $customRoutesProvider.checkInitialState();
                // if (foundState) {
                //     angular.injector().get('$state').go(foundState);
                // }
                return;
            }

            $scope.$root.__module = $scope.$root.__modules[ path[ 0 ] ];
            $scope.__id = !angular.isUndefined(path[ 1 ]) ? decodeURIComponent( path[ 1 ] ) : undefined;
            $scope.__view = !angular.isUndefined(path[ 2 ]) ? decodeURIComponent( path[ 2 ] ) : undefined;
            console.info( 'Going to', $scope.$root.__module.name, $scope.__id, $scope.__view );

            $rootScope.$broadcast( "appRouteChange", {
                current: {
                    module: $scope.$root.__module || {},
                    path: $location.path() || "/"
                },
                old: {
                    module: lastModule
                }
            } );

            if ( !$scope.__id && !$scope.__view ) {
                $scope.item = undefined;
            }

            try {
                if ( $scope.$root.__module.controller && $scope.$root.__module.name != lastModule ) {

                    Object.keys( $scope )
                        .forEach( function ( k ) {
                            if ( k.indexOf( '$' ) && k.indexOf( '_' ) )
                                delete $scope[ k ];
                        } );

                    $scope.$root.__module.ctrl = $controller( $scope.$root.__module.controller, {
                        $scope: $scope
                    } );

                    lastModule = $scope.$root.__module.name;

                }
            } catch ( err ) {
                console.error( err );
            }

            $scope.openToolbox = function openToolbox( name ) {

                if ( !$scope.$root.__module.config || !$scope.$root.__module.config.toolbox || !$scope.$root.__module.config.toolbox[ name ] )
                    return console.error( 'Toolbox', name, 'not found' );

                $scope.__config = $scope.$root.__module.config.toolbox[ name ];
                $scope.__config.toolboxName = name;

                console.info( 'Opening toolbox:', $scope.__config );

                if ( $scope.__config.onListEdit ) {
                    $scope.__id = "new";
                    $scope.tab( '' );
                } else {
                    return ngDialog.open( {
                        template: $scope.__config.templateUrl || 'modals/toolbox.pug',
                        controller: $scope.__config.controller || 'modals/toolbox',
                        scope: $scope,
                        className: 'ngdialog-theme-default'
                    } );
                }

            };

        }

    }
} );
