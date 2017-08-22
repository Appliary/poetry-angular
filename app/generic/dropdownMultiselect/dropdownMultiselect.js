app.directive("customDropdownMultiselect", function(){
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
          nopt.label = nopt.label || nopt.key;
          nopt.id = i;
          return nopt;
        });
      });
    }
  };
});
