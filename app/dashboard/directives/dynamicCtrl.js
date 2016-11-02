app.directive('ngDynamicController', ['$compile', '$parse',function($compile) {
  return {
      scope: {
          name: '=ngDynamicController',
          widget : '=',
          delete : '&delete',
          content: '=content',
          enableDraggable : '&enableDraggable',
          disableSave : '&disableSave',
          saveDashboard : '&saveDashboard',
          enableSave : '&enableSave'
      },
      restrict: 'A',
      terminal: true,
      priority: 100000,
      link: function(scope, elem, attrs) {
          elem.attr('ng-controller', scope.name);
          elem.removeAttr('ng-dynamic-controller');
          $compile(elem)(scope);
      }
  };
}])