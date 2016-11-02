app.controller('geoCtrl',function($scope,$interval,$log){
    
    $scope.widget.isChart = true;
    if(!$scope.widget.chartObject){
      $scope.widget.chartObject = {};
      $scope.widget.chartObject.type = "GeoChart";

      $scope.widget.chartObject.options = {
   
      };

      $scope.widget.chartObject.data = [
            ['Country', 'Popularity'],
            ['Germany', 200],
            ['United States', 300],
            ['Brazil', 400],
            ['Canada', 500],
            ['France', 600],
            ['RU', 700]
          ];
      }
    


    // ---------- Functions ----------------
    $scope.initWidgetData=function()
    {
        var intervalPromise=$interval($scope.loadData, 5000);
         $scope.$on('$destroy', function() {
            $interval.cancel(intervalPromise);
        });
    };
})