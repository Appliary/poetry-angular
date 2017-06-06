app.controller( 'dashboard/dashboard', function (
    $scope,
    ngDialog,
    $http
) {

    /******** WIDGETS ********/
    $scope.Widgets = {

        /**
         * Create a new widget
         */
        create: function createWidget() {

            // Open widget creation modal
            ngDialog.openConfirm( {
                    templateUrl: 'dashboard/createWidget.pug'
                } )
                .then( function ( widget ) {
                    var w = {
                        edit: true,
                        type: widget.type,
                        title: widget.title
                    };
                    $scope.Dashboards.current.widgets.push( w );
                    $scope.Dashboards.save();
                    $scope.Widgets.edit( w );
                } );

        },

        /**
         * Edit widget params
         * @param {Object} id Widget to be edited
         */
        edit: function editWidget( widget ) {

            // Get the array index of the widget
            var id = $scope.Dashboards.current.widgets.indexOf( widget );
            if ( !~id ) return console.error( 'widget not found' );

            var scope = $scope.$new();
            scope.widget = $scope.Dashboards.current.widgets[ id ];

            // Show edition modal
            ngDialog.openConfirm( {
                    templateUrl: 'dashboard/widgets/' + widget.type + '/edit.pug',
                    scope: scope
                } )
                .then( function ( widget ) {

                    // Update widget
                    $scope.Dashboards.current.widgets[ id ] = widget;

                    // Save Dashboard
                    $scope.Dashboards.save();

                } );

        },

        /**
         * Resize widgets
         */
        resize: function resizeWidgets() {

            // Emit an event to googleCharts to be redrawn
            $scope.$root.$emit( 'resizeMsg', 'resizeMsg' );

        },

        /**
         * Remove widget from current dashboard
         * @param {Object} widget Widget to be removed
         */
        remove: function removeWidget( widget ) {

            // Ask confirmation
            ngDialog.openConfirm( {
                    templateUrl: 'modals/confirmation.pug'
                } )
                .then( function confirmed() {

                    // Find the index
                    var i = $scope.Dashboards.current.widgets.indexOf( widget );
                    if ( !~i ) return console.error( 'Widget not found' );

                    // Remove
                    $scope.Dashboards.current.widgets.splice( i, 1 );

                    // Save to DB
                    $scope.Dashboards.save();

                } );

        }

    };


    /******** DASHBOARDS ********/
    $scope.Dashboards = {

        /**
         * Get or set the draggable option
         * @param {Boolean} val Value to set
         */
        draggable: function draggableDashboard( val ) {

            // Set the value if defined
            if ( val !== undefined )
                $scope.gridsterOpts.draggable.enabled = !!val;

            // Get the value
            return !!$scope.gridsterOpts.draggable.enabled;

        },

        /**
         * Is the dashboard the currently shown ?
         * @param {Object} id Dashboard or id to check
         * @return {Boolean} True if current dashboard, otherwise false
         */
        isCurrent: function isCurrentDashboard( dashboard ) {

            // Check if the IDs are the same
            dashboard = getId( dashboard );
            return ( dashboard == $scope.Dashboards.current._id );

        },
        current: {}, // Current dashboard to be shown

        /**
         * Load dashboards from API
         */
        load: function loadDashboards() {

            // Ask API to get all dashboards of the user
            return $http.get( '/api/myDashboards' )
                .then( function success( res ) {

                    // Catch HTTP errors
                    if ( res.status !== 200 ) throw res;

                    // Format the widgets
                    res.data = res.data.map( dashboard => {
                        dashboard.widgets = dashboard.widgets.map( widget => {
                            widget.edit = true;
                            return widget;
                        } );
                        return dashboard;
                    } );

                    // Load dashboards in scope
                    $scope.Dashboards.list = res.data;

                    // Select first dashboard if exists
                    if ( $scope.Dashboards.list.length )
                        $scope.Dashboards.select( $scope.Dashboards.list[ 0 ] );

                } );

        },
        list: [], // List of all user's dashboards

        /**
         * Show selected dashboard
         * @param {Object} id Dashboard or id to be shown
         */
        select: function selectDashboard( id ) {

            // Empty
            if ( !id ) return ( $scope.Dashboards.current = {} );

            id = getId( id );

            // Iterate through dashboards
            var goodOne;
            $scope.Dashboards.list.some( function getDashboard( dashboard ) {

                // If the dashboard id does not match, continues iteration
                if ( dashboard._id != id ) return false;

                // If match, copy dashboard as "current"
                $scope.Dashboards.current = dashboard;

                // And stop iterating more
                return true;

            } );

        },

        /**
         * New empty dashbard
         * @param {Object} dashboard Dashboard to be shown
         */
        create: function createDashboard() {

            // Show modal form
            ngDialog.openConfirm( {
                    templateUrl: 'dashboard/editDashboard.pug'
                } )
                .then( function applyEdit( nameValue ) {

                    var id = Date.now()
                        .toString( 36 );

                    // Create new Dashboard in the list
                    $scope.Dashboards.list.push( {
                        _id: id,
                        name: nameValue,
                        widgets: []
                    } );

                    // Select it
                    $scope.Dashboards.select( id );

                    // Save to API
                    $scope.Dashboards.save();
                    $scope.Dashboards.load();

                } );

        },

        /**
         * Edit current dashboard
         */
        edit: function editDashboard() {

            var scope = $scope.$new();
            scope.nameValue = $scope.Dashboards.current.name;

            // Show modal form
            ngDialog.openConfirm( {
                    templateUrl: 'dashboard/editDashboard.pug',
                    scope: scope
                } )
                .then( function applyEdit( nameValue ) {

                    // Copy new name and save
                    $scope.Dashboards.current.name = nameValue;
                    $scope.Dashboards.save();

                } );
        },

        /**
         * Remove current dashboard
         */
        remove: function removeDashboard() {

            // Ask confirmation
            ngDialog.openConfirm( {
                    templateUrl: 'modals/confirmation.pug'
                } )
                .then( function confirmed() {

                    // Call the API to delete this lil' boy
                    return $http.delete(
                            '/api/myDashboards/' + $scope.Dashboards.current._id
                        )
                        .then( function success( res ) {

                            // Find index for local deletion
                            var i = $scope.Dashboards.list.indexOf( $scope.Dashboards.current );

                            // Catch inexistant dashboard
                            if ( !~i ) return;

                            // Remove
                            $scope.Dashboards.list.splice( i, 1 );

                            // Select nextOne
                            if ( $scope.Dashboards.list[ i ] )
                                return $scope.Dashboards.select(
                                    $scope.Dashboards.list[ i ]
                                );

                            // Or the firstOne
                            if ( $scope.Dashboards.list[ 0 ] )
                                return $scope.Dashboards.select(
                                    $scope.Dashboards.list[ 0 ]
                                );

                            // Or emptify
                            return $scope.Dashboards.select();

                        } );

                } );

        },

        /**
         * Clear current dashboard
         */
        clear: function clearDashboard() {

            // Clear array, that's it babe !
            $scope.Dashboards.current.widgets = [];

        },

        /**
         * Save current dashboard
         */
        save: function saveDashboard() {

            // Be sure there is a current Dashboard
            if ( !$scope.Dashboards.current._id )
                return;

            // Use the API to save current dashboard
            return $http.post( '/api/myDashboards', $scope.Dashboards.current )
                .then( function success( res ) {

                    // Catch HTTP errors
                    if ( res.status !== 200 ) throw res;

                    console.info( 'Dashboard saved' );

                } );

        }

    };

    /**
     * Get the ID of the Dashboard, from the id itself, or the object
     * @param {StringOrObject} item  Source to find the ID. Can be the id itself
     * @return id
     */
    function getId( item ) {

        if ( typeof item == 'object' ) {
            if ( item._id )
                item = item._id;
            else if ( item.id )
                item = item.id;
        }

        return item;

    }


    // Load dashboard @ startup
    $scope.Dashboards.load();

    // Catch collapse event to resize widgets then
    $scope.$root.$watch( 'collapse', $scope.Widgets.resize );


    // Set default gridster options
    $scope.gridsterOpts = {
        columns: 6, // the width of the grid, in columns
        pushing: true, // push other out of the way on move or resize
        floating: true, // automatically float items up so they stack
        swapping: true, // items of the same size switch places
        width: 'auto', // Pixels or 'auto'
        colWidth: 'auto', // Pixels or 'auto'
        rowHeight: 250, // Pixels or 'match' to be squares
        margins: [ 60, 20 ], // the pixel distance between each widget
        outerMargin: true, // whether margins apply to outer edges of the grid
        isMobile: false, // stacks the grid items if true
        mobileBreakPoint: 600, // Less than that, widgets will stacks
        mobileModeEnabled: true, // use breakpoint
        minColumns: 1, // the minimum columns the grid must have
        minRows: 2, // the minimum height of the grid, in rows
        maxRows: 100,
        defaultSizeX: 2, // the default width of widget
        defaultSizeY: 1, // the default height of widget
        minSizeX: 1, // minimum column width of an item
        maxSizeX: null, // maximum column width of an item
        minSizeY: 1, // minumum row height of an item
        maxSizeY: null, // maximum row height of an item
        resizable: {
            enabled: true,
            handles: [ 'e', 's', 'w', 'ne', 'se', 'sw', 'nw' ],
            start: function ( event, $element, widget ) {},
            resize: function ( event, $element, widget ) {},
            stop: function ( event, $element, widget ) {
                $scope.Dashboards.save();
            }
        },
        draggable: {
            enabled: false, // whether dragging items is supported
            handle: '.widget', // optional selector for drag handle
            start: function ( event, $element, widget ) {},
            drag: function ( event, $element, widget ) {},
            stop: function ( event, $element, widget ) {
                $scope.Dashboards.save();
            }
        }
    };

} );
