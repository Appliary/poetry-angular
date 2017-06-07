app.directive( 'ngWidget', function () {
    return {
        restrict: 'E',
        templateUrl: 'dashboard/widgets/widget.pug',
        scope: {
            widget: '=',
            remove: '=',
            edit: '='
        }
    };
} );
