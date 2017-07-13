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
        hideFilters: '<?', //bool
        alert: '<?', //bool
        defaults: '<?', //object
        properties: '<?' //object
    },
    link: function(scope, elem, attrs, ctrls){

      if ( scope.__id ) console.debug( "id equals",scope.__id );
      console.debug(scope);

      var isLoading = false;

      var currentHeightPlus = 0;

      console.debug("appName", scope.$root.__appName);

      /**
      * scope:
      * - allHiddenTags : if no hidden tags chosen, search on these
      * - hiddenTags : tags from the buiding (those should not be seen)
      * - searchTags : ngModel tags input
      * - genericApps : array of generic applications (where some fields and actions should be hidden)
      *
      */
      scope.allHiddenTags = [];
      scope.hiddenTags = [];
      scope.searchTags = [];
      scope.searchTags2 = [];
      scope.genericApps = ['deviceManager'];
      scope.isGenericApp = function (){
        return (scope.genericApps.indexOf(scope.$root.__appName) > -1);
      }

      var pathStart = $location.path();
      var directivePath = pathStart;
      var lastSlash = pathStart.lastIndexOf('/');
      /*console.debug("lastSlash", lastSlash);
      console.debug("directivePath", directivePath);
      console.debug("directivePath length", directivePath.length);*/
      var len = directivePath.length - lastSlash - 1;
      //console.debug("len",len);
      if(len >= 24){
        var possibleId = directivePath.substr(lastSlash + 1, 24);
        if(possibleId.indexOf('/') == -1){
          //console.debug("go to "+possibleId);
          directivePath = directivePath.substring(0,lastSlash);
          //console.debug("new directivePath", directivePath);
          select(possibleId);
        }
      }


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
          "context",
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

      // if is context: {id:..., kind:...}
      scope.isContext = function(coord){
        return coord
                && angular.isObject(coord)
                && coord.hasOwnProperty('id')
                && coord.hasOwnProperty('kind');
      }

      // if is context: {id:..., kind:...}
      scope.displayContext = function(coord){
        return coord.name ? coord.name : [coord.kind +':'+ coord.id];
      }
      scope.displayContextTitle = function(coord){
        return coord.kind +':'+ coord.id;
      }

      function getUserLanguage(){
        return (scope.$root.user) ? scope.$root.user.language : "";
      }
      var messageProp = "message";

      /**
      * Display message depending on the user language
      */
      scope.displayMessage = function( row ){
        if(!(row && angular.isObject(row))){
          return;
        }
        var userLn = getUserLanguage();
        return getUserLanguage && angular.isString(userLn) && row[messageProp + userLn.toUpperCase()]
                ? row[messageProp + userLn.toUpperCase()]
                : row[ messageProp ];
      }

      function select( id ) {
          if(scope.hideFilters) return;
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

        // replace in details
        scope.item = r.data;

        scope.item.__saved = true;

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
        && lastParams.tags == params.tags
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
          if(isLoading){
            console.debug("isLoading", isLoading);
             return;
           }
          // is not supposed to be called when not yet fully operated
          if(!scope.displayable || scope.hideFilters) return;

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

          // searchTags - tags
          if ( scope.searchTags &&  scope.searchTags.length > 0){
              params.tags =  scope.searchTags.map(function(t){
                return t.text;
              });
          }

          if(!scope.isGenericApp()){

            // hiddenTags - allHiddenTags - tags
            if(scope.hiddenTags &&  scope.hiddenTags.length > 0){
              if(!angular.isArray(params.tags)){
                params.tags = [];
              }
              scope.hiddenTags.forEach(function(t){
                if(params.tags.indexOf(t) == -1){
                  params.tags.push(t);
                }
              });
            }
            else if(/*!scope.building &&*/ scope.allHiddenTags &&  scope.allHiddenTags.length > 0){
                if(!angular.isArray(params.tags)){
                  params.tags = [];
                }
                scope.allHiddenTags.forEach(function(t){
                  if(params.tags.indexOf(t) == -1){
                    params.tags.push(t);
                  }
                });
            }
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
            params.before.setHours(23, 59, 59, 999);
          }

          // after
          if ( scope.after ){
            params.after = new Date( scope.after.getTime() - scope.after.getTimezoneOffset() * 60000 );
          }

          callApi(params)
      }

      AlertsService.observeParams(function(params, mustClean){
        currentHeightPlus = 150;
        callApi(params, mustClean);
      });


      /**
      *
      * function: calls api to get list
      */
      function callApi(params, mustClean){
        console.log("%cCallApi","background-color: black; color: #2BFF00");
        console.log("params",params);
        if(mustClean){
          cleanData();
        }

        params = params || {};

        var page = 0;
        // page & limit
        params.limit = 25;
        page = scope.data && scope.data.length ? scope.data.length / params.limit : 0;
        params.page = Math.floor( page );

        if(!canCall(params)){
          console.warn("Cannot recall API with the same params");
          isLoading = false;
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
                  //console.log( "resizing" );
                  var globalHeight = $window.innerHeight;
                  var tablediv = angular.element( document.querySelector( '#tablediv' ) );
                  var offsetTop = tablediv.prop( 'offsetTop' );
                  var margin = 80;
                  scope.currentHeight = globalHeight - ( margin + offsetTop ) + currentHeightPlus;
                  //console.log(scope.currentHeight);
              }, delay || 10 );
      };

      /**
      * WATCHERS
      */
      scope.$watch( 'building', function(nv){
        console.debug("building", nv);
        if(angular.isObject(nv) && angular.isArray(nv.tags) && nv.tags.length > 0){
          scope.hiddenTags = nv.tags;
        }
        else{
          //if(scope.hiddenTags && scope.hiddenTags > 0){
            scope.hiddenTags = [];
          //}
        }
        console.debug("hiddenTags", scope.hiddenTags);
        getlist(true);
      } );

      /*scope.$watchCollection( 'hiddenTags', function(nv){
        console.debug("hiddenTags", nv);
        getlist(true);
      } );*/

      var searchPromise;
      scope.$watchCollection( 'searchTags', function(nv){
        console.debug("searchTags", nv);
        if(searchPromise){
          $timeout.cancel(searchPromise);
        }
        searchPromise = $timeout(function(){
          getlist(true);
        }, 200);
      } );

      scope.addSearchTag = function(dt){
        //console.log(dt);
        if(scope.hideFilters) return;
        dt = angular.isObject(dt) ? dt.text : dt;
        if(!dt || !angular.isString(dt)){
          return;
        }
        if(!(scope.searchTags.some(function(t){ return t.text == dt;}))){
          scope.searchTags.push({text: dt});
        }
      }

      /*scope.$watchCollection( 'searchTags2', function(nv){
        console.debug("searchTags2", nv);
      } );*/

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
      function getBuildings(){
        $http.get( "/api/buildings" )
            .then( function success( response ) {
                scope.buildings = response.data;
                scope.buildings.forEach(function(b){
                  if(angular.isObject(b) && angular.isArray(b.tags) && b.tags.length > 0){
                    // concat to build `allHiddenTags`
                    scope.allHiddenTags = scope.allHiddenTags.concat(b.tags);
                  }
                });
                scope.displayable = true;
                getlist(true);
            }, function error( response ) {
                $location.path( '/error/' + response.status );
            } );
      }

      getBuildings();
      getRules();
    }
  };
});
