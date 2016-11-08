app.controller( 'generic/list', function ( $scope, $http, $location, ngDialog ) {
    if ( $scope.__id ) retrieveItem( $scope.__id );

    $scope.buttons = [];
    $scope.buttons[ "add" ] = function add() {
        return ngDialog.open( {
            templateUrl: 'modals/addElement.pug',
            controller: 'modals/addElement',
            showClose: true,
            className: 'addElement'
        } );

        $scope.open = true;
    };

    $scope.buttons[ "own" ] = function own() {
        return ngDialog.open( {
            templateUrl: 'modals/own.pug',
            controller: 'modals/own',
            showClose: true,
            className: 'own'
        } );
    };


    $scope.$root.__module.toolbox = {};
    if ( $scope.$root.__module.buttons ) {
        $scope.$root.__module.buttons.forEach( function ( button ) {
            if ( $scope.buttons[ button ] ) {
                $scope.$root.__module.toolbox[ button ] = $scope.buttons[ button ];
            }

        } );
    }

    $scope.sorting = {
        col: '_id',
        order: 'asc'
    };
    $scope.orderBy = function orderBy( col ) {
        if ( $scope.sorting.col != col )
            return ( $scope.sorting = {
                col: col,
                order: 'asc'
            } );
        $scope.sorting.order = ( $scope.sorting.order == 'asc' ) ? 'desc' : 'asc';
    };

    /**
     * Retrieve the list from the webservice
     */
    $scope.$watch( 'search', getlist );
    $scope.$watch( 'status', getlist );
    $scope.$watchCollection( 'sorting', getlist );

    function getlist() {
        $scope.total = undefined;
        var url = $scope.$root.__module.api + '?sort=' + ($scope.sorting)?$scope.sorting.col:'' + '&order=' + ($scope.sorting)?$scope.sorting.order:'';
        if( $scope.status ) url += '&status=' + $scope.status;
        if( $scope.search )
            url += '&search=' + encodeURIComponent( $scope.search );
        $http.get( url )
            .then( function success( response ) {

                if ( response.data.data )
                    $scope.data = response.data.data;
                else if ( response.data instanceof Array )
                    $scope.data = response.data;
                else
                    $scope.data = [];

                $scope.total = response.data.recordsFiltered;

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
    }


    /**
     * Select an item on the list
     *
     * @arg {String} id Id of the item to be selected
     */
    $scope.select = function select( id ) {
        retrieveItem( id );
        $location.path(
            '/' + $scope.$root.__module.name +
            '/' + id +
            '/' + ( $scope.__view || '' )
        );
    };

    /**
     * Select another tabview
     *
     * @arg {String} name Name of the tabview to be active
     */
    $scope.tab = function tab( name ) {
        $location.path(
            '/' + $scope.$root.__module.name +
            '/' + $scope.__id +
            '/' + name
        );
    };

    /**
     * Scrolling handler ( infinite scroll + header mover )
     *
     * @arg {Event} event Native JS scroll event
     */
    $scope.scroll = function scroll( event ) {
        var elem = event.target;
        var header = elem.querySelectorAll( 'th' );
        for ( var i = 0; i < header.length; i++ ) {
            header[ i ].style.top = elem.scrollTop + 'px';
        };
    }

    // Give access to the isArray function on the view
    $scope.isArray = angular.isArray;

    /**
     * Save the current item
     *
     * @return $scope.item.__saved
     * @throws $scope.item.__failed
     */
    $scope.save = function save() {

        if ( !$scope.item || !$scope.__id )
            return console.warn( 'No item to save' );

        $scope.item.__failed = $scope.item.__success = false;

        $http.put( $scope.$root.__module.api + '/' + $scope.__id, $scope.item )
            .then( function success() {
                console.info( 'Saved!' );
                $scope.item.__saved = true;
            }, function error( err ) {
                console.error( err );
                $scope.item.__failed = true;
            } );

    }

    /**
     * Use the webservice to retrieve the complete selected item
     *
     * @arg {String} id Id of the selected item to be retrieved
     */
    function retrieveItem( id ) {
        $scope.item = undefined;
        $http.get( $scope.$root.__module.api + '/' + id )
            .then( function success( response ) {
                $scope.item = response.data
            }, function error( response ) {
                $location.path( '/error/' + response.status );
            } );
        if ( $scope.$root.__module.config.tabs[ $scope.__view || "" ].controller )
            $scope.ctrl = $controller( $root.__module.config.tabs[ $scope.__view || "" ].controller, {
                $scope: $scope
            } );
    }



} );
