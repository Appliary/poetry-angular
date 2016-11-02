app.directive('ngWidget', function() {
    //console.log("widget in ngwidget", widget);
    return {
        scope:{
            widget : '=',
            delete : '&delete',
            name: '=ngController',
            resizeWidgets :'&resizeWidgets',
            enableDraggable : '&enableDraggable',
            saveDashboard : '&saveDashboard',
            disableSave : '&disableSave',
            enableSave : '&enableSave'
        },
        restrict: 'E',
        templateUrl: 'dashboard/widget.pug',
        link : function(scope,element,attrs)
        {
        scope.$watch('widget', function(item){
            scope.saveDashboard();
            scope.resizeWidgets();
        }, true);


        }
    };
})
.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });
 
                event.preventDefault();
            }
        });
    };
});