/**
*
* TODO: clean up to make it understandable and maybe less restrictive when time is given
*/

app.directive("listDirective", function(
  $http,
  $location,
  $timeout,
  ngDialog,
  AlertsService,
  listViewService,
  $window,
  assetsUtils,
  $filter){
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

      assetsUtils.initializeScopeMin(scope);

      if ( scope.__id ) console.debug( "id equals",scope.__id );

      scope.isLoading = false;

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
      var hasPossibleId = false;
      var len = directivePath.length - lastSlash - 1;
      if(len >= 24){
        var possibleId = directivePath.substr(lastSlash + 1, 24);
        if(possibleId.indexOf('/') == -1){
          directivePath = directivePath.substring(0,lastSlash);
          hasPossibleId= true;
          scope.searchId = possibleId;
          select(possibleId);
        }
      }


      scope.actionbtn = {};
      scope.maxDate = getDefaultMaxDateToString();

      scope.acknowledged = 'all';
      scope.after = AlertsService.getDefaultAfter();
      scope.before = AlertsService.getDefaultBefore();

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
          "tags",
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
          if(scope.hideFilters){
            return;
          }
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
        delete scope.item;
        listViewService.emit('resize');
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

        toastr.success(
            $filter( 'translate' )( 'The element has been saved:' + scope.$root.__module.name ),
            $filter( 'translate' )( 'Saved' )
        );

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

        toastr.success(
            $filter( 'translate' )( 'The element has been saved:' + scope.$root.__module.name ),
            $filter( 'translate' )( 'Saved' )
        );

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
        toastr.error(e.statusText,'error ' + e.status);
        scope.item.__failed = true;
      }

      function responseErrorActionHandler(e){
        console.warn(e);
        toastr.error(e.statusText + ' ' + e.statusText,'error');
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

      // do orderBy
      function orderBy(col, order){
        scope.sorting = {
              col: col,
              order: order
        };
        getlist(true);
      }
      scope.orderBy = orderBy;

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
        && lastParams.id == params.id

        && lastParams.level == params.level
        && lastParams.category == params.category
        && lastParams.rule == params.rule
        && lastParams.before == params.before
        && lastParams.after == params.after
        && lastParams.acknowledged == params.acknowledged
      );
      }

      scope.generate = function (){
        getlist(true);
      }

      /**
      * function
      * Builds params depending on filters and then calls function `callApi`
      */
      function getlist( cleanOldData ) {
          if(scope.isLoading){
            console.debug("scope.isLoading", scope.isLoading);
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

          scope.isLoading = true;


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

          if ( scope.searchId ){
            params.id = scope.searchId;
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
            else if(/*!scope.$root.report_data.building &&*/ scope.allHiddenTags &&  scope.allHiddenTags.length > 0){
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

          /*// before
          if ( scope.before ){
            params.before = new Date( scope.before.getTime() - scope.before.getTimezoneOffset() * 60000 );
            params.before.setHours(23, 59, 59, 999);
          }

          // after
          if ( scope.after ){
            params.after = new Date( scope.after.getTime() - scope.after.getTimezoneOffset() * 60000 );
          }*/

          // before
          if ( scope.$root.report_date.end ){
            params.before = new Date(scope.$root.report_date.end);
            params.before = new Date( params.before.getTime() - params.before.getTimezoneOffset() * 60000 );
            params.before.setHours(23, 59, 59, 999);
          }

          // after
          if ( scope.$root.report_date.start ){
            params.after = new Date(scope.$root.report_date.start);
            params.after = new Date( params.after.getTime() - params.after.getTimezoneOffset() * 60000 );
          }

          // acknowledged
          if( scope.acknowledged && scope.acknowledged != 'all'){
            if(scope.acknowledged == 'y'){
              params.acknowledged = true;
            }
            else if(scope.acknowledged == 'n'){
              params.acknowledged = false;
            }
          }

          callApi(params)
      }

      AlertsService.observeParams(function(params, mustClean){
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
          scope.isLoading = false;
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

                scope.isLoading = false;

                if ( response.data.data ) {
                    if ( page )
                        response.data.data.forEach( function loop( i ) {
                            if ( scope.data && !~scope.data.indexOf( i ) ){
                                scope.data.push( i );
                                //scope.resize();
                            }
                        } );
                    else{
                        scope.data = response.data.data;
                        //scope.resize();
                    }
                } else if ( response.data instanceof Array )
                    response.data.forEach( function loop( i ) {
                        if ( scope.data && !~scope.data.indexOf( i ) ){
                            scope.data.push( i );
                            //scope.resize();
                        }
                    } );

                scope.total = response.data.recordsFiltered;
                scope.filtered = response.data.recordsFiltered;

                /*if ( !scope.columns.length )
                    scope.data.forEach( function ( data ) {
                        Object.keys( data )
                            .forEach( function ( col ) {
                                if ( !~scope.columns.indexOf( col ) )
                                    scope.columns.push( col );
                            } );
                    } );*/

            }, function error( response ) {
                scope.isLoading = false;

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
          /*if ( scope.$root.__module.config && scope.$root.__module.config.tabs && scope.$root.__module.config.tabs[ scope.__view || "" ].controller )
              return ( scope.ctrl = $controller( $root.__module.config.tabs[ scope.__view || "" ].controller, {
                  scope: scope
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

      scope.allRules = [];
      function getRules(){
        if(scope.isGenericApp()){
          $http.get( "/api/rules" )
              .then( function success( response ) {
                  scope.allRules = response.data && response.data.data ? response.data.data : [];
                  scope.rules = angular.copy(scope.allRules);
              }, function error( response ) {
                  console.warn( response );
          } );
        }
        else{
          scope.rules = [];
        }
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

      scope.loadMore = function(){
        getlist();
      }

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

      /**
      * WATCHERS
      */
      scope.$watch( '$root.report_data.building', function(nv){
        if(angular.isObject(nv) && angular.isArray(nv.tags) && nv.tags.length > 0){
          scope.hiddenTags = nv.tags;
        }
        else{
          //if(scope.hiddenTags && scope.hiddenTags > 0){
            scope.hiddenTags = [];
          //}
        }
        //getlist(true);
      } );

      scope.$watch( 'block', function(nv){
        var ind;
        if(angular.isObject(nv) && angular.isString(nv._id) && nv._id){

          var docAsTag = "blocks:"+nv._id;
          if(scope.hiddenTags.some(function(tt, idx){
            ind = idx;
            return tt.indexOf("blocks:") == 0;
          })){
            scope.hiddenTags[ind] = docAsTag;
          }
          else{
            scope.hiddenTags.push(docAsTag);
          }
        }
        else{
          if(scope.hiddenTags.some(function(tt, idx){
            ind = idx;
            return tt.indexOf("blocks:") == 0;
          })){
            scope.hiddenTags.splice(ind, 1);
          }
        }
        console.debug("hiddenTags", scope.hiddenTags);
        //getlist(true);
      } );

      scope.$watch( 'apartment', function(nv){
        var ind;
        if(angular.isObject(nv) && angular.isString(nv._id) && nv._id){

          var docAsTag = "apartments:"+nv._id;
          if(scope.hiddenTags.some(function(tt, idx){
            ind = idx;
            return tt.indexOf("apartments:") == 0;
          })){
            scope.hiddenTags[ind] = docAsTag;
          }
          else{
            scope.hiddenTags.push(docAsTag);
          }
        }
        else{
          if(scope.hiddenTags.some(function(tt, idx){
            ind = idx;
            return tt.indexOf("apartments:") == 0;
          })){
            scope.hiddenTags.splice(ind, 1);
          }
        }
        console.debug("hiddenTags", scope.hiddenTags);
        //getlist(true);
      } );

      var searchPromise;
      scope.$watchCollection( 'searchTags', function(nv){
        if(searchPromise){
          $timeout.cancel(searchPromise);
        }
        searchPromise = $timeout(function(){
          //getlist(true);
        }, 200);
      } );

      scope.addSearchTag = function(dt){
        if(scope.hideFilters) return;
        dt = angular.isObject(dt) ? dt.text : dt;
        if(!dt || !angular.isString(dt)){
          return;
        }
        if(!(scope.searchTags.some(function(t){ return t.text == dt;}))){
          scope.searchTags.push({text: dt});
        }
      }

      scope.$watch( 'searchId', function(){
        if(hasPossibleId){
          hasPossibleId = false;
          return;
        }
        if(angular.isString(scope.searchId) && (scope.searchId.length == 24 || scope.searchId.length == 0)){
          getlist(true);
        }
      } );

      scope.$watch( 'status', function(){
        //getlist(true);
      } );
      scope.$watch( 'level', function(){
        filterRules();
        //getlist(true);
      } );
      scope.$watch( 'category', function(){
        filterRules();
        //getlist(true);
      } );
      scope.$watch( 'rule', function(){
        //getlist(true);
      } );
      /*scope.$watch('after', function(){
        //getlist(true);
      });
      scope.$watch('before', function(){
        //getlist(true);
      });*/
      scope.$watch('$root.report_date.start', function(){
        //getlist(true);
      });
      scope.$watch('$root.report_date.end', function(){
        //getlist(true);
      });
      scope.$watch('acknowledged', function(){
        //getlist(true);
      });
      scope.$watch( 'item.__saved', cleanVisualReturn );
      scope.$watch( 'item.__failed', cleanVisualReturn );
      scope.$watch( 'actionbtn.__success', cleanVisualReturn );
      scope.$watch( 'actionbtn.__failed', cleanVisualReturn );

      angular.element( $window )
          .bind( 'resize', function () {
              //scope.resize();
          } );

      function getBuildings(){
        $http.get( "/api/buildings" )
            .then( function success( response ) {
                scope.$root.report_buildingList = response.data;
                var rootSelectedBuilding;
                scope.$root.report_buildingList.forEach(function(b){
                  if(angular.isObject(b) && angular.isArray(b.tags) && b.tags.length > 0){
                    // concat to build `allHiddenTags`
                    scope.allHiddenTags = scope.allHiddenTags.concat(b.tags);
                  }

                  if(scope.$root.report_data && scope.$root.report_data.building){
                    if(scope.$root.report_data.building._id == b._id){
                     rootSelectedBuilding = b;
                    }
                  }
                });
                scope.displayable = true;
                if(rootSelectedBuilding){
                  scope.$root.report_data.building = rootSelectedBuilding;
                }
                else{
                  getlist(true);
                }
            }, function(){
              toastr.error(
                e.statusText,
                'Error'+' '+ e.status
              );
            } );
      }

      /**
      * start
      */
      if(!scope.isGenericApp()){
        getBuildings();
      }
      else{
        scope.displayable = true;
        getlist(true);
      }

      getRules();

      /** non generic functions **/

      scope.dt = {};

      if(!scope.$root.report_data){
        scope.$root.report_data = {};
      }

      var isContact = false;
      var appIds = [];

      scope.showBuilding = function () {
          scope.block = "";
          scope.apartment = "";

          scope.$root.report_data.blocks1 = [];
          scope.$root.report_data.devices1 = [];
          scope.$root.report_data.apartments1 = [];

          if ( scope.$root.report_data.building ) {
              //in case 'children' is string or undefined instead of Array
              var children1 = assetsUtils.getChildren( scope.$root.report_data.building );
              assetsUtils.parseChildren( children1, scope.$root.report_data.blocks1, scope.$root.report_data.apartments1, scope.$root.report_data.devices1, isContact, appIds );
              var building = {
                  name: scope.$root.report_data.building.name,
                  children: children1
              };
          }
      };

      scope.showBlock = function () {
          scope.dt.apartments = "";

          scope.dt.blocks2 = [];
          scope.dt.devices2 = [];
          scope.dt.apartments2 = [];

          var children2 = assetsUtils.getChildren( scope.block );
          assetsUtils.parseChildren( children2, scope.dt.blocks2, scope.dt.apartments2, scope.dt.devices2, isContact, appIds );
      };
    }
  };
});
