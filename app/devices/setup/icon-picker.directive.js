(function () {
    'use strict';

    app.directive('iconPicker', iconPicker);

    function iconPicker() {
        var directive = {
            replace: true,
            restrict: 'E',
            templateUrl: "devices/setup/icon-picker.directive.pug",
            controller: deviceSetupMapController,
            scope: {
                iconSelected: "=",
                procEvent: "=",
                currentIcon: "="
            },
            controllerAs: 'vm',
            bindToController: true
        };

        return directive;
    }

    deviceSetupMapController.$inject = ['$scope', '$sce', 'ngDialog', 'iconsService', '$timeout'];

    /* @ngInject */
    function deviceSetupMapController($scope, $sce, ngDialog, iconsService, $timeout) {
        // ***********************************************************
        //                  DECLARE VARIABLES
        var vm = this;
        console.log(vm);
        console.log($scope);

        // ***********************************************************
        //                  MAPPING FUNCTIONS
        vm.click = function (icon) {
            vm.iconSelected = icon.data;
        };
        vm.openConfirmModal = openConfirmModal;

        // ***********************************************************
        //                  ACTIVATE
        activate();
        // ***********************************************************
        //                  DECLARE FUNCTIONS
        function activate() {
            $scope.$watch('vm.procEvent', function (newValue, oldValue) {
                if (newValue) openConfirmModal();
            });
            iconsService.getIcons()
                .then(function (response) {
                    $scope.icons = response;
                });
            for (var i in $scope.icons) {
                var icon = $scope.icons[i];
                icon = trustAsHtml(icon);
            }
        }

        function openConfirmModal() {
            ngDialog.openConfirm({
                template: 'popupConfirm.pug',
                scope: $scope,
                showClose: false,
            })
                .then(function () { })
                .catch(function () { });
        }

        function trustAsHtml(aString) {
            return $sce.trustAsHtml(aString);
        }

        $scope.cancel = function () {
            console.log(vm);
            console.log($scope);

            //vm.iconSelected = vm.currentIcon;
        }

    }
})();
