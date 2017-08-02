app.controller('mathFormula/editor', function (
    $scope,
    $http,
    ngDialog
) {

    // example of config parameters
    var defaultConfig = {
        "filters": [
            "devices",
            "smartdevices",
            "tags"
        ],
        "formulaInput": true
    };

    $scope.mathFormulaConfig = defaultConfig;

    $scope.formulaInput = true;

    try {
        var mfConfig = $scope.$root.__module.config.mathFormula;
        if (angular.isObject(mfConfig)) {
            if (angular.isObject(mfConfig.alternatives)) {
                var propertyName = mfConfig.alternatives.property;
                $scope.$watch("item." + propertyName, function (propertyValue) {
                    if (angular.isObject(mfConfig.alternatives.values[propertyValue])) {
                        $scope.mathFormulaConfig = mfConfig.alternatives.values[propertyValue];

                        preConfigure();
                    }
                    console.debug("item." + propertyName, "=", propertyValue);
                });
            } else {
                $scope.mathFormulaConfig = mfConfig;
                preConfigure();
            }
        }
    } catch (e) {
        console.debug(e);
    }

    function preConfigure() {
        var mfConfig = $scope.mathFormulaConfig;
        if (!angular.isObject(mfConfig))
            return;

        if (mfConfig.hasOwnProperty('formulaInput')) {
            $scope.formulaInput = mfConfig.formulaInput;
        }
        else {
            $scope.formulaInput = true;
        }
    }

    $scope.showVals = function showVals(vals) {
        var scope = $scope.$new();
        scope.vals = vals;
        ngDialog.openConfirm({
            templateUrl: 'mathFormula/showVals.pug',
            scope: scope,
            className: 'ngdialog-theme-default',
            width: '450px'
        });
    };

    $scope.inputs = {

        /**
         * inputs.add()
         * Open a modal to create a new input for the formula
         */
        add: function add() {

            var scope = $scope.$new();
            scope.inputs = $scope.item.inputs;

            ngDialog.openConfirm({
                templateUrl: 'mathFormula/add.pug',
                controller: 'mathFormula/add',
                scope: scope,
                className: 'ngdialog-theme-default',
                width: '450px'
            })
                .then(function success(input) {

                    if (!$scope.item.inputs)
                        $scope.item.inputs = [];

                    $scope.item.inputs.push({
                        varName: input.varName,
                        kind: input.device.kind,
                        id: input.device._id,
                        type: input.type ? input.type[0] : undefined,
                        indice: input.type ? input.type[1] : undefined,
                        time: input.time
                    });

                }, function () { });

        },

        remove: function (i) {

            ngDialog.openConfirm({
                templateUrl: 'modals/confirmation.pug',
                className: 'ngdialog-theme-default',
                width: '450px'
            })
                .then(function success() {

                    $scope.item.inputs.splice(i, 1);

                }, function () { });

        }

    };

    $scope.inputValues = {};

    function getVars() {

        $scope.inputValues = {};
        if (!$scope.item || !$scope.item.inputs || !$scope.item.inputs.length) return;
        $scope.currentOutput = '';
        $scope.currentOutputErr = false;

        $http.post('/api/rules/getVars', {
            inputs: $scope.item.inputs
        })
            .then(function success(d) {
                $scope.inputValues = d.data;
                testFormula(true);
            }, console.error);
    }
    $scope.$watchCollection('item.inputs', getVars);

    function testFormula(n) {
        if (!n)
            return ($scope.currentOutput = '');

        var out;
        try {
            out = math.eval($scope.item.formula, $scope.inputValues);
            $scope.currentOutputErr = false;
        } catch (err) {
            out = err;
            $scope.currentOutputErr = true;
        }

        $scope.currentOutput = out;

    }
    $scope.$watch('item.formula', testFormula);
});
