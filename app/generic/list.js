app.controller( 'generic/list', function ( $scope, $http, $location, ngDialog, $q ) {
    if ( $scope.__id ) retrieveItem( $scope.__id );

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
    getlist( true );
    $scope.$watch( 'search', getlist );
    $scope.$watch( 'status', getlist );
    $scope.$watchCollection( 'sorting', getlist );

    var cvr;

    function cleanVisualReturn( n ) {
        if ( !n ) return;
        if ( cvr ) clearTimeout( cvr );
        cvr = setTimeout( function () {
            $scope.item.__saved = false;
            $scope.item.__failed = false;
        }, 3000 );
    }
    $scope.$watch( 'item.__saved', cleanVisualReturn );
    $scope.$watch( 'item.__failed', cleanVisualReturn );

    $scope.$watch( '__view', function loadView() {
        if ( typeof $scope.__view === "undefined" ) {
            $scope.fields = [];
        } else {
            $scope.fields = $scope.$root.__module.config.tabs[ $scope.__view || '' ].fields;
        }
    } );

    var isLoading = false;
    $scope.reqID = 0;
    $scope.data = [];
    $scope.tags = [];

    function getlist( n, o ) {
        var page = 0;
        var reqID = parseInt( ++$scope.reqID );
        if ( o == n ) return;
        if ( n !== true ) $scope.data = [];
        if ( $scope.$root.__module.controller != 'generic/list' ) return;
        isLoading = true;
        $scope.total = undefined;
        var url = $scope.$root.__module.api + '?sort=' + ( $scope.sorting ? $scope.sorting.col : '_id' ) + '&order=' + ( $scope.sorting ? $scope.sorting.order : 'asc' );
        if ( $scope.status ) url += '&status=' + $scope.status;
        if ( $scope.search )
            url += '&search=' + encodeURIComponent( $scope.search );
        if ( $scope.data && $scope.data.length ) {
            page = $scope.data.length / 100;
            url += '&limit=100&page=' + page;
        }
        $http.get( url )
            .then( function success( response ) {

                if ( !isNaN( reqID ) && $scope.reqID != reqID )
                    return console.warn( 'Response dropped', $scope.reqID, reqID );

                isLoading = false;

                if ( response.data.data ) {
                    if ( page )
                        response.data.data.forEach( function loop( i ) {
                            if ( $scope.data && !~$scope.data.indexOf( i ) )
                                $scope.data.push( i );
                        } );
                    else
                        $scope.data = response.data.data;
                } else if ( response.data instanceof Array )
                    response.data.forEach( function loop( i ) {
                        if ( $scope.data && !~$scope.data.indexOf( i ) )
                            $scope.data.push( i );
                    } );

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
                            } );
                    } );

            }, function error( response ) {
                isLoading = false;

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
        for ( var i = 0; i < header.length; i++ )
            header[ i ].style.top = elem.scrollTop + 'px';
        if ( ( elem.scrollTop + elem.offsetHeight + 300 ) > elem.scrollHeight )
            getlist( true );
    };

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
            .then( function success( res ) {
                $scope.__validation = [];

                // Update list
                if ( res.data && res.data._id ) {
                    $scope.item = angular.copy( res.data );
                    $scope.data.some( function ( v, i ) {

                        // Not this one, continue the search
                        if ( v._id !== res.data._id )
                            return false;

                        // Same ID, replace it and stop search
                        $scope.data[ i ] = angular.copy( res.data );
                        return true;

                    } );
                }

                $scope.item.__saved = true;
                $scope.item.__failed = false;
            }, function error( err ) {
                console.error( err );
                $scope.item.__failed = true;
                $scope.item.__saved = false;

                if ( err.status == 400 && err.data && err.data.validation )
                    $scope.__validation = err.data.validation.keys;
            } );

    };

    $scope.loadTags = function ( query ) {
        var deferred = $q.defer();

        $http.get( $scope.$root.__module.api + '/tags/' + query )
            .then( function success( response ) {
                deferred.resolve( response.data );
            }, function error( response ) {
                $location.path( '/error/' + response.status );
            } );

        return deferred.promise;
    };

    function retrieveTags() {
        if ( $scope.$root.__module.api == "/api/devices" || $scope.$root.__module.api == "/api/smartdevices" ) {
            $http.get( $scope.$root.__module.api + '/tags' )
                .then( function success( response ) {
                    $scope.tags = response.data;
                }, function error( response ) {
                    $location.path( '/error/' + response.status );
                } );
        }
    }

    /**
     * Use the webservice to retrieve the complete selected item
     *
     * @arg {String} id Id of the selected item to be retrieved
     */
    function retrieveItem( id ) {
        if ( !id ) return console.warn( 'No ID' );
        $scope.__validation = [];

        // Load controller
        if ( $scope.$root.__module.config && $scope.$root.__module.config.tabs && $scope.$root.__module.config.tabs[ $scope.__view || "" ].controller )
            return ( $scope.ctrl = $controller( $root.__module.config.tabs[ $scope.__view || "" ].controller, {
                $scope: $scope
            } ) );

        // Clean item
        $scope.item = undefined;

        // Get item from API
        $http.get( $scope.$root.__module.api + '/' + id )
            .then( function success( response ) {
                $scope.item = response.data;
            }, function error( response ) {
                $location.path( '/error/' + response.status );
            } );
    }

    $scope.isTimedOut = function isTimedOut( row ) {
        if ( !row.timeout || !row.timestamp )
            return false;
        return ( ( row.timestamp + ( row.timeout * 60000 ) ) < Date.now() );
    };

} );
