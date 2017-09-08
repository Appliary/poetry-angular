app.service( 'validationService', function validationService( $http, $timeout ) {
    var to;
    return {

        inputType: function inputTypeFactory( $scope ) {
            return function inputType( name ) {

                try {
                    // If there's no validation
                    if ( !$scope.__joi || !$scope.__joi.computed )
                        return 'string';

                    // Readonly specials
                    if ( $scope.item[ name ] ) {
                        var readOnlyType = '';
                        if ( $scope.item[ name ].name )
                            readOnlyType = 'readOnlyName';
                        else if ( $scope.item[ name ].id )
                            readOnlyType = 'readOnlyId';
                        else if ( $scope.item[ name ]._id )
                            readOnlyType = 'readOnly_Id';

                        if ( readOnlyType ) {
                            if ( $scope.__joi.computed[ name ] &&
                                $scope.__joi.computed[ name ]._meta.length &&
                                $scope.__joi.computed[ name ]._tags.indexOf( 'readonly' ) != -1 &&
                                $scope.__joi.computed[ name ]._tags.indexOf( 'submit' ) != -1 ) {
                                $scope.item.__formatSubmit = $scope.item.__formatSubmit || {};
                                $scope.item.__formatSubmit[ name ] = $scope.__joi.computed[ name ]._meta[ 0 ].value || '';
                            }
                            return readOnlyType;
                        }
                    }

                    if ( $scope.__joi.af && $scope.__joi.af == name ) return 'af';

                    // Return the type if in the list
                    if ( ~[
                            'boolean'
                        ].indexOf( $scope.__joi.computed[ name ]._type ) )
                        return $scope.__joi.computed[ name ]._type;

                    // Array
                    if ( $scope.__joi.computed[ name ]._type == 'array' ) {
                        // Special array readonly
                        if ( ~$scope.__joi.computed[ name ]._tags.indexOf( 'readonly' ) ) {
                            $scope.item.__readonlyFields = $scope.item.__readonlyFields || [];
                            if ( $scope.item.__readonlyFields.indexOf( name ) == -1 ) {
                                $scope.item.__readonlyFields.push( name );
                            }
                            return 'readOnlyArray';
                        }

                        // Default string otherwise
                        return 'array';
                    }

                    //generic readonly
                    var roperm;
                    try {
                        if ( $scope.$root.user.role != "SUPER" )
                            roperm = ( $scope.$root
                                .role
                                .permissions[ $scope.$root.__appName ]
                                [ $scope.$root.__module.name ] == 'ro' );
                    } catch ( err ) {

                    }
                    if ( ~$scope.__joi.computed[ name ]._tags.indexOf( 'readonly' ) || roperm ) {
                        if ( $scope.__joi.computed[ name ]._tags.indexOf( 'submit' ) &&
                            $scope.__joi.computed[ name ]._meta.length ) {
                            $scope.item.__formatSubmit = $scope.item.__formatSubmit || {};
                            $scope.item.__formatSubmit[ name ] = $scope.__joi.computed[ name ]._meta[ 0 ].value;
                        } else {
                            $scope.item.__readonlyFields = $scope.item.__readonlyFields || [];
                            if ( $scope.item.__readonlyFields.indexOf( name ) == -1 ) {
                                $scope.item.__readonlyFields.push( name );
                            }
                        }
                        return 'readOnly';
                    }

                    // Dates
                    if ( $scope.__joi.computed[ name ]._type == 'date' ) {
                        // Special date (only handle time)
                        if ( ~$scope.__joi.computed[ name ]._tags.indexOf( 'time' ) )
                            return 'time';

                        // Default string otherwise
                        return 'date';
                    }

                    // Strings
                    if ( $scope.__joi.computed[ name ]._type == 'string' ) {

                        // Special strings
                        if ( ~$scope.__joi.computed[ name ]._tags.indexOf( 'password' ) )
                            return 'password';
                        if ( ~$scope.__joi.computed[ name ]._tags.indexOf( 'textarea' ) )
                            return 'textarea';
                        if ( ~$scope.__joi.computed[ name ]._tags.indexOf( 'icon' ) )
                            return 'icon';

                        // Select enums
                        if ( $scope.__joi.computed[ name ]._flags.allowOnly )
                            return 'enum';

                        // Select from API
                        if ( $scope.__joi.computed[ name ]._meta[ 0 ] )
                            return 'api';

                        if ( $scope.__joi.computed[ name ]._unit )
                            return 'strUnit';

                        // Default string otherwise
                        return 'string';

                    }

                    // Numbers
                    if ( $scope.__joi.computed[ name ]._type == 'number' ) {

                        // With an unit
                        if ( $scope.__joi.computed[ name ]._unit )
                            return 'numUnit';

                        // Special number
                        if ( ~$scope.__joi.computed[ name ]._tags.indexOf( 'timezoneOffset' ) )
                            return 'timezoneOffset';

                        // Default number
                        return 'number';

                    }

                    // Id are not localized
                    if ( name === '_id' )
                        return 'id';

                    // Default readonly
                    return 'readOnly';

                } catch ( e ) {
                    //console.log(e);
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
                                    var meta_show = joi._meta[ 0 ].show;
                                    var show = '';
                                    if ( meta_show ) {
                                        // concat attributes if '+' is present
                                        var attrs = meta_show.split( '+' );
                                        attrs.forEach( function ( attr ) {
                                            show += ' ' + ( opt[ attr ] || '' );
                                            show = show.trim();
                                        } );
                                        if ( !show ) {
                                            show = opt._name || opt[ joi._meta[ 0 ].value || '_id' ];
                                        }
                                    } else {
                                        show = opt._name || opt[ joi._meta[ 0 ].value || '_id' ];
                                    }
                                    return {
                                        value: opt[ joi._meta[ 0 ].value || '_id' ],
                                        show: show
                                    };
                                }
                            );
                        } );
                }

                return $scope.__inputEnums[ field ];
            };
        },

        toDateObject: function toDateObjectFactory( $scope ) {
            return function toDateObject( field, type ) {
                var dateValue = new Date( $scope.item[ field ] || undefined );
                if ( dateValue && type == 'time' ) {
                    $scope.item[ field ] = new Date( 0 );
                    $scope.item[ field ].setHours( dateValue.getHours() );
                    $scope.item[ field ].setMinutes( dateValue.getMinutes() );
                } else {
                    $scope.item[ field ] = dateValue;
                }
                $scope.item.__dateFields = $scope.item.__dateFields || [];
                $scope.item.__dateFields.push( field );
            };
        },

        doBtn: function doBtnFactory( $scope ) {
            return function doBtn( button ) {
                $http[ button.method ]( $scope.$root.__module.api + '/' + $scope.__id + '/' + button.path )
                    .then( function success( a ) {
                        toastr.success(
                            $filter( 'translate' )( 'Action succeed:' + $scope.$root.__module.name ),
                            $filter( 'translate' )( 'Saved' )
                        );
                    }, function failed( e ) {
                        if ( window.clientInformation && !window.clientInformation.onLine )
                            e.statusText = "You seems to be offline";

                        else if ( e.status == -1 )
                            e.statusText = "Server not available";

                        var errkind = 'error';
                        if ( e.status >= 500 )
                            errkind = 'warning';

                        toastr[ errkind ](
                            $filter( 'translate' )( e.statusText ),
                            $filter( 'translate' )( 'Error' ) + ' ' + e.status
                        );
                    } );
            };
        },

        displayBtn: function displayBtnFactory( $scope ) {
            return function displayBtn( button ) {
                if ( !( angular.isObject( button.condition ) && button.condition.hasOwnProperty( 'property' ) ) )
                    return true;

                if ( !button.condition.hasOwnProperty( 'boolean' ) )
                    button.condition.boolean = true;

                if ( button.condition.boolean )
                    return $scope.item[ button.condition.property ];
                else {
                    return !$scope.item[ button.condition.property ];
                }
            };
        }

    };
} );
