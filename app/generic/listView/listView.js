app.directive( "listView", function ( $timeout, $window, $q, listViewService ) {
    return {
        restrict: 'EA',
        transclude: false,
        templateUrl: "generic/listView/listView.pug",
        scope: {
            pColumns: "=columns", //[object] = {key, label, class, type}
            data: "=", //[object]
            config: "<",

            selectedFn: "<?", //params: _id
            sortFn: "<?", //params: sort, order
            atBottom: "&?",

            //mostly used for display
            filtered: "=",
            item: "=",
            minHeight: "<?",
            maxHeight: "<?"
        },
        link: function ( scope, elem, attrs, ctrls ) {

            /**
             * VARS
             */
            var hasMeasurements = false;
            var measurementsCount = 0;

            //scope._id;

            scope.config = isObject( scope.config ) ? scope.config : {};

            scope.sorting = {};

            if ( isObject( scope.config.defaultSort ) ) {
                if ( scope.config.defaultSort.key ) {
                    scope.sorting.key = scope.config.defaultSort.key;
                } else if ( scope.config.defaultSort.col ) {
                    scope.sorting.key = scope.config.defaultSort.col;
                }
                scope.sorting.order = scope.config.defaultSort.order == "asc" ? "asc" : "desc";
            }


            scope.measurementsColumn = {};

            /**
             * FUNCTIONS
             */
            print( "loading" );

            function print( message ) {
                if ( !scope.config.debug )
                    return;
                console.log( "%c [listView] " + JSON.stringify( message ), "background-color: black; color: #2BFF00" );
            }

            function getUserLanguage() {
                return ( scope.$root.user ) ? scope.$root.user.language : "";
            }

            scope.ng = angular;

            scope.select = select;

            function select( _id ) {
                if ( scope.config.noDetails || scope._id == _id ) {
                    return;
                }
                if ( isFunction( scope.selectedFn ) ) {
                    scope.selectedFn( _id );
                }
                print( "selectedFn(" + _id + ")" );
            }

            scope.sort = sort;

            function sort( column ) {
                if ( column.key == scope.sorting.key ) {
                    scope.sorting.order = scope.sorting.order == 'asc' ? 'desc' : 'asc';
                } else {
                    scope.sorting.key = column.key;
                    scope.sorting.order = 'asc';
                }
                if ( isFunction( scope.sortFn ) ) {
                    $timeout(
                        function () {
                            scope.sortFn( scope.sorting.key, scope.sorting.order );
                        },
                        100
                    );
                }
                print( "sortFn(" + scope.sorting.key + ", " + scope.sorting.order + ") =>" );
            }

            // isDefined
            scope.isDefined = isDefined;

            function isDefined( v ) {
                return v !== null && !angular.isUndefined( v ) && v;
            }

            // isUndefined
            scope.isUndefined = isUndefined;

            function isUndefined( v ) {
                return v === null || angular.isUndefined( v );
            }

            // isObject
            scope.isObject = isObject;

            function isObject( v ) {
                return v && angular.isObject( v );
            }

            // isFunction
            scope.isFunction = isFunction;

            function isFunction( v ) {
                return typeof v === 'function';
            }

            // isTimedOut
            scope.isTimedOut = isTimedOut;

            function isTimedOut( row ) {
                return scope.config.timeout && row.hasOwnProperty( 'timeout' ) && row.timeout;
            }

            // isContext
            scope.isContext = isContext;

            function isContext( coord ) {
                return isObject( coord ) && coord.hasOwnProperty( 'id' ) && coord.hasOwnProperty( 'kind' );
            }

            // isDataType
            scope.isDataType = isDataType;

            function isDataType( column ) {
                return column.type == 'data' || ( column.type == 'subkey' && column.subtype == 'data' );
            }

            // sameDataTypeValue
            scope.sameDataTypeValue = sameDataTypeValue;

            function sameDataTypeValue( row, col1, col2 ) {
                if ( !( isDataType( col1 ) && isDataType( col2 ) ) ) {
                    return false;
                }
                return getSubkeyValue( row, col1 ) == getSubkeyValue( row, col2 );
            }

            function getSubkeyValue( row, column ) {
                var map = column.key.split( "." );
                var i = 0;
                var value = row;
                if ( map.length == 0 )
                    value = "";
                try {
                    while ( i < map.length ) {
                        value = value[ map[ i ] ];
                        i++;
                    }
                } catch ( e ) {
                    value = "";
                }
                return value;
            }

            function findSubkeyValue( row, column ) {
                return $q( function ( res, rej ) {
                    return res( getSubkeyValue( row, column ) );
                } );
            }



            // displayTranslatable
            scope.displayTranslatable = displayTranslatable;

            function displayTranslatable( row, column ) {
                var userLn = getUserLanguage();
                return getUserLanguage && angular.isString( userLn ) && row[ column.key + userLn.toUpperCase() ] ?
                    row[ column.key + userLn.toUpperCase() ] :
                    row[ column.key ];
            }

            // displaySubkey
            scope.displaySubkey = displaySubkey;

            function displaySubkey( row, column ) {
                return findSubkeyValue( row, column )
                    .$$state.value;
            }

            // getColumnType
            scope.getColumnType = getColumnType;

            function getColumnType( column ) {
                return column.type || ( column.key == '_id' ? '_id' : 'string' );
            }

            // getMeasurementsCount
            scope.getMeasurementsCount = getMeasurementsCount;

            function getMeasurementsCount() {
                return new Array( measurementsCount );
            }

            // getFantomMeasurements
            scope.getFantomMeasurements = getFantomMeasurements;

            function getFantomMeasurements( meas ) {
                var total = measurementsCount || 0;
                if ( angular.isArray( meas ) ) {
                    total -= meas.length;
                }
                total = total < 0 ? 0 : total;
                return new Array( total );
            }

            function setMeasurementsCount() {
                if ( !hasMeasurements || !scope.list || !scope.measurementsColumn.key )
                    return;
                measurementsCount = 0;
                var key = scope.measurementsColumn.key;
                scope.list.forEach( function ( elem ) {
                    measurementsCount = angular.isArray( elem[ key ] ) ?
                        ( elem[ key ].length ) > measurementsCount ?
                        ( elem[ key ].length ) : measurementsCount :
                        measurementsCount;
                } );
            }


            /**
             * WATCHERS
             */

            // watch: data
            scope.$watchCollection( "data", function ( nv ) {
                var newValue = angular.isArray( nv ) ? nv : [];
                scope.list = newValue.filter( function ( elem ) {
                    return isObject( elem );
                } );
                setMeasurementsCount();
                scope.resize();
                scope.first = 1;
                scope.last = scope.filtered;
            } );
            scope.$watchCollection( "pColumns", function ( nv ) {
                scope.measurementsColumn = {};
                measurementsCount = 0;
                var newValue = angular.isArray( nv ) ? nv : [];
                scope.columns = newValue.map( function ( elem ) {
                        if ( !elem )
                            return;

                        return isObject( elem ) && elem.key ?
                            elem :
                            angular.isString( elem ) ? {
                                key: elem
                            } :
                            undefined;
                    } )
                    .filter( function ( elem ) {
                        return isObject( elem );
                    } );

                hasMeasurements = scope.columns.some( function ( elem ) {
                    if ( elem.type == "measurements" ) {
                        scope.measurementsColumn = elem;
                        return true;
                    } else {
                        return false;
                    }
                } );

                setMeasurementsCount();
            } );


            /**
             * Event handlers
             */

            /**
             * Scrolling handler ( infinite scroll + header mover )
             *
             */
            scope.scroll = function scroll( event ) {
                var elem = event.target;

                scope.$apply( function () {
                    scope.first = Math.round( elem.scrollTop / scope.lineHeight ) + 1;
                    scope.last = scope.first + Math.round(
                        scope.listHeight / ( scope.lineHeight + 2 )
                    ) - 1;
                } );

                if ( ( elem.scrollTop + elem.offsetHeight + 300 ) > elem.scrollHeight ) {
                    if ( scope.atBottom )
                        scope.atBottom();
                }
            };

            scope.resize = function ( delay ) {
                if ( scope.filtered > 0 ) {
                    $timeout( function () {
                        console.log( "resize" );
                        scope.setListHeight();
                        scope.setColumnsWidth();
                    }, delay || 10 );
                }
            };

            /**
             * Set list height
             */
            scope.setListHeight = function setListHeight() {
                //console.log('setListHeight');
                /**
                 * fix a new max-height
                 */
                var globalHeight = $window.innerHeight;
                var scrollBody = document.querySelectorAll( '.dataTables_scrollBody' );

                for ( indexList = 0; indexList < scrollBody.length; indexList++ ) {
                    var tableElem = angular.element( scrollBody[ indexList ] );
                    var offsetTop = tableElem.prop( 'offsetTop' );
                    var margin = 350;
                    scope.listHeight = globalHeight - ( margin + offsetTop );
                    //console.log("listHeight", scope.listHeight);
                    //console.log("maxHeight", scope.maxHeight);

                    if ( !scope.listHeight || ( angular.isNumber( scope.maxHeight ) && scope.maxHeight < scope.listHeight ) ) {
                        scope.listHeight = scope.maxHeight;
                    }
                    //console.log("tableElem", tableElem);

                    scope.lineHeight = tableElem[ 0 ].scrollHeight / scope.data.length;
                    //console.log("lineHeight", scope.lineHeight);
                }
            };

            scope.setColumnsWidth = function setColumnsWidth() {
                //console.log('setColumnsWidth');
                var scrollHead = document.querySelectorAll( '.dataTables_scrollHead' );
                var scrollBody = document.querySelectorAll( '.dataTables_scrollBody' );

                for ( indexList = 0; indexList < scrollHead.length; indexList++ ) {
                    var headThs = scrollHead[ indexList ].querySelectorAll( '.dataTables_scrollHeadInner table thead tr th' );
                    var bodyTds = scrollBody[ indexList ].querySelectorAll( 'tr:first-child td' );

                    try {
                        for ( var i = 0; i < headThs.length; i++ ) {
                            var thPadding = ( parseFloat( window.getComputedStyle( headThs[ i ] )
                                .paddingRight ) + parseFloat( window.getComputedStyle( headThs[ i ] )
                                .paddingLeft ) );

                            var tdWidth = parseFloat( window.getComputedStyle( bodyTds[ i ] )
                                .width );
                            var tdPadding = ( parseFloat( window.getComputedStyle( bodyTds[ i ] )
                                .paddingRight ) + parseFloat( window.getComputedStyle( bodyTds[ i ] )
                                .paddingLeft ) );

                            var newThWidth = tdWidth + ( tdPadding - thPadding );

                            headThs[ i ].style.minWidth = newThWidth + "px";
                            headThs[ i ].style.maxWidth = newThWidth + "px";
                            headThs[ i ].style.width = newThWidth + "px";
                        }

                        for ( i = 0; i < headThs.length; i++ ) {
                            var thWidth = parseFloat( window.getComputedStyle( headThs[ i ] )
                                .width );
                            var thPadding = ( parseFloat( window.getComputedStyle( headThs[ i ] )
                                .paddingRight ) + parseFloat( window.getComputedStyle( headThs[ i ] )
                                .paddingLeft ) );

                            var tdWidth = parseFloat( window.getComputedStyle( bodyTds[ i ] )
                                .width );
                            var tdPadding = ( parseFloat( window.getComputedStyle( bodyTds[ i ] )
                                .paddingRight ) + parseFloat( window.getComputedStyle( bodyTds[ i ] )
                                .paddingLeft ) );

                            var x = tdWidth - ( thPadding - tdPadding );
                            x = Math.round( x * 10 ) / 10;

                            if ( thWidth != x ) {
                                var newTdWidth = thWidth + ( thPadding - tdPadding );

                                bodyTds[ i ].style.minWidth = newTdWidth + "px";
                                bodyTds[ i ].style.maxWidth = newTdWidth + "px";
                                bodyTds[ i ].style.width = newTdWidth + "px";
                            }
                        }
                    } catch ( e ) {
                        console.error( "[listView] setColumnsWidth:", e );
                    }
                }
            };

            scope.$watch( 'item', function ( item ) {
                if ( !item ) scope._id = undefined;
                else scope._id = item._id;
                scope.resize();
            } );

            angular.element( $window )
                .bind( 'resize', function () {
                    scope.resize();
                } );

            listViewService.register( {
                event: 'resize',
                callback: scope.resize
            } );
        }
    };
} );
