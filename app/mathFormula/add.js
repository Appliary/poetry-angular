app.controller( 'mathFormula/add', function (
    $scope,
    $http
) {

    // Empty object
    $scope.input = {};

    // Default tab
    $scope.tabview = 'details';

    console.log("config", $scope.mathFormulaConfig);

    // Filters for device selection
    $scope.search = '';
    $scope.filters = {
        devices: false,
        smartdevices: false,
        tags: false
    };

    $scope.deviceSelectorOnChange = function(d){
      console.log("d",d);
    }

    // Avoid flood by stopping identical send & by iterating requests
    var lastRequests = {};

    // Pre configure form
    preConfigure();

    /**
    *
    * Fn to preconfigure input add form
    */
    function preConfigure(){
      console.log("%cpreConfigure","background-color: black; color: #2BFF00");
      var conf = $scope.mathFormulaConfig;
      if(!angular.isObject(conf))
        return;

      if(conf.filters){
        var cFilters = conf.filters;
        if(angular.isArray(cFilters)){
          $scope.deviceSelectorFilters = cFilters;
          $scope.filters = {};
          cFilters.forEach(
            function(elem){
              $scope.filters[elem] = false;
            }
          );
        }
      }

      if ( conf.hasOwnProperty( 'formulaInput' ) ) {
          $scope.formulaInput = conf.formulaInput;
      }
      else{
          $scope.formulaInput = true;
      }

      console.log("scope",$scope);
    }

    /**
     * getDevices()
     * Get the devices, smartdevices and tags to select one of them
     */
    function getDevices() {
      console.log("%cgetDevices","background-color: black; color: #2BFF00");
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

                var config = {
                  url: '/api/' + filter,
                  method: 'GET',
                  params: {
                    search: $scope.search
                  }
                };
                console.log($scope.filters);
                if(filter == "tags"){
                  config.params.collections = Object.keys( $scope.filters )
                  .map(function(col){
                    return col;
                  })
                  .filter(function(el){
                    return typeof el === 'string' && el != 'tags';
                  });

                  if(config.params.collections.length < 2){
                    delete config.params.collections;
                  }
                }

                $http( config )
                    .then( function success( response ) {

                        if ( lastRequests[ filter ].search != $scope.search )
                            return;

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
     * getVar()
     * Find the current value of the selected input
     */
    function getVar() {

        // Assure that every field is completed
        if ( !$scope.input ) return;
        if ( !$scope.input.varName ) return;
        if ( !$scope.input.device ) return;
        if ( !$scope.input.device._id ) return;
        if ( !$scope.input.device.kind ) return;
        if ( !$scope.input.type ) return;

        var payload = [ {
            id: $scope.input.device._id,
            kind: $scope.input.device.kind,
            varName: $scope.input.varName,
            type: $scope.input.type[ 0 ],
            indice: $scope.input.type[ 1 ],
            time: $scope.input.time
        } ];

        console.debug("PAYLOAD",payload);
        Object.keys($scope.input)
         .forEach(function(elem){
           console.log("%c"+elem+": "+JSON.stringify($scope.input[elem]),"background-color: black; color: #2BFF00");
         });

        // Search the value
        $http.post( '/api/rules/getVars', {
                inputs: payload
            } )
            .then( function success( d ) {
                var vn = $scope.input.varName;
                $scope.inputValue = d.data[ vn ];
            }, console.error );
    }
    // Fire the getVar() when input changes
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
              getItemLastTypes(item.last, res.types);


            // Populate the results
            $scope.results.push( res );

        } );

    }

    /**
     * getLastTypes( item, res )
     * Get types from item.last
     *
     * @param {Object} last Item.last
     * @param {Array} res Result
     */
    function getItemLastTypes( last, res ){
      Object.keys( last )
      .forEach( function foreach( t ) {
          var type = [ last[ t ].type, last[ t ].id ];
          if ( !~res.indexOf( type ) )
              res.push( type );

          /**
          * check inner attributes name if value is object
          */
          if(angular.isObject(last[t].value)){
            Object.keys( last[t].value )
              .forEach( function foreach( t ) {
                var ndType = [t, undefined]
                if ( !~res.indexOf( ndType ) )
                    res.push( ndType );
              } );
          }
      } );
    }

    // Select the line as input
    $scope.selectResult = function selectResult( result ) {
        $scope.input.device = result;
        if ( result.kind == 'tags' )
            $scope.input.device._id = [ result._id ];
        $scope.tabview = 'details';
    };

    $scope.selectTag = function selectTag( result ) {
        $scope.input.device._id.push( result._id );
        $scope.tabview = 'details';
    };

    $scope.tab = function tab( name ) {
        $scope.tabview = name;
        // prevent default select onClick event
        return false;
    };

    $scope.rmTag = function rmTag( i ) {
        $scope.input.device._id.splice( i, 1 );
        if ( !$scope.input.device._id.length )
            delete $scope.input.device;
    };

    $scope.isInvalid = function isInvalid( varName ){
      if($scope.formulaInput)
        return $scope.badName(varName) || !$scope.input.device || !$scope.input.type;
      else {
        return $scope.badName(varName) || !$scope.input.device;
      }
    }

    // Check varName validity
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
