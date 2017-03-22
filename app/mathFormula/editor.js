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
                    controller: 'mathFormula/add'
                } )
                .then( function success() {

                } );
        }

    };
} );
