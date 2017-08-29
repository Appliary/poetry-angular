app.controller('generic/overview', function ($scope, $http, ngDialog, validationService) {

    var api = $scope.$root.__module.editApi || $scope.$root.__module.api;

    $scope.$watch('$root.__module.name', function init() {

        api = $scope.$root.__module.editApi || $scope.$root.__module.api;
        var suffix = $scope.$root.__module.suffix === false ? '' :
          ($scope.$root.__module.suffix === true ? '/validation' : ($scope.$root.__module.suffix || '/validation')
        );

        // Get validation object
        $http.put('/__joi' + api + suffix)
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

                    var nbInit = 0;

                    // When the af changes, change the computed to the related
                    var computeAF = function computeAF(n, o) {
                        console.info('ALT changed !', n, o);
                        console.debug($scope.__joi.alt);
                        console.log("tabdrop");
                        $('.nav-tabs').tabdrop();
                        try {
                            // Try to get the correct validation schema
                            $scope.__joi.computed = $scope.__joi.alt[
                                $scope.item[$scope.__joi.af]
                            ];
                            if (!$scope.__joi.computed && !nbInit) {
                                nbInit++;
                                $scope.item[$scope.__joi.af] = Object.keys($scope.__joi.alt)[0];
                                $scope.__joi.computed = $scope.__joi.alt[Object.keys($scope.__joi.alt)[0]];
                            }
                        } catch (e) {
                            // If not found, take the first one available
                            $scope.__joi.computed = $scope.__joi.alt[Object.keys($scope.__joi.alt)[0]];
                        }
                    };

                    $scope.$watch('item.' + $scope.__joi.af, computeAF);

                }

            }, console.error);
    });

    /**
     * Delete the current item
     */
    $scope.confirmDeletion = function confirmDeletion() {
        return ngDialog.openConfirm({
            templateUrl: 'modals/confirmation.pug',
            className: 'ngdialog-theme-default'
        })
            .then(function confirmed() {
                $http.delete(api + '/' + $scope.__id)
                    .then(function (res) {
                        $scope.data.some(function (v, i) {

                            // Not this one, continue the search
                            if (v._id !== res.data._id)
                                return false;

                            // Same ID, delete and stop search
                            $scope.data.splice(i, 1);
                            return true;

                        });
                        // Close panel
                        $scope.$root.go($scope.$root.__module);
                    });
            });
    };

    /*
     * Load standard validation transformations
     */
    $scope.inputType = validationService.inputType($scope);
    $scope.inputVisible = validationService.inputVisible($scope);
    $scope.inputEnums = validationService.inputEnums($scope);
    $scope.toDateObject = validationService.toDateObject($scope);
    $scope.doBtn = validationService.doBtn($scope);
    $scope.displayBtn = validationService.displayBtn($scope);

});
