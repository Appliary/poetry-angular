app.directive("listView", function ($timeout,$interval, $window, $q, listViewService) {
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
        link: function (scope, elem, attrs, ctrls) {

            /**
             * VARS
             */
            var hasMeasurements = false;
            var measurementsCount = 0;

            //scope._id;

            scope.config = isObject(scope.config) ? scope.config : {};

            scope.sorting = {};

            if (isObject(scope.config.defaultSort)) {
                if (scope.config.defaultSort.key) {
                    scope.sorting.key = scope.config.defaultSort.key;
                } else if (scope.config.defaultSort.col) {
                    scope.sorting.key = scope.config.defaultSort.col;
                }
                scope.sorting.order = scope.config.defaultSort.order == "asc" ? "asc" : "desc";
            }


            scope.measurementsColumn = {};

            /**
             * FUNCTIONS
             */
            print("loading");

            function print(message) {
                if (!scope.config.debug)
                    return;
                console.log("%c [listView] " + JSON.stringify(message), "background-color: black; color: #2BFF00");
            }

            function getUserLanguage() {
                return (scope.$root.user) ? scope.$root.user.language : "";
            }

            scope.ng = angular;

            scope.select = select;

            function select(_id) {
                if (scope.config.noDetails || scope._id == _id) {
                    return;
                }
                if (isFunction(scope.selectedFn)) {
                    scope.selectedFn(_id);
                }
                print("selectedFn(" + _id + ")");
            }

            scope.sort = sort;

            function sort(column) {
                if (column.key == scope.sorting.key) {
                    scope.sorting.order = scope.sorting.order == 'asc' ? 'desc' : 'asc';
                } else {
                    scope.sorting.key = column.key;
                    scope.sorting.order = 'asc';
                }
                if (isFunction(scope.sortFn)) {
                    $timeout(
                        function () {
                            scope.sortFn(scope.sorting.key, scope.sorting.order);
                        },
                        100
                    );
                }
                print("sortFn(" + scope.sorting.key + ", " + scope.sorting.order + ") =>");
            }

            // hasValue
            scope.hasValue = hasValue;

            function hasValue(v) {
                return v !== null && !angular.isUndefined(v);
            }

            // isDefined
            scope.isDefined = isDefined;

            function isDefined(v) {
                return v !== null && !angular.isUndefined(v) && (v || v === 0);
            }

            // isUndefined
            scope.isUndefined = isUndefined;

            function isUndefined(v) {
                return v === null || angular.isUndefined(v);
            }

            // isArray
            scope.isArray = isArray;

            function isArray(v) {
                return angular.isArray(v);
            }

            // isObject
            scope.isObject = isObject;

            function isObject(v) {
                return v && angular.isObject(v);
            }

            // isFunction
            scope.isFunction = isFunction;

            function isFunction(v) {
                return typeof v === 'function';
            }

            // isNumber
            scope.isNumber = isNumber;

            function isNumber(v) {
                return !isNaN(v);
            }

            // isTimedOut
            scope.isTimedOut = isTimedOut;

            function isTimedOut(row) {
                return scope.config.timeout && row.hasOwnProperty('timeout') && row.timeout;
            }

            // isContext
            scope.isContext = isContext;

            function isContext(coord) {
                return isObject(coord) && coord.hasOwnProperty('id') && coord.hasOwnProperty('kind');
            }

            // isDataType
            scope.isDataType = isDataType;

            function isDataType(column) {
                return column.type == 'data' || (column.type == 'subkey' && column.subtype == 'data');
            }

            scope.doAction = function(action, row){
              if(isFunction(action.callback)){
                action.callback(row);
              }
              else{
                console.debug("action clicked", action);
              }
            }

            // sameDataTypeValue
            scope.sameDataTypeValue = sameDataTypeValue;

            function sameDataTypeValue(row, col1, col2) {
                if (!(isDataType(col1) && isDataType(col2))) {
                    return false;
                }
                return getSubkeyValue(row, col1) == getSubkeyValue(row, col2);
            }

            function getSubkeyValue(row, column) {
                var map = column.key.split(".");
                var i = 0;
                var value = row;
                if (map.length == 0)
                    value = "";
                try {
                    while (i < map.length) {
                        value = value[map[i]];
                        i++;
                    }
                } catch (e) {
                    value = "";
                }
                return value;
            }

            function findSubkeyValue(row, column) {
                return $q(function (res, rej) {
                    return res(getSubkeyValue(row, column));
                });
            }



            // displayTranslatable
            scope.displayTranslatable = displayTranslatable;

            function displayTranslatable(row, column) {
                var userLn = getUserLanguage();
                return getUserLanguage && angular.isString(userLn) && row[column.key + userLn.toUpperCase()] ?
                    row[column.key + userLn.toUpperCase()] :
                    row[column.key];
            }

            // displaySubkey
            scope.displaySubkey = displaySubkey;

            function displaySubkey(row, column) {
                return findSubkeyValue(row, column)
                    .$$state.value;
            }

            // getColumnType
            scope.getColumnType = getColumnType;

            function getColumnType(column) {
                return column.type || (column.key == '_id' ? '_id' : 'string');
            }

            // getMeasurementsCount
            scope.getMeasurementsCount = getMeasurementsCount;

            function getMeasurementsCount() {
                return new Array(measurementsCount);
            }

            // getFantomMeasurements
            scope.getFantomMeasurements = getFantomMeasurements;

            function getFantomMeasurements(meas) {
                var total = measurementsCount || 0;
                if (angular.isArray(meas)) {
                    total -= meas.length;
                }
                total = total < 0 ? 0 : total;
                return new Array(total);
            }

            function setMeasurementsCount() {
                if (!hasMeasurements || !scope.list || !scope.measurementsColumn.key)
                    return;
                measurementsCount = 0;
                var key = scope.measurementsColumn.key;
                scope.list.forEach(function (elem) {
                    measurementsCount = angular.isArray(elem[key]) ?
                        (elem[key].length) > measurementsCount ?
                            (elem[key].length) : measurementsCount :
                        measurementsCount;
                });
            }


            /**
             * WATCHERS
             */

            // watch: data
            scope.$watchCollection("data", function (nv) {
                var newValue = angular.isArray(nv) ? nv : [];
                scope.list = newValue.filter(function (elem) {
                    return isObject(elem);
                });
                setMeasurementsCount();
                scope.resize();
                scope.resize();
                scope.first = 1;
                scope.last = scope.filtered;
                listViewService.emit('tableHeadFixer:run');
            });
            scope.$watchCollection("pColumns", function (nv) {
                scope.measurementsColumn = {};
                measurementsCount = 0;
                var newValue = angular.isArray(nv) ? nv : [];
                scope.columns = newValue.map(function (elem) {
                    if (!elem)
                        return;

                    return isObject(elem) && elem.key ?
                        elem :
                        angular.isString(elem) ? {
                            key: elem
                        } :
                            undefined;
                })
                    .filter(function (elem) {
                        return isObject(elem);
                    });

                hasMeasurements = scope.columns.some(function (elem) {
                    if (elem.type == "measurements") {
                        scope.measurementsColumn = elem;
                        return true;
                    } else {
                        return false;
                    }
                });

                setMeasurementsCount();
                scope.resize();
                listViewService.emit('tableHeadFixer:run');
            });


            /**
             * Event handlers
             */

            /**
             * Scrolling handler ( infinite scroll + header mover )
             *
             */
            scope.scroll = function scroll(event) {
                var elem = event.target;

                scope.$apply(function () {
                    scope.first = Math.round(elem.scrollTop / scope.lineHeight) + 1;
                    scope.last = scope.first + Math.round(
                        scope.listHeight / (scope.lineHeight + 2)
                    ) - 1;
                });

                if ((elem.scrollTop + elem.offsetHeight + 300) > elem.scrollHeight) {
                    if (scope.atBottom)
                        scope.atBottom();
                }
            };

            var __doResize = function(delay){
              if (scope.filtered > 0) {
                  $timeout(function () {
                      scope.setListHeight();
                      scope.setColumnsWidth();
                  }, delay || 100);
              }
            }
            /**
            * @function resize
            * @description Calls local '__doResize' X times to be sure to get the right size
            * @param {number} delay
            */
            scope.resize = function (delay) {
              console.log("resize");
              __doResize(delay);
              $interval(function(){
                __doResize(delay)
              }, 100, 14);
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
                var scrollBody = document.querySelectorAll('.dataTables_scrollBody');

                for (indexList = 0; indexList < scrollBody.length; indexList++) {
                    var tableElem = angular.element(scrollBody[indexList]);
                    var offsetTop = tableElem.prop('offsetTop');
                    var margin = 350;
                    scope.listHeight = globalHeight - (margin + offsetTop);

                    if (!scope.listHeight || (angular.isNumber(scope.maxHeight) && scope.maxHeight < scope.listHeight)) {
                        scope.listHeight = scope.maxHeight;
                    }

                    scope.lineHeight = tableElem[0].scrollHeight / scope.data.length;
                }
            };

            scope.setColumnsWidth = function setColumnsWidth() {
                //console.log('setColumnsWidth');
                var scrollHead = document.querySelectorAll('.dataTables_scrollHead');
                var scrollBody = document.querySelectorAll('.dataTables_scrollBody');

                for (indexList = 0; indexList < scrollHead.length; indexList++) {
                    var headThs = scrollHead[indexList].querySelectorAll('.dataTables_scrollHeadInner table thead tr th');
                    var bodyTds = scrollBody[indexList].querySelectorAll('tr:first-child td');

                    try {
                        for (var i = 0; i < headThs.length; i++) {
                            var headTh = headThs[i];
                            var bodyTd = bodyTds[i];

                            // remove all the custom style set previously (restart from scratch)
                            $(headTh).css({"minWidth": "", "maxWidth": "", "width": ""});
                            $(bodyTd).css({"minWidth": "", "maxWidth": "", "width": ""});

                                var thWidth = parseFloat(window.getComputedStyle(headTh).width);
                                var thPadding = (parseFloat(window.getComputedStyle(headTh).paddingRight)
                                    + parseFloat(window.getComputedStyle(headTh).paddingLeft));

                                var tdWidth = parseFloat(window.getComputedStyle(bodyTd).width);
                                var tdPadding = (parseFloat(window.getComputedStyle(bodyTd).paddingRight)
                                    + parseFloat(window.getComputedStyle(bodyTd).paddingLeft));

                                if ((thWidth + thPadding) < (tdWidth + tdPadding)) {
                                    var newThWidth = tdWidth + (tdPadding - thPadding);

                                    headTh.style.minWidth = newThWidth + "px";
                                    headTh.style.maxWidth = newThWidth + "px";
                                    headTh.style.width = newThWidth + "px";
                                } else {
                                    var newTdWidth = thWidth + (thPadding - tdPadding);

                                    bodyTd.style.minWidth = newTdWidth + "px";
                                    bodyTd.style.maxWidth = newTdWidth + "px";
                                    bodyTd.style.width = newTdWidth + "px";
                                }
                        }
                    } catch (e) {
                        console.warn("[listView] setColumnsWidth:", e);
                    }
                }
            };

            scope.$watch('item', function (item) {
                if (!item) scope._id = undefined;
                else scope._id = item._id;
                scope.resize();
            });

            angular.element($window)
                .bind('resize', function () {
                    scope.resize();
                });

            listViewService.register({
                event: 'resize',
                callback: scope.resize
            });
        }
    };
});
