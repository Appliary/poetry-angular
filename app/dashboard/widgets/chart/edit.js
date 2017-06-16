app.controller( 'dashboard/widgets/chart/edit', function ChartWidget(
    $scope,
    $http,
    $timeout,
    ngDialog
) {

    if ( !$scope.widget.options ) $scope.widget.options = {};

    var charteditor = new google.visualization.ChartEditor();
    var chartWrapper = new google.visualization.ChartWrapper( {
        options: $scope.widget.options.chartOptions,
        chartType: $scope.widget.options.chartType
    } );

    $scope.chartEditor = function chartEditor() {

        if ( !$scope.widget.options.inputs || !$scope.widget.options.inputs.length ) return;

        chartWrapper.setDataTable( $scope.widget.chartObject.data );
        charteditor.openDialog( chartWrapper );

    };
    google.visualization.events.addListener(
        charteditor,
        'ok',
        function saveChartEdit() {
            var cw = charteditor.getChartWrapper();
            $scope.widget.options.chartType = cw.getChartType();
            $scope.widget.options.chartOptions = cw.getOptions();
            delete $scope.widget.options.chartOptions.height;
            delete $scope.widget.options.chartOptions.width;
        }
    );

    $scope.newInput = {};
    $scope.filters = [];
    $scope.selectInputId = function selectInputId() {
        if ( !$scope.newInput.source ) return;
        $scope.search = '';
        switch ( $scope.newInput.source ) {
            case 'measurement':
                $scope.filters = [
                    "devices",
                    "smartdevices",
                    "tags"
                ];
                break;
            case 'system':
                $scope.filters = [
                    "agents",
                    "dataloggers"
                ];
                break;
        }
        $scope.onSelected = function ( input ) {
            console.log( "Device selected", input );
            $scope.newInput.id = input._id;
            $scope.newInput.types = input.types;
            $scope.newInput.kind = input.kind;
        };
    };

    $scope.addInput = function addInput() {
        if ( !$scope.newInput.type )
            return console.warn( 'No type' );
        if ( !$scope.widget.options.inputs )
            $scope.widget.options.inputs = [];
        $scope.widget.options.inputs.push( {
            varName: $scope.newInput.varName,
            kind: $scope.newInput.kind,
            id: $scope.newInput.id,
            type: JSON.parse( $scope.newInput.type )[ 0 ],
            indice: JSON.parse( $scope.newInput.type )[ 1 ]
        } );
        $scope.newInput = {};
    };

} );
