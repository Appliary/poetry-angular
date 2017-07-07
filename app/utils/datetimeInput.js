app.directive("timeInput", function(){
  return {
    restrict: 'E',
    transclude: false,
    require: "?ngModel",
    scope: true,
    template: "<input type='time' ng-model='value' ng-change='onChange()' name={{name}} class={{className}}>",
    link: function(scope, element, attrs, ngModel){
        if (!ngModel) return;

        scope.onChange = function(){
          ngModel.$setViewValue(scope.value);
        };

        attrs.$observe('class', function(className){
              scope.className = className;
			  });

        attrs.$observe('name', function(name){
              scope.name = name;
			  });

        ngModel.$render = function(){
          var dateValue = new Date( ngModel.$modelValue || undefined );
          if(dateValue){
            var firstDate = new Date(0);
            firstDate.setHours(dateValue.getHours());
            firstDate.setMinutes(dateValue.getMinutes());
            dateValue = firstDate;
          }
          scope.value = dateValue;
        };
    }
  };
});

app.directive("dateInput", function(){
  return {
    restrict: 'E',
    transclude: false,
    require: "?ngModel",
    scope: true,
    template: "<input type='date' ng-model='value' ng-change='onChange()' name={{name}} class={{className}}>",
    link: function(scope, element, attrs, ngModel){

        if (!ngModel) return;

        scope.onChange = function(){
          ngModel.$setViewValue(scope.value);
        };

        attrs.$observe('class', function(className){
              scope.className = className;
			  });

        attrs.$observe('name', function(name){
              scope.name = name;
			  });

        ngModel.$render = function(){
          scope.value = new Date( ngModel.$modelValue || undefined );
        };
    }
  };
});
