app.directive("detailsDirective", function(){
  return {
    restrict: 'EA',
    scope: {
      config: "=",
      item: "=?",
      view: "=?",
      close: "&?"
    },
    templateUrl: "generic/detailsDirective/detailsDirective.pug",
    transclude: false,
    link: function(scope, elem, attrs, ctrls){
      if(!scope.view && scope.config.tabs && angular.isObject(scope.config.tabs) && Object.keys(scope.config.tabs).length){
        scope.view = Object.keys(scope.config.tabs)[0];
      }
      scope.tab = function(name){
        scope.view = name;
      }

      console.log("%cTest detailsDirective","background-color: blanchedAlmond; color: white; font-weight: bolder");
      console.groupCollapsed( 'detailsDirective' );
      console.log( 'scope', scope );
      console.groupEnd();

    }
  };
});
