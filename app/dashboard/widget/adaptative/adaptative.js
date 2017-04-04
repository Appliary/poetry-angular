app.controller( 'adaptativeCtrl', function ( $scope, $http, ngDialog, $q ) {


    if ( !$scope.widget )
        $scope.widget = {};

    $scope.widget.isChart = true;

    if ( !$scope.widget.hasOwnProperty( 'chartObject' ) ) {
        $scope.widget.chartObject = {};
        $scope.widget.chartObject.type = 'BubbleChart';

        $scope.widget.chartObject.options = {
            colorAxis: {
                colors: [ 'green', 'blue' ]
            }
        };

        $scope.widget.chartObject.data = ( [
            [ 'ID', 'X', 'Y', 'Temperature' ],
            [ '', 80, 167, 120 ],
            [ '', 79, 136, 130 ],
            [ '', 78, 184, 50 ],
            [ '', 72, 278, 230 ],
            [ '', 81, 200, 210 ],
            [ '', 72, 170, 100 ],
            [ '', 68, 477, 80 ]
        ] );
    }

    // ------------- Functions --------------------


    $scope.loadPathData = function ( path ) {

        $scope.loadingInfo = 'Looking for your datas ...';

        console.log( 'url', path );

        loadDataFromAPI( path );
    };

    $scope.clickToOpen = function () {

        ngDialog.openConfirm( {

                template: 'dashboard/modalWidget.pug',

                className: 'ngdialog-theme-default',

                scope: $scope,

                width: '800px'

            } )

            .then( function ( res ) {

                $scope.calculChart()
                    .then( function ( res ) {

                        console.log( 'after calcul', res );

                    } );

            } );
    };

    function loadDataFromAPI( path ) {

        $scope.loadingInfo = 'Calling API ...';

        $http.get( path )
            .then( function ( res ) {

                console.log( 'res', res.data );

                $scope.resultats = res.data;

                $scope.loadingInfo = '';

            } );
    }

    $scope.alert = function ( a ) {

        console.log( 'alert :', a );
    };

    $scope.addDataPoints = function ( res ) {

        var newDataPoint = {};

        angular.forEach( res, function ( value, key ) {

            console.log( 'key', key );

            newDataPoint[ key ] = value;

        } );

        $scope.widget.dataPoints.push( newDataPoint );

        console.log( 'datapoint', $scope.widget.dataPoints );
    };

    $scope.resetDataPoints = function () {

        $scope.widget.dataPoints = [];
    };

    $scope.searchForChart = function () {

        $scope.widget.api = {};

        $scope.widget.api.name = $scope.api.name;

        console.log( 'Searching for chart ' );

        $scope.loadingInfo = 'Searching chart ...';

        switch ( $scope.widget.api.name ) {

            case 'Alert':

                $scope.possibleChart.push( {
                    'name': 'Pie',
                    'type': 'PieChart'
                } );

                $scope.possibleChart.push( {
                    'name': 'Bar',
                    'type': 'ColumnChart'
                } );

                $scope.possibleChart.push( {
                    'name': 'Line',
                    'type': 'LineChart'
                } );

                break;

        }
    };

    $scope.applyChart = function ( chart ) {

        $scope.widget.chart = chart;
    };

    $scope.calculChart = function () {

        var defer = $q.defer();

        console.log( 'chart', $scope.widget.api.name );

        var count = {};

        switch ( $scope.widget.api.name ) {

            case 'Alert':

                console.log( 'api path', $scope.apis.alert.path );

                $http.get( $scope.apis.alert.path )
                    .then( function ( res ) {

                        console.log( 'res', res );

                        angular.forEach( res.data, function ( resultat ) {

                            console.log( 'datapoints', $scope.widget.dataPoints );

                            angular.forEach( $scope.widget.dataPoints, function ( dataPoint ) {

                                console.log( 'stat', dataPoint.stat );

                                if ( !count.hasOwnProperty( dataPoint.stat ) ) {

                                    count[ dataPoint.stat ] = 0;

                                }

                                if ( resultat.hasOwnProperty( dataPoint.stat ) ) {

                                    count[ dataPoint.stat ] += 1;

                                }

                            } );

                            defer.resolve( count );

                        } );

                    } );

                break;

        }

        return defer.promise;
    };

    $scope.loadData = function () {

        //     console.log("adaptive loaddata");
        //     $scope.widget.chartObject.type = "BubbleChart";
        //     $scope.widget.isChart = true;

        //     $scope.widget.chartObject.options = {
        //         colorAxis: {colors: ['green', 'blue']}
        //     };

        //     $scope.widget.chartObject.data = ([
        //       ['ID', 'X', 'Y', 'Temperature'],
        //       ['',   80,  167,      120],
        //       ['',   79,  136,      130],
        //       ['',   78,  184,      50],
        //       ['',   72,  278,      230],
        //       ['',   81,  200,      210],
        //       ['',   72,  170,      100],
        //       ['',   68,  477,      80]
        //     ]);
    };

} );
