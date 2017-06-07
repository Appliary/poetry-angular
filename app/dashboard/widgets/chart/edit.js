app.controller( 'dashboard/widgets/chart/edit', function ChartWidget(
    $scope
) {

    $scope.chartEditor = function chartEditor() {

        var w = new google.visualization.ChartWrapper( {
            dataTable: [
                [ 'Device', 'EFS_048479', 'EFS_047970' ],
                [ new Date( '2017-04-01' ), Math.random(), Math.random() ],
                [ new Date( '2017-04-02' ), Math.random(), Math.random() ],
                [ new Date( '2017-04-03' ), Math.random(), Math.random() ],
                [ new Date( '2017-04-04' ), Math.random(), Math.random() ],
                [ new Date( '2017-04-05' ), Math.random(), Math.random() ],
                [ new Date( '2017-04-06' ), Math.random(), Math.random() ],
                [ new Date( '2017-04-07' ), Math.random(), Math.random() ],
                [ new Date( '2017-04-08' ), Math.random(), Math.random() ],
                [ new Date( '2017-04-09' ), Math.random(), Math.random() ],
                [ new Date( '2017-04-10' ), Math.random(), Math.random() ],
                [ new Date( '2017-04-11' ), Math.random(), Math.random() ],
                [ new Date( '2017-04-12' ), Math.random(), Math.random() ],
                [ new Date( '2017-04-13' ), Math.random(), Math.random() ]
            ]
        } );

        var charteditor = new google.visualization.ChartEditor();
        charteditor.openDialog( w );

    };

} );
