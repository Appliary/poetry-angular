app.factory('assetsUtils', function(){

  function parseChildren( children, blocksArray, apartmentsArray, devicesArray, isContact, appIds ) {

      if ( children.length > 0 ) {
          children.forEach( function ( child ) {
              if ( child.type == "blocks" ) {
                  blocksArray.push( child );
              } else if ( child.type == "apartments" ) {
                  if(isContact){
                    if(appIds.indexOf( child._id ) > -1){
                      apartmentsArray.push( child );
                    }
                  }
                  else{
                    apartmentsArray.push( child );
                  }
              } else {
                  devicesArray.push( child );
              }
          } );
      }
  };

  function getChildren( asset ) {
    return asset ? (typeof asset.children === "string" ? JSON.parse( asset.children ) : asset.children || []) : [];
  };

  function buildSDWidget(loadedDevice, dateType, after, beforeD, line){
    console.log("dateType",dateType);
    var before = beforeD ? beforeD : Date.now();
    line = line || {};
    var newWidget = {
        controller: "comboCtrl",
        type: "chart",
        options: {
          step: dateType,
          hideTable: true,
          chartType: 'ComboChart',
          chartOptions: {
              legend: {
                  position: 'bottom'
              },
              seriesType: 'bars',
              title: loadedDevice.title,
              titleTextStyle: {
                fontSize: 11
              },
              height: 400,
              hAxis: {
                slantedText: true,
                slantedTextAngle: 50
              }
          }
        },
        custom: {
          name: loadedDevice.name,
          data: line.data,
          type: loadedDevice.type + " (delta "+dateType+")",
          unit: line.unit
        },
        chartOptions: {
            legend: {
                position: 'bottom'
            },
            seriesType: 'bars',
            title: loadedDevice.title,
            titleTextStyle: {
              fontSize: 11
            },
            height: 350,
            hAxis: {
              slantedText: true,
              slantedTextAngle: 60
            },
            custom: {
              name: loadedDevice.name,
              data: line.data,
              type: loadedDevice.type + " (delta "+dateType+")",
              unit: line.unit
            }
        },
        edit: false,
        customDate: true,
        startDate: after.getTime(),
        endDate: Date.now(),
        measurementType: loadedDevice.type + " (delta "+dateType+")",
        title: loadedDevice.type + " consumption",
        smart: true,
        aggregation: dateType,
        deviceList: [ {
            id: loadedDevice._id
        } ]
    };
    return newWidget;
  }

  function gotoSD(id){
    window.location.replace( '/deviceManager/smartdevices/' + id + '/' );
  }

  function initializeScopeMin( scope ) {
      if ( !(scope.$root.report_data && scope.$root.report_config) ) {
          // Initialize
          console.log( "initialiazing" );
          scope.$root.report_buildingList = [];
          scope.$root.report_data = {
              buildings: [],
              apartments: [],
              blocks: [],
              devices: [],
              blocks1: [],
              apartments1: [],
              devices1: [],
              dateType: "monthly",
              view: 0,
              energy: "",
              apartmentsList: []
          };
          var dateStart = new Date();
          dateStart.setMonth( dateStart.getMonth() - 1 );
          scope.$root.report_date = {
              start: dateStart,
              end: new Date(),
              rebuild: ""
          };
          scope.$root.report_now = new Date();
          scope.$root.report_devicesInTable = [];
          scope.$root.report_energyTypes = [];
          scope.$root.report_devicesList = [];
          scope.$root.report_generated = false;
          scope.$root.report_loading = false;
          scope.$root.report_config = true;
          scope.$root.report_dateOptions = [ "daily", "weekly", "monthly", "yearly" ];
      }
  }

  return {
    buildSDWidget: buildSDWidget,
    parseChildren: parseChildren,
    getChildren: getChildren,
    gotoSD: gotoSD,
    initializeScopeMin: initializeScopeMin
  };
});
