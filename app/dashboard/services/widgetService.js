app.service( 'widgetService', function ( $http, $q, ngNotify, DevicesData, ngDialog, $filter, googleChartApiConfig, $rootScope ) {
  return {
    initialize: initialize,
    getDateOptions: getDateOptions,
    openEditModal: openEditModal
  };

  function initialize(){
      var userLocale = $rootScope.user && $rootScope.user.locale ? $rootScope.user.locale : 'us';
      googleChartApiConfig.optionalSettings.locale = userLocale;
      console.log('%cchart locale = '+googleChartApiConfig.optionalSettings.locale,"color: #09FF00; background-color: black; font-weight: bold;");
  }

  function getDateOptions(){
    return ["today", "week", "month"];
  }

  function openEditModal(scope){
    console.log("%cOpen Edit Modal", "color: yellow; background-color: black;");
    scope.newWidget = angular.copy(scope.widget);
    ngDialog.openConfirm( {
            template: 'dashboard/modalWidget.pug',
            className: 'ngdialog-theme-default',
            scope: scope
        } )
        .then( function ( result ) {
            console.log( "confirm edit result", result );
            scope.widget = result.newWidget;
            scope.widget.title = result.title;
            scope.saveDashboard();
        } );
  }

});
