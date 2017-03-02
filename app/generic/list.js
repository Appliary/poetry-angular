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

    $scope.$watch( '__view', function loadView() {
        if ( typeof $scope.__view === "undefined" ) {
            $scope.fields = [];
        } else {
            $scope.fields = $scope.$root.__module.config.tabs[ $scope.__view || '' ].fields;
        }
    } );

    var isLoading = false;
    $scope.data = [];
    $scope.tags = [];

    function getlist( n, o ) {
        var page = 0;
        if ( o == n || isLoading ) return;
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
            .then( function success( smartdevice ) {
                console.info( 'Saved!', smartdevice );
                $scope.__validation = [];
                $scope.item.__saved = true;
                $scope.item.__failed = false;

                // Update list
                $scope.data.some( function ( v, i ) {

                    // Not this one, continue the search
                    if ( v._id !== smartdevice._id )
                        return false;

                    // Same ID, replace it and stop search
                    $scope.data[ i ] = smartdevice;
                    return true;

                } );
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


    // Get validation object
    $http.put( '/__joi' + $scope.$root.__module.api + '/id' )
        .then( function success( response ) {
            if ( !response.data.payload._inner || !response.data.payload._inner.children )
                return ( $scope.__joi = response.data.payload );

            $scope.__joi = {};
            response.data.payload._inner.children.forEach( function ( elem ) {
                $scope.__joi[ elem.key ] = elem.schema;
            } );
        }, function error( err ) {} );

    $scope.inputType = function ( name ) {
        try {
            // If there's no validation
            if ( !$scope.__joi )
                return 'string';

            if ( !$scope.__joi.computed && $scope.__joi._type != 'alternatives' )
                $scope.__joi.computed = $scope.__joi;

            // Id are not localized
            if ( name === '_id' )
                return 'id';

            // Readonly specials
            if ( $scope.item[ name ] ) {
                if ( $scope.item[ name ].name ) return 'readOnlyName';
                if ( $scope.item[ name ].id ) return 'readOnlyId';
                if ( $scope.item[ name ]._id ) return 'readOnly_Id';
            }

            // Return the type if in the list
            if ( ~[
                    'array',
                    'boolean',
                    'date'
                ].indexOf( $scope.__joi.computed[ name ]._type ) )
                return $scope.__joi.computed[ name ]._type;

            // Strings
            if ( $scope.__joi.computed[ name ]._type == 'string' ) {

                // Special strings
                if ( ~$scope.__joi.computed[ name ]._tags.indexOf( 'password' ) )
                    return 'password';
                if ( ~$scope.__joi.computed[ name ]._tags.indexOf( 'textarea' ) )
                    return 'textarea';

                // Select enums
                if ( $scope.__joi.computed[ name ]._flags.allowOnly )
                    return 'enum';

                // Default string otherwise
                return 'string';

            }

            // Numbers
            if ( $scope.__joi.computed[ name ]._type == 'number' ) {

                // With an unit
                if ( $scope.__joi.computed[ name ]._unit )
                    return 'unit';

                // Default number
                return 'number';

            }

            // Default readonly
            return 'readOnly';

        } catch ( e ) {
            return 'readOnly';
        }

    };

    $scope.inputVisible = function ( name ) {

        // If not alternatives
        if ( $scope.__joi._type != 'alternatives' ) {
            if ( !$scope.__joi.computed )
                $scope.__joi.computed = $scope.__joi;
            return true;
        }

        if ( !$scope.__joi.af ) {

            // Get the field that defines which alt
            $scope.__joi.af = $scope.__joi._inner.matches[ 0 ].schema._inner.children.some( function ( a, i ) {
                try {
                    if ( a._valids._set.length == 1 ) return i;
                } catch ( e ) {}
            } );

            // Failed, show anyway
            if ( !$scope.__joi.af )
                return true;

        }

        if ( !$scope.__joi.alt ) {

            // Get the alts
            $scope.__joi.alt = {};
            $scope.__joi._inner.matches.forEach( function ( a ) {
                $scope.__joi.alt[ a.schema._inner.children[ $scope.__joi.af ]._valids._set[ 0 ] ] = a.schema._inner.children;
            } );

        }

        $scope.__joi.computed = $scope.__joi.alt[ $scope.item[ $scope.__joi.af ] ];

        if ( name == $scope.__joi.af )
            return true;

        if ( $scope.__joi.computed[ name ] ) return true;

        return false;

    };

} );
