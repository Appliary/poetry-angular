app.controller( 'generic/list', function ( $scope, $http, $location, ngDialog ) {
    if ( $scope.__id ) retrieveItem( $scope.__id );

    $scope.buttons = [];
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


    console.log("show module in list", $scope.$root.__module);
    console.log("show add func in list module", $scope.add);
    $scope.$root.__module.toolbox = {};
    if($scope.$root.__module.buttons){
        $scope.$root.__module.buttons.forEach(function(button){
            if($scope.buttons[button]){
                $scope.$root.__module.toolbox[button] = $scope.buttons[button];
            }

        });
    }

    $http.get( $scope.$root.__module.api )
        .then( function success( response ) {

            if ( response.data.data )
                $scope.data = response.data.data;
            else if ( response.data instanceof Array )
                $scope.data = response.data;
            else
                $scope.data = [];

            if ( $scope.$root.__module.config && $scope.$root.__module.config.columns )
                $scope.columns = $scope.$root.__module.config.columns;
            else $scope.columns = [];

            if ( !$scope.columns.length )
                $scope.data.forEach( function ( data ) {
                    Object.keys( data )
                        .forEach( function ( col ) {
                            if ( !~$scope.columns.indexOf( col ) )
                                $scope.columns.push( col );
                        } )
                } );

        }, function error( response ) {

            if ( response.status == 401 )
                return ngDialog.open( {
                    templateUrl: 'modals/login.pug',
                    controller: 'modals/login',
                    showClose: false,
                    className: 'login'
                } );

            $location.path( '/error/' + response.status );

        } );




    $scope.select = function select( id ) {
        retrieveItem( id );
        $location.path(
            '/' + $scope.$root.__module.name +
            '/' + id +
            '/' + ( $scope.__view || '' )
        );
    }

    $scope.tab = function tab( name ) {
        $location.path(
            '/' + $scope.$root.__module.name +
            '/' + $scope.__id +
            '/' + name
        );
    }

    $scope.scroll = function scroll( event ) {
        var elem = event.target;
        var header = elem.querySelectorAll( 'th' );
        for ( var i = 0; i < header.length; i++ ) {
            header[ i ].style.top = elem.scrollTop + 'px';
        };
    }

    $scope.isArray = angular.isArray;

    $scope.save = function save() {

        if ( !$scope.item || !$scope.__id )
            return console.warn( 'No item to save' );

        $http.put( $scope.$root.__module.api + '/' + $scope.__id, $scope.item )
            .then( function success() {
                console.info( 'Saved!' );
                $scope.item.__saved = true;
            }, function error( err ) {
                console.error( err );
                $scope.item.__failed = true;
            } )

    }

    function retrieveItem( id ) {
        $scope.item = undefined;
        $http.get( $scope.$root.__module.api + '/' + id )
            .then( function success( response ) {
                $scope.item = response.data
            }, function error( response ) {
                $location.path( '/error/' + response.status );
            } );
        // if ( $scope.$root.__module.config.tabs[ __view ].controller )
        //     $scope.ctrl = $controller( $root.__module.config.tabs[ __view ].controller, {
        //         $scope: $scope
        //     } );
    }



} );
