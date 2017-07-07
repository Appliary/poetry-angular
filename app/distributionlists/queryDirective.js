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
          if(angular.isObject(scope.item) && scope.allRules.length > 0){
            console.log("set to empty");
              scope.item.rule = '';
          }
        }
        scope.rules = scope.allRules.filter(canDisplayRule);
      }

      function canDisplayRule(rule){
        if(scope.item.level){
          if(scope.item.level != rule.level) return false;
        }
        if(scope.item.category){
          if(scope.item.category != rule.category) return false;
        }
        return true;
      }

      /**
      *
      * WATCHERS
      */
      scope.$watch( 'item.level', function(){
        filterRules();
      } );
      scope.$watch( 'item.category', function(){
        filterRules();
      } );
      scope.$watch( 'item.rule', function(nv){
        if(!nv){
          scope.rule = '';
          return;
        }
        if(!scope.allRules.some(function(ru){
          if(ru._id == nv){
            scope.rule = ru;
            return true;
          }
          else{
            return false;
          }
        })){
          scope.rule = '';
        }
      } );
    }
  };
});
