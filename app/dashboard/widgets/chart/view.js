app.controller( 'dashboard/widgets/chart/view', function ChartWidget(
    $scope,
    $http
) {

    $scope.chartObject = {
        data: [],
        type: $scope.widget.options.chartType,
        options: $scope.widget.options.chartOptions
    };

    /**
     * timeFrame
     * Object containing computed from and to
     */
    $scope.timeFrame = ( function timeFrame( tf ) {

        var fromDate = new Date(),
            toDate = new Date();

        switch ( tf.type ) {

            case 'static':
                return {
                    from: tf.from,
                    to: tf.to
                };

            case 'absolute':
                fromDate.setHours( 0, 0, 0, 0 );
                toDate.setHours( 0, 0, 0, 0 );
                switch ( tf.frame ) {

                    case 'today':
                        toDate.setDate( toDate.getDate() + 1 );
                        break;

                    case 'yesterday':
                        fromDate.setDate( fromDate.getDate() - 1 );
                        break;

                    case 'thisMonth':
                        fromDate.setDate( 1 );
                        toDate.setMonth( toDate.getMonth() + 1 );
                        toDate.setDate( 1 );
                        break;

                    case 'lastMonth':
                        fromDate.setMonth( fromDate.getMonth() - 1 );
                        fromDate.setDate( 1 );
                        toDate.setDate( 1 );
                        break;

                    case 'thisYear':
                        fromDate.setMonth( 0, 1 );
                        toDate.setMonth( 0, 1 );
                        toDate.setFullYear( toDate.getFullYear() + 1 );
                        break;

                    case 'lastYear':
                        fromDate.setMonth( 0, 1 );
                        toDate.setMonth( 0, 1 );
                        fromDate.setFullYear( fromDate.getFullYear() - 1 );
                        break;

                    default:
                        throw new Error( 'frame not found' );

                }
                toDate.setMilliseconds( -1 );
                break;

            case 'relative':
                switch ( tf.unit ) {

                    case 'years':
                        fromDate.setFullYear(
                            fromDate.getFullYear() - tf.count
                        );
                        break;

                    case 'months':
                        fromDate.setMonth(
                            fromDate.getMonth() - tf.count
                        );
                        break;


                    case 'weeks':
                        tf.count *= 7;
                        /* jshint -W086 */ // FALLTROUGH IS NORMAL

                    case 'days':
                        /* jshint +W086 */ // END FALLTROUGH IS NORMAL
                        fromDate.setDate(
                            fromDate.getDate() - tf.count
                        );
                        break;

                    case 'hours':
                        fromDate.setHours(
                            fromDate.getHours() - tf.count
                        );
                        break;

                    case 'minutes':
                        fromDate.setMinutes(
                            fromDate.getMinutes() - tf.count
                        );
                        break;

                }
                break;

            default:
                throw new Error( 'Unknown timeFrame type' );
        }

        return {
            from: fromDate,
            to: toDate
        };

    } )( $scope.widget.options.timeframe );


    /***
     * ID du device : $scope.widget.options.inputs[].id
     * attention peut être smart device (voir options.inputs[].kind)
     *
     * Pour les dates : $scope.timeFrame et $scope.widget.options.step
     ***/

    $http.get( '/api/measurements' )
        .then( function receivedData( res ) {
            chartObject.data = res.data.data;
        } );


} );
