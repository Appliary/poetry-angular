app.directive("logsDirective", function($http){
  return {
    restrict: 'EA',
    transclude: false,
    templateUrl: "generic/logs/logs-directive.pug",
    scope: {
      options: "=?",
      __id: "=objectId",
      module: "=",
      "type": "@"
    },
    link: function(scope, elem, attrs, ctrls){

      console.log("%chistoryDirective","background-color: black; color: #2BFF00");

      scope.config = {};
      scope.config.before = Date.now();
      scope.config.after = Date.now() - 48*60*60*1000; // 2 days ago

      loadConfig();

      function loadConfig(){
        if(scope.options){
                return buildConfig(scope.options);
            }
            else{
              return buildConfig();
            }
      }

      function buildConfig(options){
        console.debug("options",options);
        options = options || {};

        // display
        scope.config.fields = options.fields;
        scope.config.subOnly = options.subOnly || false;
        scope.config.arrayObject = options["[object]"] || options.arrayObject || {};
        scope.config.measurements = options["measurements"];
        scope.config.noType = options.noType;

        // params
        scope.config.apiPath = options.apiPath || "";
        scope.config.sort = options.sort || "timestamp";
        scope.config.limit = options.limit || 100;
        scope.config.order = options.order || "desc";
        scope.config.page = options.page || 0;

        // handlers
        //scope.config.responseData = options.responseData;

        scope.$watch( '__id', getHistory );
        return scope.config;
      }

      function getHistory() {
        console.debug("getHISTORY");
        scope.loaded = false;
          $http.get( '/api/'+ (scope.type && scope.type != "logs" ? scope.type+"/" : "") + scope.module
            + '/' + scope.__id + scope.config.apiPath
            + '?page=' + scope.config.page
            + '&limit='+ scope.config.limit
            +'&sort='+ scope.config.sort
            +'&order='+ scope.config.order )
              .then( function success( response ) {
                scope.loaded = true;
                  scope.logs = response.data.data;
              } );
      }

      scope.showField = function ( field ) {
          if(!angular.isArray(scope.config.fields)){
            return true;
          }
          var _return = scope.config.fields.indexOf(field) > -1;
          return _return;
      };

      scope.isArrayObject = function(field){
        if(!scope.config.arrayObject.hasOwnProperty(field)){
          return false;
        }
        return true;
      }

      scope.getArrayObjectValues = function(field){
        return scope.config.arrayObject[field];
      }

      scope.ng = angular;
    }
  };
});
