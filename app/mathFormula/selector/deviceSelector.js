app.directive('deviceSelectorContainer', function($http){
  return {
    restrict: 'A',
    scope: {
      containerTitle: '@?containerTitle',
      allowedFilters: '=?filters',
      hideFilterButtons: '=?'
    },
    transclude: true,
    templateUrl: 'mathFormula/selector/deviceSelectorContainer.pug',
    controller: function($element, $scope){

          var selectDeviceScope;

          $scope.showMe = false;
          $scope.showTemplate = function(bool){
            $scope.showMe = bool;
          }
          this.showTemplate = $scope.showTemplate;
          this.setSelectDeviceScope = function(seScope){
            selectDeviceScope = seScope;
          };

          console.log("mathFormula/selector deviceSelectorContainer");

          // Empty object
          $scope.input = {};

          // Default tab
          $scope.tabview = 'details';

          // Filters for device selection
          $scope.query = {
            search:''
          };

          // Default filter
          $scope.filters = {
              devices: false,
              smartdevices: false,
              tags: false
          };

          // remove disallowed filters
          if(angular.isArray($scope.disallowFilters)){
            $scope.disallowFilters.forEach(function(key){
              if(typeof $scope.filters[key] != "undefined"){
                delete $scope.filters[key];
              }
            });
          }

          // add allowed filters
          if(angular.isArray($scope.allowedFilters)){
            $scope.filters = {};
            $scope.allowedFilters.forEach(function(key){
              $scope.filters[key] = false;
            });
          }

          $scope.$watch("allowedFilters",function(nv){
            if(angular.isArray(nv)){
              $scope.filters = {};
              $scope.allowedFilters.forEach(function(key){
                $scope.filters[key] = false;
              });
              getDevices();
            }
          });

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
                      if ( lastRequests[ filter ].search == $scope.query.search )
                          return addResults( lastRequests[ filter ].results, filter );

                      // Save last search
                      lastRequests[ filter ].search = angular.copy( $scope.query.search );

                      // Do the request to the API
                      $http.get( '/api/' + filter + '?search=' + $scope.query.search )
                          .then( function success( response ) {

                              if ( lastRequests[ filter ].search != $scope.query.search )
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
          wg.push( 'query.search' );
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

              // Search the value
              $http.post( '/api/rules/getVars', {
                      inputs: [ {
                          id: $scope.input.device._id,
                          kind: $scope.input.device.kind,
                          varName: $scope.input.varName,
                          type: $scope.input.type[ 0 ],
                          indice: $scope.input.type[ 1 ],
                          time: $scope.input.time
                      } ]
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
                      Object.keys( item.last )
                      .forEach( function foreach( t ) {
                          var type = [ item.last[ t ].type, item.last[ t ].id ];
                          if ( !~res.types.indexOf( type ) )
                              res.types.push( type );
                      } );

                  // Populate the results
                  $scope.results.push( res );

              } );

          }

          // Select the line as input
          $scope.selectResult = function selectResult( result ) {
              $scope.input.device = result;
              if ( result.kind == 'tags' )
                  $scope.input.device._id = [ result._id ];
              $scope.tabview = 'details';
              if(selectDeviceScope){
                selectDeviceScope.selectResult($scope.input.device);
              }
              $scope.showTemplate(false);
          };

          $scope.selectTag = function selectTag( result ) {
              $scope.input.device._id.push( result._id );
              $scope.tabview = 'details';
          };

          $scope.tab = function tab( name ) {
              $scope.tabview = name;
          };

          $scope.rmTag = function rmTag( i ) {
              $scope.input.device._id.splice( i, 1 );
              if ( !$scope.input.device._id.length )
                  delete $scope.input.device;
          };

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
      }
    };
});

app.directive('deviceSelector', function($q, $timeout){
  return {
    require: ['^deviceSelectorContainer'],
    templateUrl: 'mathFormula/selector/deviceSelector.pug',
    scope: {
      onChange: '='
    },
    link: function(scope, element, attrs, ctrls){
      //scope.tabview = scope.template;//"custom/modals/selectSmartDeviceForBuildings.pug";
      var deviceSelectorCtrl = ctrls[0];
      scope.tabview = "";
      scope.device = {};
      deviceSelectorCtrl.setSelectDeviceScope(scope);
      scope.showSelectDevice = function(){
        deviceSelectorCtrl.showTemplate(true);
      }

      scope.selectResult = function(device){
        scope.device = device;
        deviceSelectorCtrl.showTemplate(false);
        scope.onChange(scope.device);
      }

      scope.rmDevice = function(){
        scope.device = {};
        scope.onChange();
      };
    }
  }
});
