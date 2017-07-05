/**
*
* TODO: clean up to make it understandable and maybe less restrictive when time is given
*/

app.directive("listDirective", function($http, $location, $timeout, ngDialog, AlertsService, $window){
  return {
    restrict: 'EA',
    transclude: false,
    templateUrl: "alertsList/list.pug",
    scope: {
        moduleApi: '@',
        columns: '=', //[string]

        urlApi: '@?',
        fields: '=?', //[string]

        searchable: '<?', //bool TODO (not yet implemented)
        selectable: '<?', //bool TODO (not yet implemented)
        sortable: '<?', //bool TODO (not yet implemented)
        hideFilters: '<?', //bool TODO
        alert: '<?', //bool
        defaults: '<?', //object
        properties: '<?' //object
    },
    link: function(scope, elem, attrs, ctrls){

      console.debug("appName", scope.$root.__appName);

      scope.genericApps = ['deviceManager'];
      scope.isGenericApp = function (){
        return genericApps.indexOf(scope.$root.__appName) > -1;
      }

      var directivePath = $location.path();

      scope.actionbtn = {};
      scope.maxDate = getDefaultMaxDateToString();

      if(!scope.urlApi){
        scope.urlApi = scope.moduleApi;
      }

      // default edit fields
      if(!angular.isArray(scope.fields)){
        scope.fields = [
          "_id",
          "createdAt",
          "rule",
          "source",
          "level",
          "category",
          "device",
          "message",
          "messageFR",
          "messageNL",
          "acknowledgedBy",
          "acknowledgedAt",
          "status",
          "notes"
        ];
      }
      //only one edit tab
      scope.tabs = [{"": {}}];

      ["defaults","properties"].forEach(function(k){
        if(!angular.isObject(scope[k])){
          scope[k] = {};
        }
      });

      ["searchable","selectable","sortable","alert"].forEach(function(k){
        if(!scope.hasOwnProperty(k)){
          scope[k] = true;
        }
      });

      function select( id ) {
          console.debug("search item", id);
          scope.__id = id;
          retrieveItem(id);
          /*$location.path(
              directivePath +
              '/' + id +
              '/'
          );*/
      }
      scope.select = select;

      function backToList(){
        delete scope.__id;
      }
      scope.backToList = backToList;


      function getDefaultMaxDateToString(){
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        if(dd<10)
          dd='0'+dd;
        if(mm<10)
          mm='0'+mm;
        return yyyy + '-' + mm + '-' + dd;
      }


      function isItem(data){
        return angular.isObject(scope.item) && (angular.isObject(data) && data._id && data._id == scope.item._id);
      }


      function responseHandler(r){
        if(!isItem(r.data)) return;

        scope.item.__saved = true;

        // replace in details
        scope.item = r.data;

        // replace in list
        if(angular.isArray(scope.data)){
          scope.data.forEach(function(el, idx){
            if(el._id == scope.item._id){
              scope.data[idx] = scope.item;
            }
          });
        }
      }

      function responseActionHandler(r){
        if(!isItem(r.data)) return;

        scope.actionbtn.__success = true;

        // replace in details
        scope.item = r.data;

        // replace in list
        if(angular.isArray(scope.data)){
          scope.data.forEach(function(el, idx){
            if(el._id == scope.item._id){
              scope.data[idx] = scope.item;
            }
          });
        }
      }

      function responseErrorHandler(e){
        console.warn(e);
        scope.item.__failed = true;
      }

      function responseErrorActionHandler(e){
        console.warn(e);
        scope.actionbtn.__failed = true;
      }

      // do
      function acknowledge(id){
        /*ngDialog.openConfirm( {
                templateUrl: 'modals/confirmation.pug',
                scope: scope
            } ).then(function(){*/
              $http.put('/api/alerts/'+id+'/ack').then(responseActionHandler,responseErrorActionHandler);
            //});
      }
      scope.acknowledge = acknowledge;

      // do
      function read(id){
        $http.put('/api/alerts/'+id+'/read').then(responseActionHandler,responseErrorActionHandler);
      }
      scope.read = read;

      // do
      function unacknowledge(id){
        $http.put('/api/alerts/'+id+'/ackUndo').then(responseActionHandler,responseErrorActionHandler);
      }
      scope.unacknowledge = unacknowledge;

      // do unread
      function unread(id){
        $http.put('/api/alerts/'+id+'/readUndo').then(responseActionHandler,responseErrorActionHandler);
      }
      scope.unread = unread;

      // do save
      function save(){
        $http.put('/api/'+scope.moduleApi+'/'+scope.item._id, scope.item).then(responseHandler,responseErrorHandler);
      }
      scope.save = save;

      // do sort
      function sort(col){
        console.log(col);
        if ( scope.sorting && scope.sorting.col == col )
          scope.sorting.order = ( scope.sorting.order == 'asc' ) ? 'desc' : 'asc';
        else
          scope.sorting = {
              col: col,
              order: 'asc'
          };

        getlist(true);
      }
      scope.sort = sort;

      var lastParams = {};
      var lastCall;
      function cleanData(){
        scope.total = undefined;
        scope.data = [];
      }
      function cleanLastCall(){
        lastParams = {};
        lastCall = (new Date()).getTime();
      }
      function saveLastCall(params){
        lastParams = params;
        lastCall = (new Date()).getTime();
      }
      function canCall(params){
        return !(lastParams.sort == params.sort
        && lastParams.order == params.order
        && lastParams.status == params.status
        && lastParams.search == params.search
        && lastParams.page == params.page
        && lastParams.limit == params.limit

        && lastParams.level == params.level
        && lastParams.category == params.category
        && lastParams.rule == params.rule
        && lastParams.before == params.before
        && lastParams.after == params.after
      );
      }

      /**
      * function
      * Builds params depending on filters and then calls function `callApi`
      */
      function getlist( cleanOldData ) {

          //var page = 0;
          //if ( o == n ) return;
          if ( cleanOldData === true ) {
              cleanData();
          }
          if ( scope.data && scope.total <= scope.data.length ) return;
          isLoading = true;

          var params = {};

          // sort & order
          params.sort = ( scope.sorting ? scope.sorting.col : scope.defaults.sorting ? scope.defaults.sorting.col : "_id" );
          params.order = ( scope.sorting ? scope.sorting.order : scope.defaults.sorting ? scope.defaults.sorting.order : 'asc' );

          // status
          if ( scope.status ){
            params.status = scope.status;
          }

          // search
          if ( scope.search ){
              params.search = encodeURIComponent( scope.search );
          }



          // level
          if ( scope.level ){
            params.level = scope.level;
          }

          // category
          if ( scope.category ){
            params.category = scope.category;
          }

          // rule
          if ( scope.rule ){
            params.rule = scope.rule._id;
          }

          // before
          if ( scope.before ){
            params.before = new Date( scope.before.getTime() - scope.before.getTimezoneOffset() * 60000 );
          }

          // after
          if ( scope.after ){
            params.after = new Date( scope.after.getTime() - scope.after.getTimezoneOffset() * 60000 );
          }

          callApi(params)
      }

      AlertsService.observeParams(callApi);


      /**
      *
      * function: calls api to get list
      */
      function callApi(params, mustClean){
        if(mustClean){
          cleanData();
        }

        params = params || {};

        var page = 0;
        // page & limit
        page = scope.data && scope.data.length ? scope.data.length / 20 : 0;
        params.limit = 20;
        params.page = Math.floor( page );

        if(!canCall(params)){
          console.warn("Cannot recall API with the same params");
          return;
        }

        saveLastCall(params);

        var urlConfig = {
          url: "/api/"+scope.urlApi,
          method: 'GET',
          params: params || {}
        };
        $http( urlConfig )
            .then( function success( response ) {

                isLoading = false;

                if ( response.data.data ) {
                    if ( page )
                        response.data.data.forEach( function loop( i ) {
                            if ( scope.data && !~scope.data.indexOf( i ) ){
                                scope.data.push( i );
                                scope.resize();
                            }
                        } );
                    else{
                        scope.data = response.data.data;
                        scope.resize();
                    }
                } else if ( response.data instanceof Array )
                    response.data.forEach( function loop( i ) {
                        if ( scope.data && !~scope.data.indexOf( i ) ){
                            scope.data.push( i );
                            scope.resize();
                        }
                    } );

                scope.total = response.data.recordsFiltered;

                if ( !scope.columns.length )
                    scope.data.forEach( function ( data ) {
                        Object.keys( data )
                            .forEach( function ( col ) {
                                if ( !~scope.columns.indexOf( col ) )
                                    scope.columns.push( col );
                            } );
                    } );

            }, function error( response ) {
                isLoading = false;

                /*if ( response.status == 401 )
                    return ngDialog.open( {
                        templateUrl: 'modals/login.pug',
                        controller: 'modals/login',
                        showClose: false,
                        className: 'login'
                    } );*/

                    console.warn(scope);

                //$location.path( '/error/' + response.status );

            } );
      }

      /**
       * Use the webservice to retrieve the complete selected item
       *
       * @arg {String} id Id of the selected item to be retrieved
       */
      function retrieveItem( id ) {
          if ( !id ) return console.warn( 'No ID' );
          scope.__validation = [];

          // TODO: Load controller and template
          /*if ( $scope.$root.__module.config && $scope.$root.__module.config.tabs && $scope.$root.__module.config.tabs[ $scope.__view || "" ].controller )
              return ( $scope.ctrl = $controller( $root.__module.config.tabs[ $scope.__view || "" ].controller, {
                  $scope: $scope
              } ) );*/

          // Clean item
          scope.item = undefined;

          // Get item from API
          $http.get( '/api/' + scope.moduleApi + '/' + id )
              .then( function success( response ) {
                  scope.item = response.data;
              }, function error( response ) {
                  $location.path( '/error/' + response.status );
              } );
      }

      scope.isTimedOut = function isTimedOut( row ) {

          if(!scope.alert) return false;

          var to = 'timeout';
          var ts = 'timestamp';
          if ( angular.isString(scope.properties.timeout) )
            to = scope.properties.timeout;

          if ( angular.isString(scope.properties.timestamp) )
            ts = scope.properties.timestamp;

          // If missing, return false
          if ( ( !row[ to ] && to != '$now' ) || !row[ ts ] )
              return false;

          // Get the timestamp and format it
          var timestamp = angular.copy( row[ ts ] );
          if ( typeof row[ ts ] == 'string' )
              timestamp = new Date( timestamp );
          if ( timestamp.getTime )
              timestamp = timestamp.getTime();

          // Condition
          var res;
          if ( to == '$now' )
              res = timestamp < Date.now();
          else
              res = ( timestamp + ( row[ to ] * 60000 ) ) < Date.now();
          console.log( row[ to ], timestamp, res );
          return res;

      };

      function getBuildings(){
        /*$http.get( "/api/rules" )
            .then( function success( response ) {
                scope.allRules = response.data && response.data.data ? response.data.data : [];
                scope.rules = angular.copy(scope.allRules);
            }, function error( response ) {
                console.warn( response );
        } );*/
        $http.get( "/api/buildings" )
            .then( function success( response ) {
                scope.buildings = response.data;
            }, function error( response ) {
                $location.path( '/error/' + response.status );
            } );
      }

      scope.allRules = [];
      function getRules(){
        $http.get( "/api/rules" )
            .then( function success( response ) {
                scope.allRules = response.data && response.data.data ? response.data.data : [];
                scope.rules = angular.copy(scope.allRules);
            }, function error( response ) {
                console.warn( response );
        } );
      }

      function filterRules(){
        if( !(angular.isObject(scope.rule) && canDisplayRule(scope.rule))){
          scope.rule = undefined;
        }
        scope.rules = scope.allRules.filter(canDisplayRule);
      }

      function canDisplayRule(rule){
        if(scope.level){
          if(scope.level != rule.level) return false;
        }
        if(scope.category){
          if(scope.category != rule.category) return false;
        }
        return true;
      }

      /**
       * Scrolling handler ( infinite scroll + header mover )
       *
       * @arg {Event} event Native JS scroll event
       */
      scope.scroll = function scroll( event ) {
          var elem = event.target;
          var header = elem.querySelectorAll( 'th' );
          for ( var i = 0; i < header.length; i++ )
              header[ i ].style.top = elem.scrollTop + 'px';
          if ( ( elem.scrollTop + elem.offsetHeight + 300 ) > elem.scrollHeight ){
            if(typeof scope.total === 'undefined' ||
            (scope.total && scope.data && scope.data.length < scope.total)
            ){
              getlist( );
            }
          }
      };

      var cvr;
      function cleanVisualReturn( n ) {
          if ( !n ) return;
          if ( cvr ){ $timeout.cancel( cvr )};
          cvr = $timeout( function () {
              scope.item.__saved = false;
              scope.item.__failed = false;
              scope.actionbtn.__success = false;
              scope.actionbtn.__failed = false;
          }, 3000 );
      }


      //scope.$watch('data', scope.resize);

      scope.resize = function ( delay ) {
              $timeout( function () {
                  console.log( "resizing" );
                  var globalHeight = $window.innerHeight;
                  var tablediv = angular.element( document.querySelector( '#tablediv' ) );
                  var offsetTop = tablediv.prop( 'offsetTop' );
                  var margin = 80;
                  scope.currentHeight = globalHeight - ( margin + offsetTop );
                  console.log(scope.currentHeight);
              }, delay || 10 );
      };

      /**
      * WATCHERS
      */
      var searchPromise;
      scope.$watch( 'search', function(){
        if(searchPromise){
          $timeout.cancel(searchPromise);
        }
        searchPromise = $timeout(function(){
          getlist(true);
        }, 100);
      } );

      scope.$watch( 'building', function(){
        getlist(true);
      } );
      scope.$watch( 'status', function(){
        getlist(true);
      } );
      scope.$watch( 'level', function(){
        filterRules();
        getlist(true);
      } );
      scope.$watch( 'category', function(){
        filterRules();
        getlist(true);
      } );
      scope.$watch( 'rule', function(){
        getlist(true);
      } );
      scope.$watch('after', function(){
        getlist(true);
      });
      scope.$watch('before', function(){
        getlist(true);
      });
      scope.$watch( 'item.__saved', cleanVisualReturn );
      scope.$watch( 'item.__failed', cleanVisualReturn );
      scope.$watch( 'actionbtn.__success', cleanVisualReturn );
      scope.$watch( 'actionbtn.__failed', cleanVisualReturn );

      angular.element( $window )
          .bind( 'resize', function () {
              scope.resize();
          } );




      /**
      * start
      */
      if(!scope.isGenericApp()){
        getBuildings();
      }
      getRules();
      getlist(true);
    }
  };
});
