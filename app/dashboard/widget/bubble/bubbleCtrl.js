app.controller('bubbleCtrl',function($scope,$interval,$log){
    
    if(!$scope.widget.chartObject){
        $scope.widget.chartObject = {};
        $scope.widget.chartObject.type = "BubbleChart";
        $scope.widget.isChart = true;

        $scope.widget.chartObject.options = {
            colorAxis: {colors: ['yellow', 'red']}
        };

        $scope.widget.chartObject.data = ([
            ['ID', 'X', 'Y', 'Temperature'],
            ['',   80,  167,      120],
            ['',   79,  136,      130],
            ['',   78,  184,      50],
            ['',   72,  278,      230],
            ['',   81,  200,      210],
            ['',   72,  170,      100],
            ['',   68,  477,      80]
        ]);
    }
    

    // -------------- Functions ------------------

    $scope.initWidgetData=function()
    {
        var intervalPromise=$interval($scope.loadData, 5000);
         $scope.$on('$destroy', function() {
            $interval.cancel(intervalPromise);
        });
    };
})