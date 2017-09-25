app.controller( 'generic/list', function (
    $scope,
    $http,
    $location,
    ngDialog,
    $q,
    $timeout,
    $window,
    $filter,
    listViewService
) {
    if ( $scope.__id ) retrieveItem( $scope.__id );

    $scope.visibleColumns = [];
    $scope.columns = [];
    $scope.$watchCollection('visibleColumns', function(nv){
      if(!$scope.listViewConfig) return;
      if(!$scope.listViewConfig.selectColumns) return;

      $scope.columns = $scope.columns.map(function(c, i){
        var r = c;
        if(angular.isString(c)){
          r = {key: c};
        }
        if(nv.some(function(s){
          return s.id == i;
        })){
          r.hide= false;
        }
        else{
          r.hide = true;
        }
        return r;
      });
      $timeout(function(){
        listViewService.emit('resize');
      }, 100);
  });

    var lastCall = {
      timestamp: 0,
      url: ''
    };

    $scope.sorting = {
        col: '_id',
        order: 'asc'
    };

    $scope.filtered = 0;

    $scope.orderBy = function orderBy( col, order ) {
        $scope.sorting = {
            col: col,
            order: order
        };
        /*if ( $scope.sorting.col != col )
            return ( $scope.sorting = {
                col: col,
                order: 'asc'
            } );
        $scope.sorting.order = ( $scope.sorting.order == 'asc' ) ? 'desc' : 'asc';*/
    };

    if ( $scope.$root.__module.config && $scope.$root.__module.config.listView && angular.isObject( $scope.$root.__module.config.listView ) )
    {
      $scope.listViewConfig = $scope.$root.__module.config.listView;
      $scope.sorting = $scope.listViewConfig.defaultSort || $scope.sorting;
    }
    else {
        $scope.listViewConfig = {};
    }

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
        $scope.fields = $scope.$root.__module.config.tabs[ $scope.__view || '' ].fields || [];
        $scope.buttons = $scope.$root.__module.config.tabs[ $scope.__view || '' ].buttons || [];
        //all defaults
        $scope.defaults = angular.isObject( $scope.$root.__module.config.defaults ) ? $scope.$root.__module.config.defaults : {};
        $scope.fieldsType = $scope.$root.__module.config.tabs[ $scope.__view || '' ].fieldsType || {};
    } );

    var isLoading = false;
    $scope.reqID = 0;
    $scope.data = [];
    $scope.tags = [];
    $scope.page = 0;

    function getlist( n, o ) {

        // Delegate to custom controller
        if ( $scope.$root.__module.controller != 'generic/list' ){
          return;
        }

        var page = 0;
        if ( o == n ) {
          return;
        }
        if ( n !== true ) {
            $scope.total = undefined;
            $scope.filtered = undefined;
            $scope.data = [];
        }
        if ( $scope.data && $scope.filtered <= $scope.data.length ) return;
        isLoading = true;

        var urlConfig = {
            url: $scope.$root.__module.api,
            method: 'GET',
            params: {}
        };

        urlConfig.params.sort = ( $scope.sorting ? $scope.sorting.col : $scope.default.sorting ? $scope.default.sorting.col : "_id" );
        urlConfig.params.order = ( $scope.sorting ? $scope.sorting.order : $scope.default.sorting ? $scope.default.sorting.order : 'asc' );

        var url = $scope.$root.__module.api + '?sort=' + ( $scope.sorting ? $scope.sorting.col : '_id' ) + '&order=' + ( $scope.sorting ? $scope.sorting.order : 'asc' );

        if ( $scope.status ) {
            urlConfig.params.status = $scope.status;
            url += "&status=" + $scope.status;
        }

        if ( $scope.search ) {
            urlConfig.params.search = encodeURIComponent( $scope.search );
            url += "&search=" + encodeURIComponent( $scope.search );
        }

        urlConfig.params.limit = 100;
        url += "&limit=100";

        if ( $scope.data && $scope.data.length ) {
            page = $scope.data.length / 100;
            urlConfig.params.page = Math.floor( page );
            url += "&page=" + Math.floor( page );
        } else {
            url += "&page=0";
            urlConfig.params.page = 0;
        }

        if ( lastCall.timestamp + 1000 < Date.now() && lastCall.url != url  ) {
          console.groupCollapsed( '[generic/list] URL' );
          console.log( 'previous:', lastCall.url );
          console.log( 'current:', url );
          console.groupEnd();

            lastCall = {
                url: url,
                timestamp: Date.now()
            };
            var reqID = parseInt( ++$scope.reqID );
            $http( urlConfig )
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

                    $scope.filtered = response.data.recordsFiltered;
                    $scope.total = response.data.recordsTotal;

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

                    $scope.scrollBody = document.querySelector( '.dataTables_scrollBody' );

                    $scope.first = $scope.filtered == 0 ? 0 : 1;
                    $scope.last = $scope.filtered;

                }, function error( response ) {
                    isLoading = false;
                    errorHandler( response );
                } );
        }
        else{
          console.debug(url, "equals", lastCall.url);
        }
    }


    /**
     * Select an item on the list
     *
     * @arg {String} id Id of the item to be selected
     */
    $scope.select = function select( id ) {
        if ( !$scope.item || $scope.item._id != id ) {
            retrieveItem( id );
            $location.path(
                '/' + $scope.$root.__module.name +
                '/' + id +
                '/' + ( $scope.__view || '' )
            );
        }
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

    $scope.loadMore = function () {
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

        //If there are date fields and the date is not valid, delete them
        if ( angular.isArray( $scope.item.__dateFields ) ) {
            $scope.item.__dateFields.forEach( function ( field ) {
                if ( !$scope.item[ field ] || ( $scope.item[ field ] && isNaN( $scope.item[ field ].getTime() ) ) ) {
                    if ( $scope.item[ field ] !== null )
                        delete $scope.item[ field ];
                }
            } );
        }

        //If there are readonlyFields, delete them
        if ( angular.isArray( $scope.item.__readonlyFields ) ) {
            $scope.item.__readonlyFields.forEach( function ( field ) {
                if ( $scope.item[ field ] ) {
                    delete $scope.item[ field ];
                }
            } );
        }

        // Delete last (avoid 413 Too large)
        if(angular.isArray($scope.item.last)){
          delete $scope.item.last;
        }

        var payload = angular.copy($scope.item);

        //__formatSubmit
        if ( $scope.item.__formatSubmit && angular.isObject( $scope.item.__formatSubmit ) ) {
            Object.keys($scope.item.__formatSubmit).forEach(
              function(field){
                if(payload[field] && angular.isObject(payload[field]) && $scope.item.__formatSubmit[field]){
                  payload[field] = payload[field][$scope.item.__formatSubmit[field]];
                }
              }
            );
            delete payload.__formatSubmit;
        }


        var api = $scope.$root.__module.editApi || $scope.$root.__module.api;

        $http.put( api + '/' + $scope.__id, payload )
            .then( function success( res ) {
                $scope.__validation = [];

                // Update list
                if ( res.data && res.data._id ) {
                    $scope.item = angular.copy( res.data );

                    formatItemFieldType();

                    toastr.success(
                        $filter( 'translate' )( 'The element has been saved:' + $scope.$root.__module.name ),
                        $filter( 'translate' )( 'Saved' )
                    );
                    $scope.data.some( function ( v, i ) {

                        // Not this one, continue the search
                        if ( v._id !== res.data._id )
                            return false;

                        // Same ID, replace it and stop search
                        $scope.data[ i ] = angular.copy( res.data );
                        return true;

                    } );
                }


            }, function error( err ) {
                console.error( err );

                toastr.error(
                    $filter( 'translate' )( 'Error during saving' ),
                    $filter( 'translate' )( err.toString() )
                );

                if ( err.status == 400 && err.data && err.data.validation )
                    $scope.__validation = err.data.validation.keys;

                else errorHandler( err );
            } );

    };

    $scope.loadTags = function ( query ) {
        var deferred = $q.defer();

        $http.get( $scope.$root.__module.api + '/tags/' + query )
            .then( function success( response ) {
                deferred.resolve( response.data );
            }, function error( response ) {} );

        return deferred.promise;
    };

    function retrieveTags() {
        if ( $scope.$root.__module.api == "/api/devices" || $scope.$root.__module.api == "/api/smartdevices" ) {
            $http.get( $scope.$root.__module.api + '/tags' )
                .then( function success( response ) {
                    $scope.tags = response.data;
                }, errorHandler );
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
        //$scope.item = undefined;

        var api = $scope.$root.__module.editApi || $scope.$root.__module.api;

        // Get item from API
        $http.get( api + '/' + id )
            .then( function success( response ) {
                $scope.item = response.data;
            }, function ( response ) {
                errorHandler( response );
                $location.path( '/' + $scope.$root.__module.name );
            } );
    }

    /**
     * Uses 'fieldType' property in tab config to format item's properties
     *
     */
    function formatItemFieldType(){
      if(!($scope.item && angular.isObject($scope.item)))
          return;
      // fieldsType
      var types = ["string", "object", "number"];
      if(Object.keys($scope.fieldsType).length){
        Object.keys($scope.fieldsType).forEach(function(p){
          var type = $scope.fieldsType[p];
          if(types.indexOf(type) > -1){
            if(type == "string" && angular.isObject($scope.item[p])){
              $scope.item[p] = $scope.item[p]._id;
            }
          }else{
            if(angular.isObject($scope.item[p])){
              $scope.item[p] = $scope.item[p][type];
            }
          }
        });
      }
    }

    function errorHandler( response ) {

        if ( response.status == 401 )
            return $location.path( '/' );

        if ( window.clientInformation && !window.clientInformation.onLine )
            response.statusText = "You seems to be offline";

        else if ( response.status == -1 )
            response.statusText = "Server not available";

        var errkind = 'error';
        if ( response.status >= 500 )
            errkind = 'warning';

        toastr[ errkind ](
            $filter( 'translate' )( response.statusText ),
            $filter( 'translate' )( 'Error' ) + ' ' + response.status
        );

    }
} );
