app.directive("distributionListsQueryDirective", function(AlertsService){
  return {
    restrict: 'EA',
    templateUrl: "distributionlists/queryDirective.pug",
    transclude: false,
    scope: {
      item: "="
    },
    link: function(scope, elem, attrs, ctrls){
      scope.allRules = [];
      AlertsService.getRules().then(
        function(response){
          scope.allRules = response.data && response.data.data ? response.data.data : [];
          scope.rules = angular.copy(scope.allRules);
        },
        function(e){
          console.warn(e);
        }
      );

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
      *
      * WATCHERS
      */
      scope.$watch( 'level', function(){
        filterRules();
      } );
      scope.$watch( 'category', function(){
        filterRules();
      } );
    }
  };
});
