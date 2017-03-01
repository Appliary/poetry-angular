(function () {
    'use strict';


    app.directive('addDevice', addDevice);

    function addDevice() {
        var directive = {
            replace: true,
            restrict: 'E',
            templateUrl: "devices/add/add-device.directive.pug",
            controller: addDeviceController,
            scope: {
                device: "="
            },
            controllerAs: 'vm',
            bindToController: true
        };

        return directive;
    }

    addDeviceController.$inject = [ 'deviceService'];

    /* @ngInject */
    function addDeviceController(deviceService) {
        var vm = this;
        // ***********************************************************
        //                  DECLARE VARIABLES

        vm.dataSelectStatus = [ 'new', 'active', 'archived', 'blocked', 'deleted' ];
        vm.dataSelectType = ["raw","elsys"];
        vm.isWaiting = false;


        // ***********************************************************
        //                  MAPPING FUNCTIONS
        vm.addNewDevice = addNewDevice;


        // ***********************************************************
        //                      ACTIVATE
        activate();
        // ***********************************************************
        //                  DECLARE FUNCTIONS

        function activate() {

            setTimeout(function () {
                console.log( vm.device );
            },500);


            deviceService.getAllDevices()
                .then(function (response) {
                    console.log( response );
                })
                .catch(function (error) {
                    console.log( error );
                });

        }

        function addNewDevice () {
            /**
             * We disable the button add
             */
            vm.isWaiting = true;

            var newDevice = deviceService.transformDataFormToApi( vm.device );

            //TODO: Manage errors
            deviceService.addNewDevice( newDevice )
                .then(function (response) {
                    console.log( response );

                    vm.isWaiting = false;

                })
                .catch(function (error) {
                    console.log( error );

                    vm.isWaiting = false;

                });
        }



    }
})();
