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
            ngDialog.openConfirm( {
                    templateUrl: 'mathFormula/add.pug',
                    controller: 'mathFormula/add',
                    scope: {
                        inputs: $scope.item.inputs
                    }
                } )
                .then( function success( input ) {
                    console.info( input );
                    $scope.item.inputs.push( input );
                }, function () {} );
        },

        remove: function () {}

    };
} );
