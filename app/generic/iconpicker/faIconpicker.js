app.directive('faIconpicker', function ($timeout) {
    return {
        restrict: 'E',
        scope: {
            model: '='
        },
        replace: true,
        templateUrl: 'generic/iconpicker/faIconpicker.pug',
        link: function ($scope, element, attrs) {
            var $element = $(element);
            //$element
            $element.iconpicker({
                selected: $scope.model,
                title: true,
                animation: true,
                hideOnSelect: true,
                fullClassFormatter: function(val) {
                    return 'fa ' + val;
                },
                icons: $.iconpicker.defaultOptions.icons
            });

            $element.on('iconpickerSelected', function (e) {
                $timeout(function () {
                    $scope.model = 'fa ' + e.iconpickerValue;
                }, 0);
            });

            $scope.$watch('model', function (newValue) {
                console.log('colorPicker value: ' + newValue);
            });
        }
    }
});
