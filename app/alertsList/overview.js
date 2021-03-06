app.controller( 'alertsList/overview', function ( $scope, $http, ngDialog, validationService ) {

    console.log("alertsList/overview", $scope.$parent.$parent.$parent);
    $scope.root = $scope.$parent.$parent.$parent;

    $scope.$watch( 'root.moduleApi', function init() {
        // Get validation object
        $http.put( '/__joi/api/' + $scope.root.moduleApi + '/id' )
            .then( function success( response ) {
                if ( !response.data.payload._inner || !response.data.payload._inner.children ) {
                    $scope.__joi = response.data.payload;
                } else {

                    $scope.__joi = {};
                    response.data.payload._inner.children.forEach(
                        function ( elem ) {
                            $scope.__joi[ elem.key ] = elem.schema;
                        }
                    );
                }

                if ( $scope.__joi._type != 'alternatives' ) {
                    if ( !$scope.__joi.computed )
                        $scope.__joi.computed = $scope.__joi;
                } else {
                    // Get the field that defines which alt
                    $scope.__joi._inner.matches[ 0 ].schema._inner.children.some( function ( a, i ) {
                        try {
                            if ( a.schema._valids._set.length == 1 )
                                return ( $scope.__joi.af = a.key );
                        } catch ( e ) {}
                    } );

                    // Get the alts
                    $scope.__joi.alt = {};
                    $scope.__joi._inner.matches.forEach( function ( alt ) {

                        try {

                            // Find the alt field value
                            var afval;
                            alt.schema._inner.children.some( function ( field ) {

                                if ( field.key != $scope.__joi.af )
                                    return false; // Nah, not this one

                                afval = field.schema._valids._set[ 0 ];
                                return true; // Stop searching

                            } );

                            // Save schemas related to the field value
                            $scope.__joi.alt[ afval ] = {};
                            alt.schema._inner.children.forEach( function ( ch ) {
                                $scope.__joi.alt[ afval ][ ch.key ] = ch.schema;
                            } );

                        } catch ( e ) {}

                    } );

                    var nbInit = 0;

                    // When the af changes, change the computed to the related
                    var computeAF = function computeAF( n, o ) {
                        console.info( 'ALT changed !', n, o );
                        console.debug($scope.__joi.alt);
                        try {
                            // Try to get the correct validation schema
                            $scope.__joi.computed = $scope.__joi.alt[
                                $scope.item[ $scope.__joi.af ]
                            ];
                            if(!$scope.__joi.computed && !nbInit){
                              nbInit++;
                              $scope.item[ $scope.__joi.af ] = Object.keys( $scope.__joi.alt )[ 0 ];
                              $scope.__joi.computed = $scope.__joi.alt[ Object.keys( $scope.__joi.alt )[ 0 ] ];
                            }
                        } catch ( e ) {
                            // If not found, take the first one available
                            $scope.__joi.computed = $scope.__joi.alt[ Object.keys( $scope.__joi.alt )[ 0 ] ];
                        }
                    };

                    $scope.$watch( 'item.' + $scope.__joi.af, computeAF );

                }

            }, console.error );
    } );

    /**
     * Delete the current item
     */
    $scope.confirmDeletion = function confirmDeletion() {
        return ngDialog.openConfirm( {
                templateUrl: 'modals/confirmation.pug',
                className: 'ngdialog-theme-default'
            } )
            .then( function confirmed() {
                $http.delete( $scope.root.moduleApi + '/' + $scope.root.__id )
                    .then( function ( res ) {
                        $scope.data.some( function ( v, i ) {

                            // Not this one, continue the search
                            if ( v._id !== res.data._id )
                                return false;

                            // Same ID, delete and stop search
                            $scope.data.splice( i, 1 );
                            return true;

                        } );
                        // Close panel
                        $scope.$root.go( $scope.$root.__module );
                    } );
            } );
    };

    /*
     * Load standard validation transformations
     */
    $scope.inputType = validationService.inputType( $scope );
    $scope.inputVisible = validationService.inputVisible( $scope );
    $scope.inputEnums = validationService.inputEnums( $scope );
    $scope.toDateObject = validationService.toDateObject( $scope );
    $scope.doBtn = validationService.doBtn( $scope );
    $scope.displayBtn = validationService.displayBtn( $scope );

    $scope.translateMessageField = function(field){
      if(!field) return true;

      /*if(!(field.endsWith('FR') || field.endsWith('NL'))) return true;

      field = field.toLowerCase();

      if(!($scope.$root.user && $scope.$root.user.language)) return true;

      return field.endsWith($scope.$root.user.language);
      */
      if(!field.startsWith("message")) return true;

      if(!($scope.$root.user && $scope.$root.user.language)){
        return field == "message";
      }

      var available = ['fr','nl'];

      if(available.indexOf($scope.$root.user.language) == -1){
        return field == "message";
      }
      field = field.toLowerCase();
      return field.endsWith($scope.$root.user.language);
    }
} );
