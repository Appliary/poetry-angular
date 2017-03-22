app.controller( 'mathFormula/add', function (
    $scope,
    $http
) {

    // Tabs
    $scope.tabs = [
        'devices',
        'details'
    ];
    $scope.tabview = $scope.tabs[ 0 ];

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
        $scope.results = {};

        var allFiltersDisabled = Object.keys( $scope.filters )
            .some( function ( filter ) {
                return $scope.filters[ filter ];
            } );

        // Start requests by filter
        Object.keys( $scope.filters )
            .forEach( function foreach( filter ) {

                // If the filter is disabled, stop here (except all filters are disabled)
                if ( !allFiltersDisabled && !$scope.filters[ filter ] )
                    return;

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

    /**
     * addResults( data, kind )
     * Add the results of devices, smartdevices and tags
     *
     * @param {Array} data Items to add
     * @param {String} kind Filter that triggered this result
     */
    function addResults( data, kind ) {

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
                    if ( !~res.types.indexOf( t.type ) )
                        res.types.push( t.type );
                } );

            // Populate the results
            $scope.results[ item._id + ':' + kind ] = res;

        } );

    }

    $scope.selectResult = function selectResult( result ) {
        $scope.input.device = result;
        $scope.tabview = 'details';
    };

} );
