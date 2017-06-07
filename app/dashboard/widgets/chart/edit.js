app.controller( 'dashboard/widgets/chart/edit', function ChartWidget(
    $scope
) {

    $scope.chartEditor = function chartEditor() {

        var charteditor = new google.visualization.ChartEditor();
        charteditor.draw();

    };

} );
