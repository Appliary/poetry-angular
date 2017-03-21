app.service( 'validationService', function validationService( $http ) {
    return {

        inputType: function inputTypeFactory( $scope ) {
            return function inputType( name ) {

                try {
                    // If there's no validation
                    if ( !$scope.__joi || !$scope.__joi.computed )
                        return 'string';

                    // Id are not localized
                    if ( name === '_id' )
                        return 'id';

                    // Readonly specials
                    if ( $scope.item[ name ] ) {
                        if ( $scope.item[ name ].name ) return 'readOnlyName';
                        if ( $scope.item[ name ].id ) return 'readOnlyId';
                        if ( $scope.item[ name ]._id ) return 'readOnly_Id';
                    }

                    if ( $scope.__joi.af && $scope.__joi.af == name ) return 'af';

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
        },

        inputVisible: function inputVisibleFactory( $scope ) {
            return function inputVisible( name ) {

                // If not alternatives or af not found
                if ( !$scope.__joi || !$scope.__joi.af || !$scope.__joi.computed )
                    return true;

                if ( name == $scope.__joi.af )
                    return true;

                if ( $scope.__joi.computed[ name ] ) return true;

                return false;

            };
        },

        inputEnums: function inputEnumsFactory( $scope ) {
            return function inputEnums( field ) {

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
        },

        toDateObject: function toDateObjectFactory( $scope ) {
            return function toDateObject( field ) {
                $scope.item[ field ] = new Date( $scope.item[ field ] );

                $scope.item.__dateFields = $scope.item.__dateFields || [];
                $scope.item.__dateFields.push( field );
            };
        },

        doBtn: function doBtnFactory( $scope ) {
            return function doBtn( button ) {
                $http[ button.method ]( $scope.$root.__module.api + '/' + $scope.__id + '/' + button.path )
                    .then( function success( a ) {
                        console.info( a );
                    }, function failed( e ) {
                        console.error( e );
                    } );
            };
        }

    };
} );
