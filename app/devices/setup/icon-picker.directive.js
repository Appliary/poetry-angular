(function () {
    'use strict';

    app.directive('iconPicker', iconPicker);

    function iconPicker() {
        var directive = {
            replace: true,
            restrict: 'E',
            templateUrl: "devices/setup/icon-picker.directive.html",
            controller: deviceSetupMapController,
            scope:{
                iconSelected: "=",
                procEvent: "="
            },
            controllerAs: 'vm',
            bindToController: true
        };

        return directive;
    }

    deviceSetupMapController.$inject = ['$scope', '$sce', 'ngDialog', 'iconsService'];

    /* @ngInject */
    function deviceSetupMapController($scope, $sce, ngDialog, iconsService) {
        // ***********************************************************
        //                  DECLARE VARIABLES
        var vm = this;
        // ***********************************************************
        //                  MAPPING FUNCTIONS
        vm.click = function ( icon ) {
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
                if (newValue != null) {
                    openConfirmModal();
                }
            });
            iconsService.getIcons()
                .then( (response) => {
                    $scope.icons = response;
                } );
            for(var i in $scope.icons){
                var icon = $scope.icons[i];
                icon = trustAsHtml(icon);
            }
        }

        function openConfirmModal() {
            ngDialog.openConfirm({template: 'popupConfirm.pug',
                scope:$scope
            }).then((res)=>{}).catch((res)=>{});
        }

        function trustAsHtml( aString ) {
            return $sce.trustAsHtml(aString);
        }

    }
})();

