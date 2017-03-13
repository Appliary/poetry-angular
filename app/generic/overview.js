app.controller( 'generic/overview', function ( $scope, $http, ngDialog ) {
    // Get validation object
    $http.put( '/__joi' + $scope.$root.__module.api + '/id' )
        .then( function success( response ) {
            if ( !response.data.payload._inner || !response.data.payload._inner.children )
                return ( $scope.__joi = response.data.payload );

            $scope.__joi = {};
            response.data.payload._inner.children.forEach( function ( elem ) {
                $scope.__joi[ elem.key ] = elem.schema;
            } );
        }, function error( err ) {} );

    $scope.inputType = function ( name ) {
        try {
            // If there's no validation
            if ( !$scope.__joi )
                return 'string';

            if ( !$scope.__joi.computed && $scope.__joi._type != 'alternatives' )
                $scope.__joi.computed = $scope.__joi;

            // Id are not localized
            if ( name === '_id' )
                return 'id';

            // Readonly specials
            if ( $scope.item[ name ] ) {
                if ( $scope.item[ name ].name ) return 'readOnlyName';
                if ( $scope.item[ name ].id ) return 'readOnlyId';
                if ( $scope.item[ name ]._id ) return 'readOnly_Id';
            }

            // Return the type if in the list
            if ( ~[
                    'array',
                    'boolean',
                    'date'
                ].indexOf( $scope.__joi.computed[ name ]._type ) )
                return $scope.__joi.computed[ name ]._type;

            // Strings
            if ( $scope.__joi.computed[ name ]._type == 'string' ) {

                // Special strings
                if ( ~$scope.__joi.computed[ name ]._tags.indexOf( 'password' ) )
                    return 'password';
                if ( ~$scope.__joi.computed[ name ]._tags.indexOf( 'textarea' ) )
                    return 'textarea';

                // Select enums
                if ( $scope.__joi.computed[ name ]._flags.allowOnly )
                    return 'enum';

                // Select from API
                if ( $scope.__joi.computed[ name ]._meta[ 0 ] )
                    return 'api';

                // Default string otherwise
                return 'string';

            }

            // Numbers
            if ( $scope.__joi.computed[ name ]._type == 'number' ) {

                // With an unit
                if ( $scope.__joi.computed[ name ]._unit )
                    return 'unit';

                // Default number
                return 'number';

            }

            // Default readonly
            return 'readOnly';

        } catch ( e ) {
            return 'readOnly';
        }

    };

    $scope.inputVisible = function ( name ) {

        // If not alternatives
        if ( $scope.__joi._type != 'alternatives' ) {
            if ( !$scope.__joi.computed )
                $scope.__joi.computed = $scope.__joi;
            return true;
        }

        if ( !$scope.__joi.af ) {

            // Get the field that defines which alt
            $scope.__joi.af = $scope.__joi._inner.matches[ 0 ].schema._inner.children.some( function ( a, i ) {
                try {
                    if ( a._valids._set.length == 1 ) return i;
                } catch ( e ) {}
            } );

            // Failed, show anyway
            if ( !$scope.__joi.af )
                return true;

        }

        if ( !$scope.__joi.alt ) {

            // Get the alts
            $scope.__joi.alt = {};
            $scope.__joi._inner.matches.forEach( function ( a ) {
                $scope.__joi.alt[ a.schema._inner.children[ $scope.__joi.af ]._valids._set[ 0 ] ] = a.schema._inner.children;
            } );

        }

        $scope.$watch( '__joi.af', function () {
            $scope.__joi.computed = $scope.__joi.alt[ $scope.item[ $scope.__joi.af ] ];
        } );

        if ( name == $scope.__joi.af )
            return true;

        if ( $scope.__joi.computed[ name ] ) return true;

        return false;

    };

    $scope.inputEnums = function ( field ) {

        var joi = $scope.__joi.computed[ field ];
        if ( !joi ) return;
        if ( !$scope.__inputEnums ) $scope.__inputEnums = {};

        if ( !$scope.__inputEnums[ field ] ) {
            $scope.__inputEnums[ field ] = [];
            $http[ joi._meta[ 0 ].method ]( joi._meta[ 0 ].path )
                .then( function success( response ) {
                    if ( response.data && response.data.data )
                        response.data = response.data.data;
                    if ( !response.data || !response.data.map )
                        return console.warn( response );
                    $scope.__inputEnums[ field ] = response.data.map(
                        function ( opt ) {
                            return {
                                value: opt[ joi._meta[ 0 ].value || '_id' ],
                                show: opt[ joi._meta[ 0 ].show || '_name' ] || opt[ joi._meta[ 0 ].value || '_id' ]
                            };
                        }
                    );
                } );
        }

        return $scope.__inputEnums[ field ];
    };

    /**
     * Convert a field value into a date object
     */
    $scope.toDateObject = function ( field ) {
        $scope.item[ field ] = new Date( $scope.item[ field ] );

        $scope.item.__dateFields = $scope.item.__dateFields || [];
        $scope.item.__dateFields.push( field );
    };

    /**
     * Delete the current item
     */
    $scope.confirmDeletion = function confirmDeletion() {
        return ngDialog.openConfirm( {
                templateUrl: 'modals/confirmation.pug'
            } )
            .then( function confirmed() {
                $http.delete( $scope.$root.__module.api + '/' + $scope.__id )
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

} );
