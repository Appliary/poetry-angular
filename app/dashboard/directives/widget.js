app.directive( 'ngWidget', function () {
    return {
        restrict: 'E',
        templateUrl: 'dashboard/widget.pug',
        scope: {
            widget: '=',
            remove: '=',
            edit: '='
        }
    };
} );
