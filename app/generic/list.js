app.controller('generic/list', function ($scope, $http, $location, ngDialog, $q, $timeout, $window) {
    if ($scope.__id) retrieveItem($scope.__id);

    var lastCall = {};

    $scope.sorting = {
        col: '_id',
        order: 'asc'
    };

    $scope.orderBy = function orderBy(col) {
        if ($scope.sorting.col != col)
            return ($scope.sorting = {
                col: col,
                order: 'asc'
            });
        $scope.sorting.order = ($scope.sorting.order == 'asc') ? 'desc' : 'asc';
    };

    /**
     * Retrieve the list from the webservice
     */
    getlist(true);
    $scope.$watch('search', getlist);
    $scope.$watch('status', getlist);
    $scope.$watchCollection('sorting', getlist);

    var cvr;

    function cleanVisualReturn(n) {
        if (!n) return;
        if (cvr) clearTimeout(cvr);
        cvr = setTimeout(function () {
            $scope.item.__saved = false;
            $scope.item.__failed = false;
        }, 3000);
    }
    $scope.$watch('item.__saved', cleanVisualReturn);
    $scope.$watch('item.__failed', cleanVisualReturn);

    $scope.$watch('__view', function loadView() {
        $scope.fields = $scope.$root.__module.config.tabs[$scope.__view || ''].fields || [];
        $scope.buttons = $scope.$root.__module.config.tabs[$scope.__view || ''].buttons || [];
    });

    var isLoading = false;
    $scope.reqID = 0;
    $scope.data = [];
    $scope.tags = [];
    $scope.page = 0;

    function getlist(n, o) {
        // Delegate to custom controller
        if ($scope.$root.__module.controller != 'generic/list') return;

        $scope.page = 0;
        if (o == n) return;
        if (n !== true) {
            $scope.total = undefined;
            $scope.data = [];
        }
        if ($scope.data && $scope.total <= $scope.data.length) return;
        isLoading = true;
        var url = $scope.$root.__module.api + '?sort=' + ($scope.sorting ? $scope.sorting.col : '_id') + '&order=' + ($scope.sorting ? $scope.sorting.order : 'asc');
        if ($scope.status) url += '&status=' + $scope.status;
        if ($scope.search)
            url += '&search=' + encodeURIComponent($scope.search);
        if ($scope.data && $scope.data.length) {
            $scope.page = $scope.data.length / 100;
            url += '&limit=100&page=' + Math.floor($scope.page);
        }
        if (lastCall.timestamp + 5000 < Date.now() || lastCall.url != url) {
            lastCall = {
                url: url,
                timestamp: Date.now()
            };
            var reqID = parseInt(++$scope.reqID);
            $http.get(url)
                .then(function success(response) {

                    if (!isNaN(reqID) && $scope.reqID != reqID)
                        return console.warn('Response dropped', $scope.reqID, reqID);

                    isLoading = false;

                    if (response.data.data) {
                        if ($scope.page)
                            response.data.data.forEach(function loop(i) {
                                if ($scope.data && !~$scope.data.indexOf(i))
                                    $scope.data.push(i);
                            });
                        else
                            $scope.data = response.data.data;
                    } else if (response.data instanceof Array)
                        response.data.forEach(function loop(i) {
                            if ($scope.data && !~$scope.data.indexOf(i))
                                $scope.data.push(i);
                        });

                    $scope.filtered = response.data.recordsFiltered;
                    $scope.total = response.data.recordsTotal;

                    if ($scope.$root.__module.config && $scope.$root.__module.config.columns)
                        $scope.columns = $scope.$root.__module.config.columns;
                    else $scope.columns = [];

                    if (!$scope.columns.length)
                        $scope.data.forEach(function (data) {
                            Object.keys(data)
                                .forEach(function (col) {
                                    if (!~$scope.columns.indexOf(col))
                                        $scope.columns.push(col);
                                });
                        });


                    $scope.scrollBody = document.querySelector('.dataTables_scrollBody');

                    /**
                     * Window resize handler
                     */
                    angular.element($window).on('resize', function () {
                        $scope.setListHeight();
                        $scope.setColumnsWidth();
                    });

                    $timeout(function () {
                        $scope.setListHeight();
                        $scope.setColumnsWidth();
                    });

                }, function error(response) {
                    isLoading = false;

                    if (response.status == 401)
                        return ngDialog.open({
                            templateUrl: 'modals/login.pug',
                            controller: 'modals/login',
                            showClose: false,
                            className: 'login'
                        });

                    $location.path('/error/' + response.status);

                });
        }
    }


    /**
     * Select an item on the list
     *
     * @arg {String} id Id of the item to be selected
     */
    $scope.select = function select(id) {
        retrieveItem(id);
        $location.path(
            '/' + $scope.$root.__module.name +
            '/' + id +
            '/' + ($scope.__view || '')
        );
    };

    /**
     * Select another tabview
     *
     * @arg {String} name Name of the tabview to be active
     */
    $scope.tab = function tab(name) {
        $location.path(
            '/' + $scope.$root.__module.name +
            '/' + $scope.__id +
            '/' + name
        );
    };

    $scope.first = 1;
    $scope.last = $scope.filtered;

    /**
     * Scrolling handler ( infinite scroll + header mover )
     *
     * @arg {Event} event Native JS scroll event
     */
    $scope.scroll = function scroll(event) {
        $scope.$apply(function () {
            $scope.first = Math.round($scope.scrollBody.scrollTop / $scope.lineHeight) + 1;
            $scope.last = $scope.first + $scope.nbLines - 1;
        })

        if (($scope.scrollBody.scrollTop + $scope.scrollBody.offsetHeight + 300) > $scope.scrollBody.scrollHeight)
            getlist(true);
    };

    // Give access to the isArray function on the view
    $scope.isArray = angular.isArray;

    /**
     * Save the current item
     *
     * @return $scope.item.__saved
     * @throws $scope.item.__failed
     */
    $scope.save = function save() {

        if (!$scope.item || !$scope.__id)
            return console.warn('No item to save');

        $scope.item.__failed = $scope.item.__success = false;

        //If there are date fields and the date is not valid, delete them
        if (angular.isArray($scope.item.__dateFields)) {
            $scope.item.__dateFields.forEach(function (field) {
                if (!$scope.item[field] || ($scope.item[field] && isNaN($scope.item[field].getTime()))) {
                    if (!($scope.item[field] === null))
                        $scope.item[field];
                }
            });
        }

        $http.put($scope.$root.__module.api + '/' + $scope.__id, $scope.item)
            .then(function success(res) {
                $scope.__validation = [];

                // Update list
                if (res.data && res.data._id) {
                    $scope.item = angular.copy(res.data);
                    $scope.item.__saved = true;
                    $scope.data.some(function (v, i) {

                        // Not this one, continue the search
                        if (v._id !== res.data._id)
                            return false;

                        // Same ID, replace it and stop search
                        $scope.data[i] = angular.copy(res.data);
                        return true;

                    });
                }


            }, function error(err) {
                console.error(err);
                $scope.item.__failed = true;
                $scope.item.__saved = false;

                if (err.status == 400 && err.data && err.data.validation)
                    $scope.__validation = err.data.validation.keys;
            });

    };

    $scope.loadTags = function (query) {
        var deferred = $q.defer();

        $http.get($scope.$root.__module.api + '/tags/' + query)
            .then(function success(response) {
                deferred.resolve(response.data);
            }, function error(response) { });

        return deferred.promise;
    };

    function retrieveTags() {
        if ($scope.$root.__module.api == "/api/devices" || $scope.$root.__module.api == "/api/smartdevices") {
            $http.get($scope.$root.__module.api + '/tags')
                .then(function success(response) {
                    $scope.tags = response.data;
                }, function error(response) {
                    $location.path('/error/' + response.status);
                });
        }
    }

    /**
     * Use the webservice to retrieve the complete selected item
     *
     * @arg {String} id Id of the selected item to be retrieved
     */
    function retrieveItem(id) {
        if (!id) return console.warn('No ID');
        $scope.__validation = [];

        // Load controller
        if ($scope.$root.__module.config && $scope.$root.__module.config.tabs && $scope.$root.__module.config.tabs[$scope.__view || ""].controller)
            return ($scope.ctrl = $controller($root.__module.config.tabs[$scope.__view || ""].controller, {
                $scope: $scope
            }));

        // Clean item
        $scope.item = undefined;

        // Get item from API
        $http.get($scope.$root.__module.api + '/' + id)
            .then(function success(response) {
                $scope.item = response.data;
            }, function error(response) {
                $location.path('/error/' + response.status);
            });
    }

    $scope.isTOut = function isTOut(row) {

        var to = 'timeout';
        if ($scope.$root.__module.config) {
            if ($scope.$root.__module.config.timeout)
                to = $scope.$root.__module.config.timeout;
            if ($scope.$root.__module.config.timeout)
                ts = $scope.$root.__module.config.timestamp;
        }

        // If missing, return false
        if ((!row[to] && to != '$now') || !row[ts])
            return false;

        // Get the timestamp and format it
        var timestamp = angular.copy(row[ts]);
        if (typeof row[ts] == 'string')
            timestamp = new Date(timestamp);
        if (timestamp.getTime)
            timestamp = timestamp.getTime();

        // Condition
        var res;
        if (to == '$now')
            res = timestamp < Date.now();
        else
            res = (timestamp + (row[to] * 60000)) < Date.now();
        console.log(row[to], timestamp, res);
        return res;

    };

    /**
     * Set columns width
     */
    $scope.setColumnsWidth = function setColumnsWidth() {
        $scope.$apply(function () {
            var scrollHead = document.querySelector('.dataTables_scrollHead');

            var headThs = scrollHead.querySelectorAll('thead th');
            var bodyTds = $scope.scrollBody.querySelectorAll('tr:first-child td');

            for (var i = 0; i < headThs.length; i++) {
                var tdWidth = parseFloat(window.getComputedStyle(bodyTds[i]).width);
                var tdPadding = (parseFloat(window.getComputedStyle(bodyTds[i]).paddingRight) + parseFloat(window.getComputedStyle(bodyTds[i]).paddingLeft));

                var thPadding = (parseFloat(window.getComputedStyle(headThs[i]).paddingRight) + parseFloat(window.getComputedStyle(headThs[i]).paddingLeft));
                var thWidth = tdWidth + (tdPadding - thPadding);

                headThs[i].style.minWidth = thWidth + "px";
                headThs[i].style.maxWidth = thWidth + "px";
                headThs[i].style.width = thWidth + "px";

                /*if (i == 0) $scope.firstThWidth = thWidth + 'px';
                else if (i == headThs.length - 1) $scope.lastThWidth = thWidth + 'px';
                else $scope.thsWidth.push(thWidth + 'px');*/
            }
        })
    }

    /**
    * Set list height
    */
    $scope.setListHeight = function setListHeight() {
        $scope.$apply(function () {
            $scope.lineHeight = $scope.scrollBody.scrollHeight / (100 * ($scope.page + 1));
            $scope.nbLines = Math.floor((1 / 2) * window.innerHeight / $scope.lineHeight);

            if ($scope.filtered > $scope.nbLines)
                $scope.listHeight = $scope.lineHeight * $scope.nbLines + 'px';
            else
                $scope.listHeight = 'initial';
        })
    }
});