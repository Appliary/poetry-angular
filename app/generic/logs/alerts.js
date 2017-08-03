app.controller( 'generic/logs/alerts', function ( $scope, $http ) {

  console.log("%cgeneric/logs/alerts","background-color: black; color: #2BFF00");

    $scope.config = {};

    loadConfig();

    function loadConfig(){
      if($scope.$root.__module.config
          && $scope.$root.__module.config.tabs
          && $scope.$root.__module.config.logs && $scope.$root.__module.config.logs.alerts){
              $scope.options = buildConfig($scope.$root.__module.config.logs.alerts);
          }
          else{
            $scope.options = buildConfig();
          }
          console.log("%clog/alerts loaded","background-color: black; color: #2BFF00");
          $scope.loaded = true;
    }



    function buildConfig(options){
      console.log("options",options);
      options = options || {};

      // display
      $scope.config.fields = options.fields || [
        "_id",
        "rule",
        "source",
        "level",
        "category",
        "context",
        "message",
        "acknowledgedBy",
        "acknowledgedAt",
        "note"
      ];
      $scope.config.subOnly = options.subOnly || false;
      $scope.config.arrayObject = options["[object]"] || options.arrayObject || {};
      $scope.config.measurements = options["measurements"];
      $scope.config.noType = true;

      // params
      $scope.config.apiPath = options.apiPath || "";
      $scope.config.sort = options.sort || "timestamp";
      $scope.config.limit = options.limit || 100;
      $scope.config.order = options.order || "desc";
      $scope.config.page = options.page || 0;
      $scope.config.tagify = options.tagify || false;

      return $scope.config;
    }

} );
