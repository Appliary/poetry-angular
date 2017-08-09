app.directive("switch", function(){
  return {
    restrict: 'A',
    transclude: false,
    //templateUrl: 'generic/switch/switch.pug',
    link: function(scope, elem, attrs, ctrls){
      $(elem).bootstrapSwitch();
    }
  };
});
