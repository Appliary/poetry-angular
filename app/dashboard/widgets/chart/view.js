app.controller( 'dashboard/widgets/chart/view', function ChartWidget(
    $scope,
    $rootScope,
    $http,
    $q,
    googleChartApiConfig
) {

  /**
   * For some charts, only show last measurement
   */
  var isSingleDataChart = false;

    init();

    $scope.widget.refresh = init;

    /**
    * Init function
    */
    function init(){
      console.log("init");
      delete $scope.widget.options.chartOptions.width;
      delete $scope.widget.options.chartOptions.height;
      $scope.widget.chartObject = {
          data: [],
          type: $scope.widget.options.chartType,
          options: $scope.widget.options.chartOptions
      };

      /**
       * set user locale and language or set default
       */
      var locale = $rootScope.user && $rootScope.user.locale ? $rootScope.user.locale : 'us';
      var language = $rootScope.user && $rootScope.user.language ? $rootScope.user.language : 'en';
      googleChartApiConfig.optionalSettings.locale = locale;
      googleChartApiConfig.optionalSettings.language = language;

      switch ( $scope.widget.chartObject.type ) {
          case "Gauge":
          case "PieChart":
              isSingleDataChart = true;
              break;
      }

      /**
       * timeFrame
       * Object containing computed from and to
       */
      $scope.timeFrame = ( function timeFrame( tf ) {

          var fromDate = new Date(),
              toDate = new Date();

          if ( !tf ) throw new Error( 'No timeframe, aborting' );

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

                      case 'thisWeek':
                          fromDay = fromDate.getDay();
                          if ( fromDay ) fromDay--;
                          else fromDay = 6;

                          fromDate.setDate( fromDate.getDate() - fromDay );
                          toDate.setDate( toDate.getDate() - fromDay + 6 );
                          break;

                      case 'lastWeek':
                          fromDay = fromDate.getDay();
                          if ( fromDay ) fromDay--;
                          else fromDay = 6;

                          fromDate.setDate( fromDate.getDate() - fromDay - 7 );
                          toDate.setDate( toDate.getDate() - fromDay - 1 );
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
                  throw new Error( 'Unknown timeFrame type ', tf.unit );
          }

          return {
              from: fromDate,
              to: toDate
          };

      } )( $scope.widget.options.timeframe );


      // if the widget use custom data and not inputs (e.g.: reportManagement)
      if ( $scope.widget.custom ) readCustom();
      else readInputs();
    }


    /***
     * ID du device : $scope.widget.options.inputs[].id
     * attention peut être smart device (voir options.inputs[].kind)
     *
     * Pour les dates : $scope.timeFrame et $scope.widget.options.step
     ***/

    // get measurements for one input
    function getData( input, after, before ) {
        var dfd = $q.defer();
        var apiUrl = input.kind == 'smartdevice' ? '/api/smartdevices/' : '/api/devices/';
        var aggregation = ( input.kind == 'smartdevice' && $scope.widget.options.step ) ? '/' + $scope.widget.options.step : "";
        var limit = 0;
        if ( isSingleDataChart ) {
            limit = 1;
        }
        var url = apiUrl + input.id + '/measurements' + aggregation + '?before=' + before + '&after=' + after + '&order=asc&limit=' + limit;

        var mtype = input.type;


        var data = [];
        var result = {
            input: input
        };
        console.log( "getdevicesdata url", url );
        $http.get( url )
            .then( function ( response ) {
                if ( angular.isObject( response.data ) && response.data.data ) {
                    result.name = response.data.parent.name;
                    result.unit = response.data.parent.unit || "";
                    var measurementData = response.data.data;
                    measurementData.forEach( function ( md ) {
                        if ( angular.isArray( md.measurements ) ) {
                            md.measurements.some( function ( measurement ) {
                                if ( measurement.type != mtype ) return false;

                                var date = new Date( md.timestamp );
                                data.push( [ date, measurement.value ] );
                                return true;
                            } );
                        }
                    } );
                } else {
                    data = response.data;
                }
                result.data = data;
                dfd.resolve( result );
            }, dfd.reject );

        return dfd.promise;
    }

    // to show data from multiple devices on one chart
    function mergeData( newData ) {
        if ( !( angular.isArray( $scope.widget.chartObject.data ) &&
                $scope.widget.chartObject.data.length > 0 &&
                angular.isArray( $scope.widget.chartObject.data[ 0 ] ) ) ) {
            $scope.widget.chartObject.data = newData;
            return;
        }

        var position = $scope.widget.chartObject.data[ 0 ].length;
        newData.forEach( function ( elem ) {
            var dataRow = getDataRow( $scope.widget.chartObject.data, elem[ 0 ] );
            if ( dataRow.length ) {
                if ( dataRow.length <= position )
                    dataRow.push( elem[ 1 ] );
            } else {
                dataRow = [ elem[ 0 ] ];
                for ( i = 1; i < position; i++ ) {
                    dataRow.push( null );
                }
                dataRow.push( elem[ 1 ] );
                $scope.widget.chartObject.data.push( dataRow );
            }
        } );

        $scope.widget.chartObject.data.forEach( function ( elem, i ) {
            var dataRow = getDataRow( newData, elem[ 0 ] );
            if ( !dataRow.length ) elem.push( null );
        } );
    }

    // used by merge function to look for common measurements dates to update
    function getDataRow( data, key ) {
        var result;
        data.some( function ( elem ) {
            var date1 = new Date( key ),
                date2 = new Date( elem[ 0 ] );
            if (
                key == 'date' &&
                elem[ 0 ] == 'date' ||
                date1.getTime() == date2.getTime()
            ) return !!( result = elem );
        } );

        return result || [];
    }


    var doInitVAxisTitle = true;

    function readInputs() {
      console.log("readInputs");
        if ( angular.isArray( $scope.widget.options.inputs ) ) {
            $scope.widget.options.inputs.forEach( function ( input ) {
                getData( input, $scope.timeFrame.from, $scope.timeFrame.to )
                    .then( function ( res ) {
                        var chartData = res.data;

                        // if empty array, no show
                        if ( !chartData.length ) return;

                        if ( isSingleDataChart ) {
                            if ( !$scope.widget.chartObject.data.length ) {
                                $scope.widget.chartObject.data = [
                                    [ 'Label', 'Value' ]
                                ];
                            }
                            $scope.widget.chartObject.data.push(
                                [ res.input.type + ( res.unit ? " (" + res.unit + ")" : "" ), chartData[ 0 ][ 1 ] || 0 ]
                            );

                            console.debug( "chart data", $scope.widget.chartObject.data );
                            return;
                        }

                        if ( !angular.isObject( $scope.widget.chartObject.options.vAxis ) ) {
                            $scope.widget.chartObject.options.vAxis = {};
                        }

                        // update vAxis title
                        if ( doInitVAxisTitle ) {
                            doInitVAxisTitle = false;
                            $scope.widget.chartObject.options.vAxis.title = "";
                        } else {
                            $scope.widget.chartObject.options.vAxis.title += ", ";
                        }

                        $scope.widget.chartObject.options.vAxis.title += res.input.type + ( res.unit ? " (" + res.unit + ")" : "" );

                        chartData.unshift( [ 'date', res.input.varName || "" ] );
                        mergeData( chartData );
                        console.debug( "chart data", $scope.widget.chartObject.data );
                    } );
            } );
        }
    }

    // handle custom object: ({name:"...", data:[...], unit:"..."})
    function readCustom() {
        if ( angular.isObject( $scope.widget.custom ) ) {
            var custom = $scope.widget.custom;
            result = [];
            var keys = Object.keys( custom.data );
            var ticks = [];

            // fill the array
            keys.forEach( function ( k ) {
                var value = 0;
                try {
                    value = parseFloat( custom.data[ k ] || 0 );
                } catch ( e ) {}
                result.push( [ new Date( k ), value ] );
                ticks.push( new Date( k ) );
            } );

            // sort the array
            result.sort( function ( a, b ) {
                return a[ 0 ].getTime() < b[ 0 ].getTime();
            } );

            var total = result.length;
            result.unshift( [ 'date', custom.name || "" ] );

            formatChart( total, custom.hAxisMaxLabels, ticks );

            var title = custom.type;
            if ( custom.unit )
                title += ' (' + custom.unit + ')';

            $scope.widget.chartObject.options.vAxis = {
                title: title
            };

            $scope.widget.chartObject.data = result;

        } else throw new TypeError( 'widget.custom need to be an object' );
    }

    //handle format, used by readCustom
    function formatChart( xTot, xMax, ticks ) {
        var aggregation = $scope.widget.options.step;
        var changePattern = false;
        var pattern = 'MMM yyyy';
        var allPatterns = {
            "daily": "M'/'d'/'yyyy",
            "weekly": "yyyy 'W' w",
            "monthly": pattern,
            "yearly": "yyyy"
        };

        if ( Object.keys( allPatterns )
            .indexOf( aggregation ) != -1 ) {
            changePattern = true;
            if ( aggregation == "daily" && googleChartApiConfig.optionalSettings.locale == 'fr' ) {
                pattern = "d'/'M'/'yyyy";
            }
        }

        var showTextEvery = angular.isNumber( xMax ) ? ( Math.ceil( xTot / xMax ) || 1 ) : 1;

        $scope.widget.chartObject.options.hAxis = {
            showTextEvery: showTextEvery,
            slantedText: true,
            slantedTextAngle: 50
        };

        if ( changePattern ) {
            $scope.widget.chartObject.options.hAxis.format = pattern;
            $scope.widget.chartObject.formatters = {
                "date": [ {
                    columnNum: 0, // column index to apply format to (the index where there are dates, see just above)
                    pattern: pattern
                } ]
            };
        }

        if ( angular.isArray( ticks ) ) {
            console.debug( "ticks" );
            $scope.widget.chartObject.options.hAxis.ticks = ticks;
        }
    }

} );
