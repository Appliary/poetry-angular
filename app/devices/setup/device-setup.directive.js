(function () {
    'use strict';

    app.directive('devicesSetup', devicesSetup);

    function devicesSetup() {
        var directive = {
            replace: true,
            restrict: 'E',
            templateUrl: "devices/setup/device-setup.directive.pug",
            controller: deviceSetupController,
            scope: {
                item: "="
            },
            controllerAs: 'vm',
            bindToController: true
        };

        return directive;
    }

    deviceSetupController.$inject = ['$scope', 'deviceService', 'iconsService', '$timeout'];

    /* @ngInject */
    function deviceSetupController($scope, deviceService, iconsService, $timeout) {
        // ***********************************************************
        //                  DECLARE VARIABLES
        var vm = this;
        vm.loadingUpdate = false;
        vm.device = {};
        vm.gps = {};
        vm.network = {};
        vm.colorPicker = {
            value: null
        };
        vm.procSelectIcon = null;
        // ***********************************************************
        //                  MAPPING FUNCTIONS
        vm.updateStaticPositionsDevice = updateStaticPositionsDevice;
        vm.updateDevice = updateDevice;
        // ***********************************************************
        //                  ACTIVATE
        activate();
        // ***********************************************************
        //                  DECLARE FUNCTIONS
        function activate() {
            vm.eventApi = {
                onChange: function (api, color) {
                    handleColorUpdated(color);
                }
            };

            iconsService.getIcon("ic_place_black_36dp.png")
                .then(function (icon) {
                    vm.mapIcon = icon;
                    vm.mapIcon.data = "data:image/png;base64," + vm.mapIcon.data;
                });

            vm.colorPicker.options = {
                format: 'hex',
                lightness: false,
                saturation: false,
                pos: 'top left'
            };

            /**
             * On click of the icon
             */
            $scope.$watch('vm.iconSelected', function (newValue, oldValue) {
                if (newValue) {
                    drawImageOnCanvas(newValue, "canvas");
                }
            });

            $scope.$watch('vm.item', function (newValue, oldValue) {

                if (newValue) {
                    resetSetup();
                    var idDevice = newValue._id;

                    vm.device = {};
                    vm.gps = {};
                    vm.network = {};
                    vm.staticPosition = {};
                    $scope.__saved = false;
                    $scope.__failed = false;


                    deviceService.getDevicePositions(idDevice)
                        .then(function (response) {

                            drawImageOnCanvas(response.device.icon, "canvas");
                            drawImageOnCanvas(response.device.iconHistory, "canvasHistory");

                            vm.icon = response.device.icon;
                            vm.device = response.device;

                            vm.device.updatedAt = newValue.updatedAt;
                            vm.device.updatedBy = newValue.updatedBy;

                            initColorPicker(response.device);
                            vm.gps = response.gps;
                            vm.network = response.network;
                            vm.lbs = response.lbs;
                            vm.staticPosition = response.staticPosition;
                        })
                        .catch(function (error) {
                            resetSetup();
                        })
                }
            });
        }

        function updateDevice() {
            if (vm.loadingUpdate) {
                return;
            }
            $scope.__saved = false;
            $scope.__failed = false;
            vm.loadingUpdate = true;
            var idDevice = vm.device._id;
            var payload = { iconHistory: vm.iconHistory };
            if (vm.colorPicker.value) {
                payload['iconColor'] = vm.colorPicker.value.slice(1, vm.colorPicker.value.length);
            }
            if (vm.staticPosition && vm.staticPosition.positions && vm.staticPosition.positions.lat && vm.staticPosition.positions.lng) {
                payload['staticPosition'] = {
                    lat: vm.staticPosition.positions.lat,
                    lng: vm.staticPosition.positions.lng,
                }
            }
            if (vm.iconSelected) {
                payload['icon'] = vm.iconSelected;
            }
            payload.name = vm.device.name;
            payload.status = vm.device.status;
            deviceService.updateDevice(idDevice, payload)
                .then(function (response) {
                    console.log(response);
                    vm.loadingUpdate = false;
                    $scope.__saved = true;
                })
                .catch(function (error) {
                    console.log(error);
                    vm.loadingUpdate = false;
                    $scope.__failed = true;
                })
        }

        function updateStaticPositionsDevice(position) {
            var idDevice = vm.device._id;
            var payload = {
                staticPosition: {
                    lat: position.lat,
                    lng: position.lng,
                }
            };
            deviceService.updateDevice(idDevice, payload)
                .then(function (response) {
                    console.log(response);
                })
                .catch(function (error) {
                    console.log(error);
                })
        }

        function handleColorUpdated(color) {
            updateIconColorReal(color, "canvas");
            updateIconColorReal(color, "canvasHistory");

            vm.iconSelected = pngToBase64('canvas');
            vm.iconHistory = pngToBase64('canvasHistory');
        }

        function clearCanvas(canvasId) {
            var canvas = document.getElementById(canvasId);
            var ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        function updateIconColorReal(color, canvasId) {
            var rgbColor = hexToRgbA(color);
            var canvas = document.getElementById(canvasId);
            var ctx = canvas.getContext("2d");
            var imgd = ctx.getImageData(0, 0, 128, 128);
            var pix = imgd.data;
            var uniqueColor = [rgbColor.red, rgbColor.blue, rgbColor.green];

            // Loops through all of the pixels and modifies the components.
            for (var i = 0, n = pix.length; i < n; i += 4) {
                pix[i] = uniqueColor[0];   // Red component
                pix[i + 1] = uniqueColor[1]; // Blue component
                pix[i + 2] = uniqueColor[2]; // Green component
            }
            ctx.putImageData(imgd, 0, 0);
        }

        function drawImageOnCanvas(imgB64, canvasId) {
            var canvas = document.getElementById(canvasId);
            var ctx = canvas.getContext("2d");
            clearCanvas(canvasId);

            var image = new Image();
            image.onload = function () {
                clearCanvas(canvasId);
                ctx.drawImage(image, 0, 0);
                handleColorUpdated(vm.colorPicker.value);
            };
            image.src = "data:image/png;base64," + imgB64;
        }

        function hexToRgbA(hex) {
            var c;
            if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
                c = hex.substring(1).split('');
                if (c.length == 3) {
                    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
                }
                c = '0x' + c.join('');
                return {
                    red: (c >> 16) & 255,
                    blue: (c >> 8) & 255,
                    green: c & 255
                }
            }
            throw new Error('Bad Hex');
        }

        function initColorPicker(device) {
            var color = "#" + device.iconColor;
            if (device.iconColor) {
                vm.colorPicker.value = color;
            } else {
                vm.colorPicker.value = "#000000";
            }
            setTimeout(function () {
                handleColorUpdated(vm.colorPicker.value)
            }, 50);
        }

        function resetSetup() {
            vm.device = {};
            vm.gps = {};
            vm.network = {};
            vm.staticPosition = {};
            vm.colorPicker.value = "#000000";

            clearCanvas('canvas');
            clearCanvas('canvasHistory');

            setTimeout(function () {
                handleColorUpdated(vm.colorPicker.value)
            }, 50);
        }

        function pngToBase64(canvasId) {
            var canvas = document.getElementById(canvasId);
            var dataUrl = canvas.toDataURL();
            return dataUrl.slice(22, dataUrl.length);
        }

        $scope.openModal = function () {
            vm.currentIcon = vm.iconSelected;
            $scope.currentIcon = vm.iconSelected;
            $scope.vm.currentIcon = vm.iconSelected;

            console.log(vm);
            console.log($scope);

            vm.procSelectIcon = !vm.procSelectIcon;
            $timeout(function () {
                if ($('.modal')[0])
                    $('.modal')[0].style.display = "block";
                else $scope.openModal();
            }, 500);
        }

    }
})();
