app.controller( 'dashboard/widgets/chart/view', function ChartWidget(
    $scope,
    $http,
    $q
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
                throw new Error( 'Unknown timeFrame type ', tf.unit);
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

    /*$http.get( '/api/measurements' )
        .then( function receivedData( res ) {
            $scope.chartObject.data = res.data.data;
    } );*/

    // get measurements for one input
    function getData(input, after, before){
      var dfd = $q.defer();
      var apiUrl = input.kind == 'smartdevice' ? '/api/smartdevices/' : '/api/devices/';
      var aggregation = ( input.kind == 'smartdevice' && $scope.widget.options.step ) ? '/' + $scope.widget.options.step : "";
      var url = apiUrl + input.id +'/measurements' + aggregation + '?before=' + before + '&after=' + after + '&sort=asc';

      var data = [];
      var result = {};
      console.log( "getdevicesdata url", url );
      $http.get( url )
      .then( function ( response ) {
        if (angular.isObject(response.data) && response.data.data ) {
          result.name = response.data.parent.name;
          result.unit = response.data.parent.unit || "";
          var measurementData = response.data.data;
          measurementData.forEach( function ( md ) {
            var found = false;
            if ( angular.isArray(md.measurements) ) {
              md.measurements.forEach( function ( measurement ) {
                if ( measurement.type == input.type && !found ) {
                  found = true;
                  var date = new Date( md.timestamp );
                  var dateToShow = date.getHours() + ' - ' + date.getDate() + '/' + date.getMonth();
                  data.push( [ date, measurement.value ] );
                }
              } );
            }
          } );
        }
        else {
          data = response.data;
        }
        result.data = data;
        dfd.resolve( result );
      },
      function(e){
        console.error(e);
        dfd.reject( e );
      }
    );

      return dfd.promise;
    }

    function readInputs(){
          if(angular.isArray($scope.widget.options.inputs)){
            $scope.widget.options.inputs.forEach(
              function(input){
                getData(input, $scope.timeFrame.from, $scope.timeFrame.to).then(
                  function(res){
                    var head = ['date', res.name || ""];
                    var chartData = res.data;
                    chartData.unshift(head);
                    console.log("data",chartData);
                    $scope.chartObject.data = chartData;
                  }
                );
              }
            );
          }
    }

    readInputs();


} );
