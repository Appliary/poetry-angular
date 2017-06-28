app.directive('appDropdown', function () {
    return {
        restrict: 'C',
        templateUrl: 'utils/dropdown.pug',
        transclude: true,
        bindings: {
            icon: '@',
            text: '<'
        },
        controller: function ($document, $scope) {

            var clickOut = function () {

                $scope.$apply(function () {
                    $scope.open = false;
                });
                $document.off('mouseup', clickOut);

            }

            $scope.open = false;
            $scope.toggle = function () {

                if ($scope.open) return;

                $document.on('mouseup', clickOut);
                $scope.open = true;

            }

        }
    }
});
