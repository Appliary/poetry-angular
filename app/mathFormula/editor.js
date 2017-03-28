app.controller( 'mathFormula/editor', function (
    $scope,
    $http,
    ngDialog
) {

    $scope.inputs = {

        /**
         * inputs.add()
         * Open a modal to create a new input for the formula
         */
        add: function add() {

            var scope = $scope.$new();
            scope.inputs = $scope.item.inputs;

            ngDialog.openConfirm( {
                    templateUrl: 'mathFormula/add.pug',
                    controller: 'mathFormula/add',
                    scope: scope
                } )
                .then( function success( input ) {

                    if ( !$scope.item.inputs )
                        $scope.item.inputs = [];

                    $scope.item.inputs.push( {
                        varName: input.varName,
                        kind: input.device.kind,
                        id: input.device._id,
                        type: input.type,
                        time: input.time
                    } );

                }, function () {} );

        },

        remove: function ( i ) {

            ngDialog.openConfirm( {
                    templateUrl: 'modals/confirmation.pug'
                } )
                .then( function success() {

                    $scope.item.inputs.splice( i, 1 );

                }, function () {} );

        }

    };

    $scope.inputValues = {};

    function getVars() {

        $scope.inputValues = {};
        if ( !$scope.item || !$scope.item.inputs || !$scope.item.inputs.length ) return;
        $scope.currentOutput = '';
        $scope.currentOutputErr = false;

        $http.post( '/api/rules/getVars', {
                inputs: $scope.item.inputs
            } )
            .then( function success( d ) {
                $scope.inputValues = d.data;
                testFormula( true );
            }, console.error );
    }
    $scope.$watchCollection( 'item.inputs', getVars );

    function testFormula( n ) {
        if ( !n )
            return ( $scope.currentOutput = '' );

        var out;
        try {
            out = math.eval( $scope.item.formula, $scope.inputValues );
            $scope.currentOutputErr = false;
        } catch ( err ) {
            out = err;
            $scope.currentOutputErr = true;
        }

        $scope.currentOutput = out;

    }
    $scope.$watch( 'item.formula', testFormula );
} );
