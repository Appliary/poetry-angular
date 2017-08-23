app.controller('modals/toolbox', function ($scope, $http, $window, $location, validationService, $filter) {

    // Instantiate new object
    $scope.item = {};
    $scope.fields = $scope.__config.fields;
    $scope.__validation = [];

    var api = $scope.__config.api || $scope.$root.__module.api,
        method = $scope.__config.method || 'post';

    // Get validation
    $http[method]('/__joi' + api)
        .then(function success(response) {
            if (!response.data.payload._inner || !response.data.payload._inner.children) {
                $scope.__joi = response.data.payload;
            } else {

                $scope.__joi = {};
                response.data.payload._inner.children.forEach(
                    function (elem) {
                        $scope.__joi[elem.key] = elem.schema;
                    }
                );
            }

            if ($scope.__joi._type != 'alternatives') {
                if (!$scope.__joi.computed)
                    $scope.__joi.computed = $scope.__joi;
            } else {
                // Get the field that defines which alt
                $scope.__joi._inner.matches[0].schema._inner.children.some(function (a, i) {
                    try {
                        if (a.schema._valids._set.length == 1)
                            return ($scope.__joi.af = a.key);
                    } catch (e) { }
                });

                // Get the alts
                $scope.__joi.alt = {};
                $scope.__joi._inner.matches.forEach(function (alt) {
                    try {

                        // Find the alt field value
                        var afval;
                        alt.schema._inner.children.some(function (field) {

                            if (field.key != $scope.__joi.af)
                                return false; // Nah, not this one

                            afval = field.schema._valids._set[0];
                            return true; // Stop searching

                        });

                        // Save schemas related to the field value
                        $scope.__joi.alt[afval] = {};
                        alt.schema._inner.children.forEach(function (ch) {
                            $scope.__joi.alt[afval][ch.key] = ch.schema;
                        });

                    } catch (e) { }
                });

                // Get the first alt possible value
                $scope.item[$scope.__joi.af] = Object.keys($scope.__joi.alt)[0];

                // When the af changes, change the computed to the related
                var computeAF = function computeAF(n, o) {
                    console.info('ALT changed !', n, o);
                    try {
                        // Try to get the correct validation schema
                        $scope.__joi.computed = $scope.__joi.alt[
                            $scope.item[$scope.__joi.af]
                        ];
                    } catch (e) {
                        // If not found, take the first one available
                        $scope.__joi.computed = $scope.__joi.alt[Object.keys($scope.__joi.alt)[0]];
                    }
                };

                $scope.$watch('item.' + $scope.__joi.af, computeAF);

            }

            $scope.loaded = true;

        }, console.error);

    $scope.save = function save() {

        $http[method](api, $scope.item)
            .then(function success(response) {

                $scope.item.__saved = true;
                $scope.item.__failed = false;

                toastr.success(
                    $filter( 'translate' )( 'The element has been saved:' + $scope.$root.__module.name ),
                    $filter( 'translate' )( 'Saved' )
                );

                $scope.closeThisDialog();

            }, function error(err) {
                console.error(err);
                $scope.item.__failed = true;
                $scope.item.__saved = false;

                $scope.message = err.data.message;

                $scope.__validation = [];

                if (err.status == 400 && err.data && err.data.validation)
                    $scope.__validation = err.data.validation.keys;
            });
    };

    /*
     * Load standard validation transformations
     */
    $scope.inputType = validationService.inputType($scope);
    $scope.inputVisible = validationService.inputVisible($scope);
    $scope.inputEnums = validationService.inputEnums($scope);
    $scope.toDateObject = validationService.toDateObject($scope);

});
