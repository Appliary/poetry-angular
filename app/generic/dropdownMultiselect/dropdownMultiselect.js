app.directive("customDropdownMultiselect", function($filter){
  return {
    restrict: 'EA',
    transclude: false,
    scope: {
      options: "=",
      selectedModel: "="
    },
    templateUrl: 'generic/dropdownMultiselect/dropdownMultiselect.pug',
    link: function(scope, elem, attrs, ctrls){
      scope.columns = [];
      scope.$watchCollection('options', function(nv){
        if(!angular.isArray(nv)){
          return;
        }
        scope.columns = nv.map(function(opt, i){
          var nopt = angular.isString(opt) ? {label: opt, key: opt} : angular.copy(opt);
          nopt.label = $filter('translate')(nopt.label || nopt.key);
          nopt.id = i;
          if(!nopt.hide && angular.isArray(scope.selectedModel)){
            if(!scope.selectedModel.some(function(se){
              return se.id == nopt.id;
            })){
              scope.selectedModel.push(nopt);
            }
          }
          return nopt;
        });
      });
    }
  };
});
