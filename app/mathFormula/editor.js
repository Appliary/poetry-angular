app.controller( 'mathFormula/editor', function ( $scope, $http, $timeout ) {

    $scope.inputValues = {};
    $scope.newInput = {};

    $scope.checkVarName = function checkVarName() {

        if ( !$scope.newInput ) $scope.newInput = {};

        var varName = $scope.newInput.varName;
        if ( !varName ) return true;

        if ( ~[
                'pi',
                'e',
                'sin',
                'cos',
                'min',
                'max',
                'avg',
                'sqrt',
                'log',
                'exp',
                'tau',
                'phi',
                'PI',
                'E',
                'SQRT2',
                'null',
                'undefined',
                'NaN',
                'LN2',
                'LN10',
                'LOG2E',
                'LOG10E',
                'Infinity',
                'i',
                'uninitialized',
                'version',
                'add',
                'cub',
                'divide',
                'ceil',
                'hypot',
                'floor',
                'exp',
                'fix',
                'mod',
                'round',
                'sign',
                'sqrt',
                'square',
                'substract',
                'pow',
                'norm',
                'xgcd'
            ].indexOf( varName ) )
            return true;

        if ( !varName.match( /^[a-z_]+$/i ) )
            return true;

        var error = false;
        if ( $scope.item && $scope.item.inputs )
            $scope.item.inputs.forEach( function ( i ) {
                if ( varName == i.varName ) error = true;
            } );

        return error;

    };

    function testFormula( n ) {

        if ( !n )
            return $scope.currentOutput = '';

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

    $scope.$watchCollection( 'item.inputs', function getCurrValues( n ) {

        if ( !n ) return;

        var devices = {};
        n.forEach( function ( i ) {
            if ( !devices[ i.device ] )
                devices[ i.device ] = [];
            devices[ i.device ].push( i );
        } );

        Object.keys( devices )
            .forEach( function ( deviceID ) {
                $http.get( '/api/devices/' + deviceID )
                    .then( function success( res ) {
                        var device = res.data;
                        device.last.forEach( function ( measurement ) {
                            devices[ deviceID ].forEach( function ( value ) {

                                if ( value.type != measurement.type || value.id != measurement.id ) return;

                                $scope.inputValues[ value.varName ] = measurement.value;

                                testFormula(true);
                            } );
                        } );
                    } );
            } );

    } );

    function searchDevice( n ) {

        $scope.newInput.searchResults = undefined;

        $http.get( '/api/devices?limit=20&search=' + encodeURIComponent( n || '' ) )
            .then( function success( res ) {
                $scope.newInput.searchResults = res.data.data || [];
            } );

    }
    searchDevice( '' );
    $scope.$watch( 'newInput.deviceSearch', searchDevice );

    $scope.addInput = function addInput() {
        if(!$scope.item.inputs)
            $scope.item.inputs = [];
        $scope.item.inputs.push( {
            varName: $scope.newInput.varName,
            device: $scope.newInput.device._id,
            type: $scope.newInput.device.last[ $scope.newInput.measurement ].type,
            id: $scope.newInput.device.last[ $scope.newInput.measurement ].id
        } );
        $scope.newInput = {};
    }

} );
