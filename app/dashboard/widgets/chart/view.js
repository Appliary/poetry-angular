app.controller( 'dashboard/widgets/chart/view', function ChartWidget(
    $scope,
    $http
) {

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


} );
