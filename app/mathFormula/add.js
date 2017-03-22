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

        // Start requests by filter
        $scope.filters.forEach( function foreach( active, filter ) {

            // If the filter is disabled, stop here
            if ( !active ) return;

            // Be sure that the lastRequest exists for this filter
            if ( !lastRequest[ filter ] ) lastRequest[ filter ] = {};

            // If the search is identical at the last time,
            // copy last response & stop here
            if ( lastRequest[ filter ].search == $scope.search )
                return addResults( lastRequest[ filter ].results, filter );

            // Do the request to the API
            $http.get( '/api/' + filter )
                .then( function success( response ) {

                    // Get the returned list
                    var data = response.data;
                    if ( data.data ) data = data.data;

                    // Add them
                    return addResults( data, filter );

                }, console.error );

        } );
    }

    /**
     * addResults( data, kind )
     * Add the results of devices, smartdevices and tags
     *
     * @param {Array} data Items to add
     * @param {String} kind Filter that triggered this result
     */
    function addResults( data, kind ) {

        data.forEach( function foreach( item ) {

            // Populate the results
            $scope.results[ kind + ':' + item._id ] = {
                _id: item._id,
                name: item.name,
                kind: kind,
                types: item.last ? Object.keys( item.last ) : []
            };

        } );

    }

} );
