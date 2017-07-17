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
          console.log("%c[timeInput] on change: "+scope.value,"background-color: black; color: #2BFF00");
          ngModel.$setViewValue(scope.value);
        };

        attrs.$observe('class', function(className){
              scope.className = className;
			  });

        attrs.$observe('name', function(name){
              scope.name = name;
			  });

        ngModel.$render = function(){
          console.log("%c[timeInput] modelValue: "+ngModel.$modelValue,"background-color: black; color: #2BFF00");
          var dateValue = new Date( ngModel.$modelValue || undefined );
          if(dateValue){
            var firstDate = new Date(0);
            firstDate.setHours(dateValue.getHours());
            firstDate.setMinutes(dateValue.getMinutes());
            dateValue = firstDate;
          }
          console.log("%c[timeInput] dateValue: "+dateValue,"background-color: black; color: #2BFF00");
          scope.value = dateValue;
        };
    }
  };
});

app.directive("numberTimeInput", function(){
  return {
    restrict: 'E',
    transclude: false,
    require: "?ngModel",
    scope: true,
    templateUrl: "utils/numberTimeInput.pug",
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
          console.log("%c[numberTimeInput] modelValue: "+ngModel.$modelValue,"background-color: black; color: #2BFF00");
          var value = (ngModel.$modelValue && angular.isObject(ngModel.$modelValue)) ? ngModel.$modelValue : {};
          scope.value = value;
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

app.directive("timezoneOffset", function(){
  return {
    restrict: 'E',
    transclude: false,
    require: "ngModel",
    scope: true,
    template: "",
    link: function(scope, element, attrs, ngModel){

        if (!ngModel) return;

        var date = new Date();
        console.debug("timezoneOffset", date.getTimezoneOffset());
        var timezoneOffset = (date.getTimezoneOffset() * 60000);
        console.debug("timezoneOffset full", timezoneOffset);
        ngModel.$setViewValue(timezoneOffset);

        /*ngModel.$render = function(){
          var dateValue = new Date( ngModel.$modelValue || undefined );
          if(dateValue){
            var firstDate = new Date(0);
            firstDate.setHours(dateValue.getHours());
            firstDate.setMinutes(dateValue.getMinutes());
            dateValue = firstDate;
          }
          scope.value = dateValue;
        };*/
    }
  };
});
