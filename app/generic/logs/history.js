app.controller( 'generic/logs/history', function ( $scope, $http ) {

    $scope.config = {};

    loadConfig();

    function loadConfig(){
      if($scope.$root.__module.config
          && $scope.$root.__module.config.tabs
          && $scope.$root.__module.config.logs && $scope.$root.__module.config.logs.history){
              $scope.options = buildConfig($scope.$root.__module.config.logs.history);
          }
          else{
            $scope.options = buildConfig();
          }
          $scope.loaded = true;
    }



    function buildConfig(options){
      console.log("options",options);
      options = options || {};

      // display
      $scope.config.fields = options.fields;
      $scope.config.subOnly = options.subOnly || false;
      $scope.config.arrayObject = options["[object]"] || options.arrayObject || {};
      $scope.config.measurements = options["measurements"];

      // params
      $scope.config.apiPath = options.apiPath || "/logs";
      $scope.config.sort = options.sort || "timestamp";
      $scope.config.limit = options.limit || 100;
      $scope.config.order = options.order || "desc";
      $scope.config.page = options.page || 0;

      return $scope.config;
    }

} );
