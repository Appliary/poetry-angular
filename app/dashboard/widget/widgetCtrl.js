app.controller( 'widgetCtrl', function ( widgetService, $scope, ngDialog, DevicesData, $q, $window, $filter, $rootScope, widgetService ) {

    // init googleChartApiConfig
    widgetService.initialize();

    console.log("%cwidgetCtrl", 'color: red; text-decoration: underline; font-weight: bolder;');

    console.log("%c"+$scope.widget.controller, 'color: red; text-decoration: underline; font-weight: bolder;');

    var chartType;

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


    /**
    *
    *
    * building chartObject
    *
    */
    if ( !$scope.widget.hasOwnProperty( 'chartObject' ) && !$scope.widget.hasOwnProperty( 'device' ) ) {
        var options = $scope.widget.chartOptions || {
            legend: {
                position: 'bottom'
            }
        };

        options.custom = options.custom || {};

        switch($scope.widget.controller){
          case 'LineChart':
          case 'lineCtrl':
          case 'Line':
            $scope.widget.type = "line";
            chartType = 'LineChart';
            options.pointSize = 4;
            options.interpolateNulls = true;
            break;
          case 'GaugeChart':
          case 'gaugeCtrl':
          case 'Gauge':
            $scope.widget.type = "gauge";
            chartType = 'Gauge';
            options = {
                width: 400,
                height: 120,
                redFrom: 90,
                redTo: 100,
                yellowFrom: 75,
                yellowTo: 90,
                minorTicks: 5
            };
            break;
          case 'ComboChart':
          case 'comboCtrl':
          case 'Combo':
          default:
            $scope.widget.type = "combo";
            chartType = 'ComboChart';
            options.seriesType = 'bars';
            break;
        }

        console.log("%c"+chartType+" <= "+$scope.widget.controller, 'color: red; text-decoration: underline; font-weight: bolder;');

          $scope.widget.chartObject = {
              type: chartType,
              data: [],
              options: options
          };

        $scope.widget.show = true;
    }


    // open edit mpodal
    $scope.clickToOpen = function () {
        widgetService.openEditModal($scope);
    };

    // the way to get measurements for ComboChart and LineChart
    $scope.getHistory = function ( deviceId, startDate, endDate, measurementType ) {
        var deferred = $q.defer();
        var result;

        var aggregation = $scope.widget.aggregation || "";
        DevicesData.getDeviceData( deviceId, startDate, endDate, measurementType, $scope.widget.smart, aggregation )
            .then( function ( measurements ) {
                result = [];

                var maxDate = new Date(endDate);
                var minDate = new Date(startDate);
                minDate.setDate(minDate.getDate() -1);
                maxDate.setDate(maxDate.getDate() +1);

                if ( measurements.datas && measurements.datas.length > 0 ) {
                    measurements.datas.forEach( function ( measurement ) {
                        result.push( measurement );
                    } );
                }
                var dvd = result.length;

                // if empty result, generate a fake value (to show an empty chart)
                if ( result.length == 0){
                  result.push(['', 0]);
                  $scope.widget.chartObject.options.series = {
                    0: {
                      color: 'transparent'
                    }
                  }
                }
                else{
                  delete $scope.widget.chartObject.options.series;
                }

                var custom = $scope.widget.chartObject.options.custom;

                result.unshift( [ 'date', measurements.name ] );
                var changePattern = false;
                var pattern = 'MMM yyyy';
                var showTextEvery = angular.isNumber(custom.maxXLabels) ? (Math.ceil(dvd / custom.maxXLabels) || 1) : 1;

                //console.log("%cAggregation= "+aggregation, 'color: #09FF00; background-color: black;');

                if ( aggregation == "daily" || aggregation == "monthly" || aggregation == "weekly" || aggregation == "yearly" ) {
                    changePattern = true;
                    if ( aggregation == "weekly" ) {
                        pattern = "yyyy 'W' w";
                        minDate.setDate(minDate.getDate() -7);
                        maxDate.setDate(maxDate.getDate() +7);
                    } else if ( aggregation == "yearly" ) {
                        pattern = "yyyy";
                        minDate.setFullYear(minDate.getFullYear() -1);
                        maxDate.setFullYear(maxDate.getFullYear() +1);
                    } else if ( aggregation == "daily" ) {
                        pattern = "M'/'d'/'yyyy";
                        if(userLocale == 'fr'){
                          pattern = "d'/'M'/'yyyy";
                        }
                        minDate.setDate(minDate.getDate() -1);
                        maxDate.setDate(maxDate.getDate() +1);
                    }
                    else{
                      minDate.setMonth(minDate.getMonth() -1);
                      maxDate.setMonth(maxDate.getMonth() +1);
                    }
                }
                if ( changePattern ) {
                    $scope.widget.chartObject.options.hAxis = {
                        format: pattern,
                        showTextEvery: showTextEvery
                    };
                    $scope.widget.chartObject.formatters = {
                        "date": [ {
                            columnNum: 0, // column index to apply format to (the index where there are dates, see just above)
                            pattern: pattern
                        } ]
                    };
                }

                $scope.widget.chartObject.options.vAxis = {
                    title: $scope.widget.measurementType + ' (' + measurements.unit + ')'
                };

                /*
                * TODO if only one value
                $scope.widget.chartObject.options.hAxis = {
                  viewWindow: {
                    min: minDate,
                    max: maxDate
                  }
                }*/

                deferred.resolve( result );
            } );

        return deferred.promise;
    }

    // Get last measurement object of selected device from its type
    $scope.selectLastMeasurement = function(deviceId, measurementType, smart){

        var deferred = $q.defer();

        DevicesData.getLastData(deviceId, measurementType, smart)
        .then(function (measurement){
            console.log("last result", measurement);
            $scope.selectedMeasurement = measurement;
            $scope.widget.chartObject.data = [
                ['Label', 'Value'],
                [measurementType, measurement.value]
            ];

            deferred.resolve(measurement);
        });

        return deferred.promise;
    }

    $scope.addDevice = function ( id ) {
        console.log("%c$scope.widget.chartObject.type = "+$scope.widget.chartObject.type, "color: blue; font-weight: bolder; text-decoration: underline;");
      if(chartType == 'Gauge' && id && $scope.widget.measurementType){

          $scope.selectLastMeasurement(id, $scope.widget.measurementType, $scope.widget.smart)
          .then(function (){
              $scope.widget.device = {
                  id: id,
                  type: $scope.widget.measurementType,
                  value: $scope.selectedMeasurement.value
              };
              $scope.widget.deviceList = [{
                  id: id
              }];
              $scope.loading = false;
          });
          return;
      }

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

                  if($scope.widget.chartObject.type == 'Gauge'){
                    $scope.widget.device = {
                        id: $scope.widget.deviceId,
                        type: $scope.widget.measurementType,
                        value: $scope.selectedMeasurement.value
                    };
                    $scope.widget.deviceList = [{
                        id: $scope.widget.deviceId
                    }];
                  }
                  else{
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
                  }

                    $scope.widget.chartObject.data = head.concat( body );
                    //console.log("%cchartObject : "+$scope.widget.chartObject.type,"color: red; background-color: black; font-weight: bolder;");
                    //console.log("chartObject",$scope.widget.chartObject);
                    $scope.loading = false;
                } );
        } else {
            console.log( "all fields not completed" );
        }
    }

    /*
    * function $scope.mergeData
    *
    * merge old data and new data for the chart
    *
    * params:
    *  - resultData - Array([date, value]) : chart data
    *  - newData - Array([date, value]) : chart data
    *
    * return: undefined
    *
    * ps: used in $scope.getHistory Fn
    */
    $scope.mergeData = function ( resultData, newData ) {
        var position = resultData[ 0 ].length;
        newData.forEach( function ( elem ) {
            var dataRow = getDataRow( resultData, elem[ 0 ] );
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
            var dataRow = getDataRow( newData, elem[ 0 ] );
            if ( dataRow.length == 0 ) {
                elem.push( null );
            }
        } );

    }

    /*
    * function getDataRow
    *
    * params:
    *  - data - Array([date, value]) : chart data
    *  - date - Date : Date to look for
    *
    * return: the array element from data found : ex: [date, 5]
    *
    * ps: used in $scope.mergeData Fn
    */
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

    // ------------------ Starters -----------------

    $scope.refreshFromDevice = function () {
        /*
        ** normally there is always a chartObject (bc built if not) so WHY CHECK AGAIN !!!????
        if ( !$scope.widget.chartObject ) {
            $scope.widget.chartObject = {
                type: chartType,
                data: {},
                options: $scope.widget.options
            };

            $scope.widget.deviceList.forEach( function ( device ) {
                $scope.addDevice( device.id );
            } );

        }*/
        if ( $scope.widget.chartObject.data.length == 0 && $scope.widget.deviceList ) {

        }
        if(chartType == 'Gauge' ){
            $scope.widget.deviceId = $scope.widget.deviceList[0].id;
            $scope.addDevice($scope.widget.deviceId);
        }
        else{
          $scope.widget.deviceList.forEach( function ( device ) {
              $scope.addDevice( device.id );
          } );
        }
        $scope.widget.refreshed = true;
    }

    // ------------ Begining ---------------

    if(!$scope.widget.refreshed && angular.isArray($scope.widget.deviceList)
    && $scope.widget.deviceList.length > 0 && $scope.widget.chartObject.data.length == 0){
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


    // ------------- Limbos ---------------------

    /**
    ** DONT KNOW IF IT'S USED AND WHY EXACTLY - NOTHING IS CLEAR !!!
    ** SO I PUT EVERYTHING I DON'T CARE ABOUT AS COMMENTS
    ** IF YOU KNOW WHY IT SHOULD BE USED, HELP YOURSELF
    $scope.getDevice = function(id){
        var deviceReturn = {};

        $scope.devicesData.forEach(function(device){
          if(device.id == id){
            deviceReturn = device;
          }
        });

        return deviceReturn;
    }

    $scope.addTempDevice = function () {
        var currentDevice = {
            id: $scope.widget.deviceId
        };

        $scope.tempDeviceList.push( currentDevice );
    }

    // aparently it's to remove a device but I don't know where this Fn is called
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

    */

} );
