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

        console.log("timeFrame",tf);

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

      var mtype = (input.kind == 'smartdevice' && $scope.widget.options.step) ?
        input.type+' (delta '+$scope.widget.options.step+')'
        : input.type;


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
                if ( measurement.type == mtype && !found ) {
                  found = true;
                  var date = new Date( md.timestamp );
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

    // to show data from multiple devices on one chart
    function mergeData(newData){
      if(!(angular.isArray($scope.chartObject.data)
          && $scope.chartObject.data.length > 0
          && angular.isArray($scope.chartObject.data[0])))
      {
        $scope.chartObject.data = newData;
        return;
      }

      var position = $scope.chartObject.data[ 0 ].length;
      newData.forEach( function ( elem ) {
          var dataRow = getDataRow( $scope.chartObject.data, elem[ 0 ] );
          if ( dataRow.length ) {
              if ( dataRow.length <= position )
                  dataRow.push( elem[ 1 ] );
          } else {
              dataRow = [ elem[ 0 ] ];
              for ( i = 1; i < position; i++ ) {
                  dataRow.push( null );
              }
              dataRow.push( elem[ 1 ] );
              $scope.chartObject.data.push( dataRow );
          }
      } );

      $scope.chartObject.data.forEach( function ( elem ) {
          var dataRow = getDataRow( newData, elem[ 0 ] );
          if ( dataRow.length == 0 ) {
              elem.push( null );
          }
      } );
    }

    // used by merge function to look for common measurements dates to update
    function getDataRow( data, key ) {
        var result = [];
        var found = false
        data.forEach( function ( elem ) {
            var date1 = new Date( key )
                .getTime();
            var date2 = new Date( elem[ 0 ] )
                .getTime();
            if ( ( key == 'date' && elem[ 0 ] == 'date' || date1 == date2 ) && !found ) {
                result = elem;
                found = true;
            }
        } )

        return result;
    }


    function readInputs(){
          if(angular.isArray($scope.widget.options.inputs)){
            $scope.widget.options.inputs.forEach(
              function(input){
                getData(input, $scope.timeFrame.from, $scope.timeFrame.to).then(
                  function(res){
                    var chartData = res.data;
                    chartData.unshift(['date', res.name || ""]);

                    mergeData(chartData);
                    console.log("data",$scope.chartObject.data);
                  }
                );
              }
            );
          }
    }

    readInputs();


} );
