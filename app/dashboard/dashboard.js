app.controller('dashboard/dashboard', function($scope, $q, $state, $rootScope, ngDialog, ngNotify, DevicesData, $http) {

    console.log("dashboard controller loaded");
    // Default items to display when the gridster(dashbaord) is loading
    $scope.enableSaveDb = false;
    $scope.currentDashboard = {};
    $scope.maxId = 0;
    $rootScope.$watch('collapse', function() {
        console.log("watch collapse triggerd");
        $scope.resizeWidgets();
    });

    $scope.customData1 = [
        {
            edit: true,
            size: {
                x: 1,
                y: 1
            },
            position: [0, 0],
            title: "pie1",
            type: "pie",
            controller: "pieCtrl"
        },
        {
            edit: true,
            size: {
                x: 2,
                y: 1
            },
            position: [0, 0],
            title: "image 1",
            type: "image",
            controller: "imageCtrl",
            url: "http://iot.intersog.com/wp-content/uploads/iot/2015/12/Internet-of-Things-01.png"
            //url: "http://www.tuxboard.com/photos/2016/10/pigeon-prison-inde-720x405.jpg"
        },
        // {
        //     size: {
        //         x: 1,
        //         y: 1
        //     },
        //     position: [0, 0],
        //     title: "adaptive",
        //     type: "adaptative",
        //     controller: "adaptativeCtrl",
        //     api: "",
        //     dataPoints: []
        // },
        {
            edit: true,
            size: {
                x: 2,
                y: 1
            },
            position: [0, 0],
            title: "gauge",
            type: "gauge",
            controller: "gaugeCtrl"
        },
        {
            edit: true,
            size: {
                x: 2,
                y: 1
            },
            position: [0, 0],
            title: "area",
            type: "area",
            controller: "areaCtrl"
        },
        {
            edit: true,
            size: {
                x: 2,
                y: 1
            },
            isChart : true,
            position: [0, 0],
            title: "bubble",
            type: "bubble",
            controller: "bubbleCtrl"
        },
        {
            edit: true,
            size: {
                x: 2,
                y: 1
            },
            isChart: true,
            position: [0, 0],
            title: "combo",
            type: "combo",
            controller: "comboCtrl"
        }
    ];
    $scope.customData2 = [
        {
            edit: true,
            size: {
                x: 2,
                y: 1
            },
            isChart: true,
            position: [0, 0],
            title: "geo",
            type: "geo",
            controller: "geoCtrl"
        },
        {
            edit: true,
            size: {
                x: 2,
                y: 1
            },
            position: [0, 0],
            title: "line",
            controller: "lineCtrl"
        },
        {
            edit: true,
            size: {
                x: 2,
                y: 1
            },
            position: [0, 0],
            title: "map",
            type: "map",
            controller: "mapCtrl",
            dataPoints: [],
            center: {lat : 0,lon: 0, zoom : 2}
        },
        // Not working
        // {
        //     size: {
        //         x: 2,
        //         y: 1
        //     },
        //     position: [0, 0],
        //     title: "candlestick",
        //     controller: "candlestickCtrl"
        // },
        {
            edit: true,
            size: {
                x: 2,
                y: 1
            },
            position: [0, 0],
            title: "table",
            type: "table",
            controller: "tableCtrl"
        },
        {
            edit: true,
            size: {
                x: 2,
                y: 1
            },
            position: [0, 0],
            title: "column",
            type: "column",
            controller: "columnCtrl"
        },
        {
            edit: true,
            size: {
                x: 2,
                y: 1
            },
            position: [0, 0],
            title: "histogramme",
            type: "histogramme",
            controller: "histogrammeCtrl"
        }
    ];


    // gridster options
    $scope.gridsterOpts = {
        columns: 6, // the width of the grid, in columns
        pushing: true, // whether to push other items out of the way on move or resize
        floating: true, // whether to automatically float items up so they stack (you can temporarily disable if you are adding unsorted items with ng-repeat)
        swapping: true, // whether or not to have items of the same size switch places instead of pushing down if they are the same size
        width: 'auto', // can be an integer or 'auto'. 'auto' scales gridster to be the full width of its containing element
        colWidth: 'auto', // can be an integer or 'auto'.  'auto' uses the pixel width of the element divided by 'columns'
        rowHeight: 250, // can be an integer or 'match'.  Match uses the colWidth, giving you square widgets.
        margins: [60, 20], // the pixel distance between each widget
        outerMargin: true, // whether margins apply to outer edges of the grid
        isMobile: false, // stacks the grid items if true
        mobileBreakPoint: 600, // if the screen is not wider that this, remove the grid layout and stack the items
        mobileModeEnabled: true, // whether or not to toggle mobile mode when screen width is less than mobileBreakPoint
        minColumns: 1, // the minimum columns the grid must have
        minRows: 2, // the minimum height of the grid, in rows
        maxRows: 100,
        defaultSizeX: 2, // the default width of a gridster item, if not specifed
        defaultSizeY: 1, // the default height of a gridster item, if not specified
        minSizeX: 1, // minimum column width of an item
        maxSizeX: null, // maximum column width of an item
        minSizeY: 1, // minumum row height of an item
        maxSizeY: null, // maximum row height of an item
        resizable: {
            enabled: true,
            handles: ['e', 's', 'w', 'ne', 'se', 'sw', 'nw'],
            start: function(event, $element, widget) {}, // optional callback fired when resize is started,
            resize: function(event, $element, widget) {
                if (widget.type === "map") {
                    widget.resize = true;
                }
            }, // optional callback fired when item is resized,
            stop: function(event, $element, widget) {
                    if (widget.type === "map") {
                        widget.resize = true;
                    }
                    $scope.saveDashboard();
                } // optional callback fired when item is finished resizing
        },
        draggable: {
            enabled: false, // whether dragging items is supported
            handle: '.widget', // optional selector for drag handle
            start: function(event, $element, widget) {}, // optional callback fired when drag is started,
            drag: function(event, $element, widget) {}, // optional callback fired when item is moved,
            stop: function(event, $element, widget) {
                    $scope.saveDashboard();
                } // optional callback fired when item is finished dragging
        }
    };

    $scope.customItems1 = {
        name: "Dashboard demo1",
        data: $scope.customData1,
        id: $scope.maxId
    };

    $scope.customItems2 = {
        name: "Dashboard demo2",
        data: $scope.customData2,
        id: ++$scope.maxId
    };

    $scope.dashboards = [];
    $scope.dashboards.push($scope.customItems1);
    $scope.dashboards.push($scope.customItems2);
    $scope.currentDashboard = $scope.customItems1;

    // Delete Widget from current dashboard
    $scope.deleteWidget = function(widget) {
        $scope.currentDashboard.data.splice($scope.currentDashboard.data.indexOf(widget), 1);
        //$scope.saveDashboard();
    };
    // Add widget to the current dashboard
    // @Param type : add the widget with the good controller
    $scope.addWidget = function(data, dashboard) {
        switch (data.newWidget.type) {
            case 'adaptative':
                dashboard.data.push({
                    edit: true,
                    size: {
                        x: 1,
                        y: 1
                    },
                    position: [0, 0],
                    title: data.title,
                    type: "adaptative",
                    controller: "adaptativeCtrl",
                    deviceId: data.newWidget.deviceId,
                    startDate: data.newWidget.startDate,
                    endDate: data.newWidget.endDate

                });
                break;
            case 'PieChart':
                dashboard.data.push({
                    edit: true,
                    size: {
                        x: 1,
                        y: 1
                    },
                    position: [0, 0],
                    title: data.title,
                    type: "pie",
                    controller: "pieCtrl",
                    deviceId: data.newWidget.deviceId,
                    startDate: data.newWidget.startDate,
                    endDate: data.newWidget.endDate
                });
                break;
            case 'gauge':
                console.log("chartObject of gauge", data.newWidget.chartObject);
                dashboard.data.push({
                    edit: true,
                    size: {
                        x: 2,
                        y: 1
                    },
                    position: [0, 0],
                    title: data.title,
                    type: "gauge",
                    controller: "gaugeCtrl",
                    chartObject: data.newWidget.chartObject,
                    deviceId: data.newWidget.deviceId,
                    measurementType: data.newWidget.measurementType,
                    deviceList: data.newWidget.deviceList
                });
                break;
            case 'BarChart':
                dashboard.data.push({
                    edit: true,
                    size: {
                        x: 2,
                        y: 1
                    },
                    position: [0, 0],
                    title: data.title,
                    type: "bar",
                    controller: "barCtrl",
                    deviceId: data.newWidget.deviceId,
                    startDate: data.newWidget.startDate,
                    endDate: data.newWidget.endDate
                });
                break;
            case 'AreaChart':
                $scope.currentDashboard.data.push({
                    edit: true,
                    size: {
                        x: 2,
                        y: 1
                    },
                    position: [0, 0],
                    title: data.title,
                    type: "area",
                    controller: "areaCtrl",
                    deviceId: data.newWidget.deviceId,
                    startDate: data.newWidget.startDate,
                    endDate: data.newWidget.endDate
                });
                break;
            case 'BubbleChart':
                dashboard.data.push({
                    edit: true,
                    size: {
                        x: 2,
                        y: 1
                    },
                    position: [0, 0],
                    title: data.title,
                    type: "bubble",
                    controller: "bubbleCtrl",
                    deviceId: data.newWidget.deviceId,
                    startDate: data.newWidget.startDate,
                    endDate: data.newWidget.endDate
                });
                break;
            case 'ComboChart':
                dashboard.data.push({
                    edit: true,
                    size: {
                        x: 2,
                        y: 1
                    },
                    position: [0, 0],
                    title: "Combo",
                    type: "combo",
                    controller: "comboCtrl",
                    deviceId: data.newWidget.deviceId,
                    startDate: data.newWidget.startDate,
                    endDate: data.newWidget.endDate
                });
                break;
            case 'GeoChart':
                dashboard.data.push({
                    edit: true,
                    size: {
                        x: 2,
                        y: 1
                    },
                    position: [0, 0],
                    title: data.title,
                    type: "geo",
                    controller: "geoCtrl",
                    deviceId: data.newWidget.deviceId,
                    startDate: data.newWidget.startDate,
                    endDate: data.newWidget.endDate
                });
                break;
            case 'line':
                dashboard.data.push({
                    edit: true,
                    sizeX: data.sizeX,
                    sizeY: data.sizeY,
                    position: [0, 0],
                    title: data.title,
                    type: "line",
                    controller: "lineCtrl",
                    chartObject: data.newWidget.chartObject,
                    deviceId: data.newWidget.deviceId,
                    startDate: data.newWidget.startDate,
                    endDate: data.newWidget.endDate,
                    dateOption: data.newWidget.dateOption,
                    customDate: data.newWidget.customDate,
                    measurementType: data.newWidget.measurementType,
                    deviceList: data.newWidget.deviceList
                });
                break;
            case 'candlestick':
                dashboard.data.push({
                    edit: true,
                    size: {
                        x: 2,
                        y: 1
                    },
                    position: [0, 0],
                    title: data.title,
                    type: "candlestick",
                    controller: "candlestickCtrl",
                    deviceId: data.newWidget.deviceId,
                    startDate: data.newWidget.startDate,
                    endDate: data.newWidget.endDate
                });
                break;
            case 'table':
                dashboard.data.push({
                    edit: true,
                    size: {
                        x: 2,
                        y: 1
                    },
                    position: [0, 0],
                    title: data.title,
                    type: "table",
                    controller: "tableCtrl",
                    toDisplay: data.newWidget.toDisplay
                });
                break;
            case 'column':
                dashboard.data.push({
                    edit: true,
                    size: {
                        x: 2,
                        y: 1
                    },
                    position: [0, 0],
                    title: data.title,
                    type: "table",
                    controller: "columnCtrl",
                    columns: data.newWidget.columns,
                    api: data.newWidget.api
                });
                break;
            case 'Histogram':
                dashboard.data.push({
                    edit: true,
                    size: {
                        x: 2,
                        y: 1
                    },
                    position: [0, 0],
                    title: data.title,
                    type: "histogramme",
                    controller: "histogrammeCtrl"
                });
                break;
            case 'map':
                dashboard.data.push({
                    edit: true,
                    size: {
                        x: 2,
                        y: 1
                    },
                    position: [0, 0],
                    title: data.title,
                    type: "map",
                    controller: "mapCtrl",
                    dataPoints: data.newWidget.dataPoints,
                    center: data.newWidget.center
                });
                break;
            case 'image':
                dashboard.data.push({
                    edit: true,
                    size: {
                        x: 2,
                        y: 1
                    },
                    position: [0, 0],
                    title: data.title,
                    type: "image",
                    controller: "imageCtrl",
                    url: data.newWidget.url
                });
                break;
            case 'video':
                dashboard.data.push({
                    edit: true,
                    size: {
                        x: 2,
                        y: 1
                    },
                    position: [0, 0],
                    title: data.title,
                    type: "video",
                    controller: "videoCtrl",
                    url: data.newWidget.url
                });
                break;
            case 'svg':
                dashboard.data.push({
                    edit: true,
                    size: {
                        x: 2,
                        y: 1
                    },
                    position: [0, 0],
                    title: data.title,
                    type: "svg",
                    controller: "svgCtrl",
                    svg: data.newWidget.svg,
                    color: data.newWidget.color
                });
                break;
        }
        $scope.saveDashboard();
    };
    // Clear all widget from dashboard
    $scope.clear = function(dashboard) {
        dashboard.data = [];
    };
    // Emit event 'resizeMsg' known by Google-Chart to resize the widget
    $scope.resizeWidgets = function() {
        $rootScope.$emit('resizeMsg', 'resizeMsg');
    };
    $scope.loadDashboard = function() {
        console.log("todo loaddashboard ?");
        DevicesData.getDashboardFromDb()
        .then(function(dashboardDatas){
            console.log("result from db", dashboardDatas);
            $scope.createDashboards(dashboardDatas);
        });
        // var defer = $q.defer();
        // var dashboards = [];
        // var idDevice = false;
        // if ($state.params.id) {
        //     idDevice = $state.params.id;
        // }
        // DevicesData.getDashboardFromDb(idDevice).then(function(res) {
        //     angular.forEach(res.data, function(dashboard) {
        //         if (!$state.params.id) {
        //             if (dashboard.data.length !== 0) {
        //                 dashboards.push(dashboard);
        //             }
        //         } else {
        //             dashboards = res;
        //         }

        //     })
        //     defer.resolve(dashboards)
        //     setTimeout(function() {
        //         $scope.enableSaveDb = true;
        //     }, 10000);
        // });
        // return defer.promise;
    };
    $scope.saveDashboard = function() {
        console.log("todo savedashboard");
        // if ($scope.enableSaveDb) {
        //     if ($state.params.id) {
        //         $scope.customItems.isDevice = true;
        //         $scope.customItems.id = $state.params.id;
        //     }
        //     var copy = JSON.parse(JSON.stringify($scope.customItems));
        //     angular.forEach(copy.data, function(widget) {
        //         // if (widget.dataPoints)
        //         //     delete widget.dataPoints[0].datas;
        //         if (widget.toDisplay)
        //             angular.forEach(widget.toDisplay, function(device) {
        //                 if (device.daysData)
        //                     delete device.daysData;
        //                 if (device.device)
        //                     delete device.device;
        //             })
        //         if (widget.chartObject)
        //             if (widget.chartObject.data)
        //                 delete widget.chartObject.data
        //     });
        //     DevicesData.saveDashboardToDb(copy)
        //         .then(function(id) {
        //             $scope.customItems.id = id;
        //         });
        //     delete copy;
        // }
    };
    $scope.enableDraggable = function() {
        $scope.gridsterOpts.draggable.enabled = true;
    };
    $scope.disableSave = function() {
        $scope.enableSaveDb = false;
    };
    $scope.enableSave = function() {
        $scope.enableSaveDb = true;
    };
    $scope.clickToOpen = function(dashboard) {
        $scope.createWidget = true;
        ngDialog.openConfirm({
                template: 'dashboard/modalWidget.pug',
                className: 'ngdialog-theme-default',
                scope: $scope,
                width: '800px'
            })
            .then(function(res) {
                console.log("res of click to open in dashboard", res)
                //console.log("dashboard", dashboard);
                $scope.addWidget(res, dashboard);
                // dashboard.data.push(res);
            });
    };
    
    $scope.loadDashboardFromId = function(id) {
        if (id == -1) {
            $scope.dashboards.push({
                id: ++$scope.maxId,
                data: [],
                name: 'New Dashboard',
            });
        } else {
            $scope.currentDashboard = $scope.dashboards[id];
        }
    }

    $scope.showDashboard = function(id){
        var index = -1;
        var i = 0;
        for(i = 0; i < $scope.dashboards.length; i++) {
            if ($scope.dashboards[i].id == id) {
                index = i;
            }
        }
        if(index >= 0){
            $scope.currentDashboard = $scope.dashboards[index];
            //console.log("currentDashboard 2", $scope.currentDashboard);
        }
    }


    $scope.confirmDashboardDelete = function(id) {
        var index = -1;
        var i = 0;
        for(i = 0; i < $scope.dashboards.length; i++) {
            if ($scope.dashboards[i].id == id) {
                index = i;
            }
        }
        if(index >= 0){
            $scope.dashboards.splice(index, 1);
            DevicesData.deleteDashboard(id)
            .then(function(res){
                console.log("deleteDashboard res", res);
            });
        }
        if($scope.dashboards.length){
            // Deleted dashboard is current dashboard
            if($scope.currentDashboard.id == id){
                $scope.currentDashboard = $scope.dashboards[0];
            }
        }
        //Dashboards is now empty
        else{
            $scope.currentDashboard = {};
        }
        
        
    }
    $scope.refreshData = function() {
        angular.forEach($scope.customItems.data, function(widget) {
            widget.forceReload = true;
        });
    }

    $scope.newDashboard = function(){
        $scope.maxId++;
        var newId = (Date.now() + Math.random()).toString(32);
        console.log("newId", newId);
        $scope.dashboards.push({
            name: "- New Dashboard -",
            data: [],
            id: newId
        });
    }

    $scope.rename = function(dashboard){
        ngDialog.openConfirm({
                template: 'dashboard/rename.pug',
                className: 'ngdialog-theme-default',
                scope: $scope,
                width: '400px'
            })
            .then(function(res) {
                dashboard.name = res;
            });
    }

    $scope.newSave = function(dashboard){
        console.log("dashboard to save", dashboard);

        var dashboardData = {
            id: dashboard.id,
            name: dashboard.name,
            widgets: []
        };

        dashboard.data.forEach(function(data){
            console.log("data in newsave", data);
            
            
            var widget = {
                title: data.title,
                controller: data.controller,
                options: data.chartObject.options,
                sizeX: data.sizeX,
                sizeY: data.sizeY,
                measurementType: data.measurementType,
                deviceList: data.deviceList,
                customDate: data.customDate,
                dateOption: data.dateOption,
                url: data.url
            };
            if(data.startDate && data.endDate){
                var startDate = new Date(data.startDate);
                var endDate = new Date(data.endDate);
                widget.startDate = startDate.getTime();
                widget.endDate = endDate.getTime();
            }

            console.log("widget in new save", widget);

            dashboardData.widgets.push(widget);
        });
        

        console.log("dashboardData that will be saved", dashboardData);
        DevicesData.saveDashboardToDb(dashboardData)
        .then(function(result){
            console.log("result from saveDashboard", result);
        }); 
    }

    $scope.createDashboards = function(dashboardDatas){
        dashboardDatas.forEach(function(dashboardData){
            var dashboard = {
                id: dashboardData._id,
                name: dashboardData.name,
                data: []
            };

            dashboardData.widgets.forEach(function(widget){
                // var widgetData = {
                //     title: widget.title,
                //     edit: true,
                //     controller: widget.controller,
                //     sizeX: widget.sizeX,
                //     sizeY: widget.sizeY,
                //     deviceList: widget.deviceList,
                //     options: widget.options
                // };
                widget.edit = true;

                dashboard.data.push(widget);
            });

            $scope.dashboards.push(dashboard);
        });

        console.log("dashboards after createDashboards", $scope.dashboards);

    }


    // --------------- Running at the beginning ----------------

    $scope.loadDashboard();


    // setTimeout(function() {

    //     $scope.customItems = {
    //         name: "Dashboard demo",
    //         data: $scope.customData,
    //         id: 1
    //     };

    //     $scope.newItems = {
    //         name: "New",
    //         data: {},
    //         id: 2
    //     };
    //     console.log("scope customItems", $scope.customItems);
    //     $scope.dashboards = [$scope.customItems, $scope.newItems];
    //     $scope.currentDashboard = $scope.customItems;
    //     console.log("dashboards", $scope.dashboards);
    // }, 200);

});