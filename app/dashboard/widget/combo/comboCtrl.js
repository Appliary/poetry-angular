app.controller( 'comboCtrl', function ( widgetService, $scope, ngDialog, DevicesData, $q, $window, $filter, $rootScope, widgetService, googleChartApiConfig ) {

    widgetService.initialize();

    console.log("%cComboCtrl gave up on life", 'color: red; text-decoration: underline; font-weight: bolder;');

    $scope.widget.isChart = true;
    $scope.widget.type = "combo";
    $scope.dateOptions = widgetService.getDateOptions();

    if ( !$scope.widget.chartObject )
        $scope.loading = true;

    if ( $scope.widget.deviceList ) {
        $scope.tempDeviceList = $scope.widget.deviceList.slice( 0 );
    } else {
        $scope.tempDeviceList = [];
    }

    if ( !$scope.widget.hasOwnProperty( 'chartObject' ) && !$scope.widget.hasOwnProperty( 'device' ) ) {
        var options = $scope.widget.chartOptions || {
            legend: {
                position: 'bottom'
            },
            seriesType: 'bars'
        };
        options.custom = options.custom || {};
        $scope.widget.chartObject = {
            type: "ComboChart",
            data: [],
            options: options
        };
        $scope.widget.show = true;

    }

    // ---------- Old Functions -------------------

    $scope.clickToOpen = function () {
        widgetService.openEditModal($scope);
    };

    // ---------------- New Functions ------------------

    $scope.formatChart = function(aggregation, unit, xTot, xMax, ticks){
      var changePattern = false;
      var pattern = 'MMM yyyy';

      if ( aggregation == "daily" || aggregation == "monthly" || aggregation == "weekly" || aggregation == "yearly" ) {
          changePattern = true;
          if ( aggregation == "weekly" ) {
              pattern = "yyyy 'W' w";
          } else if ( aggregation == "yearly" ) {
              pattern = "yyyy";
          } else if ( aggregation == "daily" ) {
              pattern = "M'/'d'/'yyyy";
              if(googleChartApiConfig.optionalSettings.locale == 'fr'){
                pattern = "d'/'M'/'yyyy";
              }
          }
      }

      var showTextEvery = angular.isNumber(xMax) ? (Math.ceil(xTot / xMax) || 1) : 1;

      if ( changePattern ) {
          $scope.widget.chartObject.options.hAxis = {
              format: pattern,
              showTextEvery: showTextEvery,
              slantedText:true,
              slantedTextAngle:50
          };
          $scope.widget.chartObject.formatters = {
              "date": [ {
                  columnNum: 0, // column index to apply format to (the index where there are dates, see just above)
                  pattern: pattern
              } ]
          };
      }
      else{
        $scope.widget.chartObject.options.hAxis = {
            showTextEvery: showTextEvery,
            slantedText:true,
            slantedTextAngle:50
        };
      }

      if(angular.isArray(ticks)){
        console.debug("ticks");
        $scope.widget.chartObject.options.hAxis.ticks = ticks;
      }

      var title = $scope.widget.measurementType;
      if(unit){
        title +=  ' (' + unit + ')';
      }
      $scope.widget.chartObject.options.vAxis = {
          title: title
      };
    }

    $scope.getHistory = function ( deviceId, startDate, endDate, measurementType ) {
        var deferred = $q.defer();

        var result;

        var aggregation = $scope.widget.aggregation || "";
        var custom = $scope.widget.chartObject.options.custom;

        // if data were send
        if(angular.isObject(custom.data)){
          result = [];
          var keys = Object.keys(custom.data);
          var ticks = [];

          // fill the array
          keys.forEach(function(k){
            var value = 0;
            try{
              value = parseFloat(custom.data[k] || 0);
            }
            catch(e){}
            result.push([new Date(k), value]);
            ticks.push(new Date(k));
          });

          // sort the array
          result.sort(function(a, b){
            return a[0].getTime() < b[0].getTime();
          });

          console.log("not sorted",result);

          // filter date
          /*
          result.forEach(function(el){
            el[0] = $filter('localize')(el[0], aggregation);
          });
          */

          console.log("filtered",result);

          var dvd = result.length;
          result.unshift( [ 'date', custom.name || "" ] );

          $scope.formatChart(aggregation ,custom.unit, dvd, custom.maxXLabels, ticks);

          deferred.resolve( result );

        }
        else{
          DevicesData.getDeviceData( deviceId, startDate, endDate, measurementType, $scope.widget.smart, aggregation )
            .then( function ( measurements ) {
                result = [];
                if ( measurements.datas && measurements.datas.length > 0 ) {
                    measurements.datas.forEach( function ( measurement ) {
                        result.push( measurement );
                    } );
                }
                var dvd = result.length;
                if ( result.length == 0){
                  //result.push([new Date(), 0]);
                  console.log("empty", result);
                }

                result.unshift( [ 'date', measurements.name ] );

                $scope.formatChart(aggregation, measurements.unit, dvd, custom.maxXLabels)

                /*var nd = new Date();
                nd.setFullYear(2015);

                $scope.widget.chartObject.options.hAxis = {
                  viewWindow: {
                    min: nd,
                    max: new Date()
                  }
                }*/

                deferred.resolve( result );
            } );
          }

        return deferred.promise;
    }


    $scope.refreshFromDevice = function () {
        if ( !$scope.widget.chartObject ) {
            $scope.widget.chartObject = {
                type: "ComboChart",
                data: {},
                options: {
                    legend: {
                        position: 'bottom'
                    },
                    seriesType: 'bars'
                }
            };

            $scope.widget.deviceList.forEach( function ( device ) {
                $scope.addDevice( device.id );
            } );

        }
        if ( $scope.widget.chartObject.data.length == 0 && $scope.widget.deviceList ) {
            $scope.widget.deviceList.forEach( function ( device ) {
                $scope.addDevice( device.id );
            } );
        }
        $scope.widget.refreshed = true;

    }

    $scope.addDevice = function ( id ) {
        if ( id && $scope.widget.measurementType && ( $scope.widget.dateOption || ( $scope.widget.startDate && $scope.widget.endDate ) ) ) {
            var startDate = "";
            var endDate = "";
            if ( $scope.widget.customDate ) {
                startDate = $scope.widget.startDate;
                endDate = $scope.widget.endDate;
            } else {
                endDate = new Date();
                switch ( $scope.widget.dateOption ) {
                    case "week":
                        startDate = new Date( endDate.getFullYear(), endDate.getMonth(), endDate.getDate() )
                            .getTime() - endDate.getDay() * 24 * 60 * 60 * 1000;
                        break;
                    case "month":
                        startDate = new Date( endDate.getFullYear(), endDate.getMonth(), 0 );
                        break;
                    default:
                        startDate = new Date( endDate.getFullYear(), endDate.getMonth(), endDate.getDate() );
                }
            }

            $scope.getHistory( id, startDate, endDate, $scope.widget.measurementType )
                .then( function ( result ) {
                    if ( !$scope.widget.chartObject.data || !$scope.widget.chartObject.data.length ) {
                        $scope.widget.chartObject.data = [];
                        result.forEach( function ( elem ) {
                            $scope.widget.chartObject.data.push( elem );
                        } );
                    } else {
                        $scope.mergeData( $scope.widget.chartObject.data, result );
                    }

                    var head = [ $scope.widget.chartObject.data[ 0 ] ];
                    var body = $scope.widget.chartObject.data.slice( 1 );
                    body.sort( function ( a, b ) {
                        var aDate = new Date( a[ 0 ] )
                            .getTime();
                        var bDate = new Date( b[ 0 ] )
                            .getTime();
                        return aDate - bDate;
                    } );

                    $scope.widget.chartObject.data = head.concat( body );
                    $scope.loading = false;
                } );
        } else {
            console.log( "all fields not completed" );
        }
    }

    $scope.removeDevice = function ( device ) {
        var position = -1;
        for ( i = 0; i < $scope.tempDeviceList.length; i++ ) {

            if ( $scope.tempDeviceList[ i ].id == device.id )
                position = i;
        }

        if ( position >= 0 ) {

            $scope.tempDeviceList.splice( position, 1 );
        } else {
            console.log( "device to remove not found" );
        }
    }

    $scope.mergeData = function ( resultData, newData ) {
        var position = resultData[ 0 ].length;
        newData.forEach( function ( elem ) {
            var dataRow = $scope.getDataRow( resultData, elem[ 0 ] );
            if ( dataRow.length ) {
                if ( dataRow.length <= position )
                    dataRow.push( elem[ 1 ] );
            } else {
                dataRow = [ elem[ 0 ] ];
                for ( i = 1; i < position; i++ ) {
                    dataRow.push( null );
                }
                dataRow.push( elem[ 1 ] );
                resultData.push( dataRow );
            }
        } );

        resultData.forEach( function ( elem ) {
            var dataRow = $scope.getDataRow( newData, elem[ 0 ] );
            if ( dataRow.length == 0 ) {
                elem.push( null );
            }
        } );

    }

    $scope.getDataRow = function ( data, key ) {
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

    $scope.addTempDevice = function () {
        var currentDevice = {
            id: $scope.widget.deviceId
        };

        $scope.tempDeviceList.push( currentDevice );
    }

    // used for the modalCombo
    $scope.apply = function () {
        $scope.widget.deviceList = $scope.tempDeviceList;
        $scope.widget.chartObject.data = [];

        $scope.widget.deviceList.forEach( function ( device ) {
            $scope.addDevice( device.id );
        } );

        // close the modal, sending a result
        $scope.confirm( {
            'newWidget': $scope.widget,
            'title': $scope.$parent.$parent.widget.title
        } );
    }

    // ------------------ Begining -----------------

    if ( !$scope.widget.refreshed ) {
        $scope.refreshFromDevice();
    }

    // ------------- Watchers ---------------------

    angular.element( $window )
        .on( 'resize', function () {
            console.log( "angular elem resize combo" );
            $scope.widget.resize = true;
        } );

    $scope.$watch( 'widget.resize', function () {
        $scope.isChart = false;
        setTimeout( function () {
            if ( $scope.widget.resize == true ) {
                $scope.isChart = true;
                $scope.widget.resize = false;
            }

        }, 2000 );
    } );

} );
