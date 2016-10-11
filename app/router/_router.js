app.component( 'appRouter', {
    templateUrl: 'router/_router.pug',
    controller: function ( $window, $http, $scope, $templateCache, $controller , ngDialog) {

        console.log("scope.$root", $scope.$root);
        console.log("scope.$root.__module", $scope.$root.__module);
        $scope.open = false;
        $scope.buttons = {};


        $scope.buttons["add"] = function add() {
            console.info( 'Try to add open addElem modal in module : ', $scope.$root.__module );

            return ngDialog.open( {
                templateUrl: 'modals/addElement.pug',
                controller: 'modals/addElement',
                showClose: true,
                className: 'addElement'
            } );
        
            $scope.open = true;
            console.log("you can now sho the modal");      
        };


        $http.get( '/' + __appName + '/__sidebar.json' )
            .then( function onReceiveModulesList( r ) {
                var modules = {
                    'error':{
                        name:'error',
                        templateUrl: 'generic/error.pug',
                        hidden: true
                    },
                };

                r.data.forEach( function ( module ) {

                    if ( typeof module == 'string' )
                        module = {
                            name: module
                        }

                    if ( !module.name )
                        throw console.error( 'This module has no name', module );

                    if ( !module.icon )
                        module.icon = module.name;

                    if ( !module.templateUrl && !module.template ) {
                        if ( $templateCache.get( module.name + '/list.pug' ) )
                            module.templateUrl = module.name + '/list.pug'
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
                route( null, $window.location.pathname );

                $scope.$on( '$locationChangeStart', route );

            } );

        function route( ev, nextUrl, oldUrl, n ) {
            nextUrl = nextUrl.replace( '://', '' );
            var path = nextUrl.split( '/' )
                .slice( 2 );

            if ( !$scope.$root.__modules[ path[ 0 ] ] ) {
                console.warn( 'Unhandled route :', path );
                $scope.$root.__module = undefined;
                $scope.__id = undefined;
                $scope.__view = undefined;
                return;
            }

            $scope.$root.__module = $scope.$root.__modules[ path[ 0 ] ];
            console.log('in route module : ', $scope.$root.__module);
            $scope.__id = path[ 1 ];
            $scope.__view = path[ 2 ];
            console.info( 'Going to', $scope.$root.__module.name, $scope.__id, $scope.__view );

            $scope.$root.__module.toolbox = {};
            if($scope.$root.__module.buttons){
                $scope.$root.__module.buttons.forEach(function(button){
                    if($scope.buttons[button]){
                        $scope.$root.__module.toolbox[button] = $scope.buttons[button];
                    }

                });
            }
            
                

            try {
                if($scope.$root.__module.controller)
                    $scope.$root.__module.ctrl = $controller( $scope.$root.__module.controller, {
                        $scope: $scope
                    } );
            } catch ( err ) {
                console.error( err );
            }

        }

    }
} );
