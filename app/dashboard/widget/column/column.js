app.controller('columnCtrl',function($scope,$http,ngDialog,$filter){
    $scope.widget.isChart = true;

    if(!$scope.widget.chartObject){
        $scope.widget.chartObject = {};
        $scope.widget.chartObject.type = "ColumnChart";
        $scope.widget.chartObject.data = [
            ["Element", "Density", { role: "style" } ],
            ["Copper", 8.94, "#b87333"],
            ["Silver", 10.49, "silver"],
            ["Gold", 19.30, "gold"],
            ["Platinum", 21.45, "color: #e5e4e2"]
        ];
        $scope.widget.chartObject.options = {
            title: "Density of Precious Metals, in g/cm^3",
            width: 600,
            height: 400,
            bar: {groupWidth: "95%"},
            legend: { position: "none" },
        };
    }


});
