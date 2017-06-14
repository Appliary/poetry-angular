app.controller( 'dashboard/widgets/chart/edit', function ChartWidget(
    $scope,
    $http,
    ngDialog
) {

    var charteditor = new google.visualization.ChartEditor();
    var chartWrapper = new google.visualization.ChartWrapper( {
        dataTable: $scope.widget.chartObject.data,
        options: $scope.widget.options.chartOptions,
        chartType: $scope.widget.options.chartType
    } );

    $scope.chartEditor = function chartEditor() {
        charteditor.openDialog( chartWrapper );
    };
    google.visualization.events.addListener(
        charteditor,
        'ok',
        function saveChartEdit() {
            var cw = charteditor.getChartWrapper();
            $scope.widget.options.chartOptions = cw.getOptions();
            $scope.widget.options.chartType = cw.getChartType();
        }
    );

    $scope.selectInputId = function selectInputId() {
        if ( $scope.newInput || !$scope.newInput.source ) return;
        $scope.search = '';
        switch ( $scope.newInput.source ) {
            case 'measurement':
                $scope.filters = {
                    devices: false,
                    smartdevices: false,
                    tags: false
                };
                $http.get();
                break;
        }
        ngDialog.openConfirm( {
                templateUrl: 'mathFormula/add/devices.pug',
                scope: $scope
            } )
            .then( function selected( input ) {

            } );
    };

} );
