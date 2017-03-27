app.controller( 'mathFormula/add', function (
    $scope,
    $http
) {

    // Empty object
    $scope.input = {};

    // Default tab
    $scope.tabview = 'details';

    // Filters for device selection
    $scope.search = '';
    $scope.filters = {
        devices: true,
        smartdevices: true,
        tags: true
    };

    // Avoid flood by stopping identical send & by iterating requests
    var lastRequests = {};

    /**
     * getDevices()
     * Get the devices, smartdevices and tags to select one of them
     */
    function getDevices() {

        // Clean results
        $scope.results = [];

        var allFiltersDisabled = !Object.keys( $scope.filters )
            .some( function ( filter ) {
                return $scope.filters[ filter ];
            } );

        // Start requests by filter
        Object.keys( $scope.filters )
            .forEach( function foreach( filter ) {

                // If the filter is disabled, stop here (except all filters are disabled)
                if ( !allFiltersDisabled && !$scope.filters[ filter ] )
                    return console.log( filter, 'disabled' );

                // Be sure that the lastRequest exists for this filter
                if ( !lastRequests[ filter ] ) lastRequests[ filter ] = {};

                // If the search is identical at the last time,
                // copy last response & stop here
                if ( lastRequests[ filter ].search == $scope.search )
                    return addResults( lastRequests[ filter ].results, filter );

                // Save last search
                lastRequests[ filter ].search = angular.copy( $scope.search );

                // Do the request to the API
                $http.get( '/api/' + filter + '?search=' + $scope.search )
                    .then( function success( response ) {

                        // Get the returned list
                        var data = response.data;
                        if ( data.data ) data = data.data;

                        // Add them in the scope
                        lastRequests[ filter ].results = data;
                        return addResults( data, filter );

                    }, console.error );

            } );
    }

    // Determine watchers in scope (all filters + search query)
    var wg = Object.keys( $scope.filters )
        .map( function ( filter ) {
            return 'filters.' + filter;
        } );
    wg.push( 'search' );
    $scope.$watchGroup( wg, getDevices );

    function getVar() {

        if ( !$scope.input ) return;
        if ( !$scope.input.varName ) return;
        if ( !$scope.input.device ) return;
        if ( !$scope.input.device._id ) return;
        if ( !$scope.input.device.kind ) return;
        if ( !$scope.input.type ) return;

        $http.post( '/api/rules/getVars', {
                inputs: [ {
                    id: $scope.input.device._id,
                    kind: $scope.input.device.kind,
                    varName: $scope.input.varName,
                    type: $scope.input.type,
                    time: $scope.input.time
                } ]
            } )
            .then( function success( d ) {
                var vn = $scope.input.varName;
                $scope.inputValue = d.data[ vn ];
            }, console.error );
    }
    $scope.$watchGroup( [ 'input.type', 'input.device', 'input.device.id', 'input.device.kind' ], getVar );

    /**
     * addResults( data, kind )
     * Add the results of devices, smartdevices and tags
     *
     * @param {Array} data Items to add
     * @param {String} kind Filter that triggered this result
     */
    function addResults( data, kind ) {

        if ( !data ) return;

        data.forEach( function foreach( item ) {

            // Create object
            var res = {
                _id: item._id,
                name: item.name || item._id,
                kind: kind,
                types: []
            };

            if ( item.last )
                Object.keys( item.last )
                .forEach( function foreach( t ) {
                    if ( !~res.types.indexOf( item.last[ t ].type ) )
                        res.types.push( item.last[ t ].type );
                } );

            // Populate the results
            $scope.results.push( res );

        } );

    }

    $scope.selectResult = function selectResult( result ) {
        $scope.input.device = result;
        $scope.tabview = 'details';
    };

    $scope.badName = function badName( varName ) {

        if ( !varName ) return true;

        if ( ~[
                'pi',
                'e',
                'sin',
                'cos',
                'min',
                'max',
                'avg',
                'sqrt',
                'log',
                'exp',
                'tau',
                'phi',
                'PI',
                'E',
                'SQRT2',
                'null',
                'undefined',
                'NaN',
                'LN2',
                'LN10',
                'LOG2E',
                'LOG10E',
                'Infinity',
                'i',
                'uninitialized',
                'version',
                'add',
                'cub',
                'divide',
                'ceil',
                'hypot',
                'floor',
                'exp',
                'fix',
                'mod',
                'round',
                'sign',
                'sqrt',
                'square',
                'substract',
                'pow',
                'norm',
                'xgcd',
                'unit',
                'to',
                'in',
                'not',
                'true',
                'false',
                'equal',
                'g',
                's',
                'm',
                'h',
                'l',
                'b'
            ].indexOf( varName ) )
            return true;

        if ( !varName.match( /^[a-z_][a-z0-9_]*$/i ) )
            return true;

        if ( !$scope.inputs )
            return false;

        return $scope.inputs.some( function ( i ) {
            return ( varName == i.varName );
        } );

    };

} );
