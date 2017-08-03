app.directive("datepicker", function(){
  return {
    restrict: 'A',
    replace: false,
    //require: "ngModel",
    transclude: false,
    /*templateUrl: function(element, attrs){
      var template;
      if(!attrs.templateUrl || !angular.isString(attrs.templateUrl)){
        template = "generic/datepicker/default.pug";
      }
      else{
        template = "generic/datepicker/"+attrs.templateUrl+".pug";
      }
      return template;
    },*/
    link: function(scope, elem, attrs, ngModel){
      console.debug("datepicker");
      $(elem).datepicker();
      /*if (!ngModel) return;

      scope.onChange = function(){
        console.log("new value", scope.value);
        ngModel.$setViewValue(scope.value);
      };

      attrs.$observe('class', function(className){
            scope.className = className;
      });

      attrs.$observe('name', function(name){
            scope.name = name;
      });

      ngModel.$render = function(){
        console.log("ngModel.$render", ngModel.$modelValue);
        if(!ngModel.$modelValue) return;
        scope.value = new Date( ngModel.$modelValue );
      };*/
    }
  };
});
