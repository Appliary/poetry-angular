app.controller('pieCtrl',function($scope,$interval){
    $scope.widget.isChart = true;

    if(!$scope.widget.chartObject){
        $scope.widget.chartObject = {};
        $scope.widget.chartObject.type = "PieChart";
        $scope.widget.isChart = true;
        
        $scope.onions = [
            {v: "Onions"},
            {v: 3},
        ];

        $scope.widget.chartObject.data = {"cols": [
            {id: "t", label: "Topping", type: "string"},
            {id: "s", label: "Slices", type: "number"}
        ], "rows": [
            {c: [
                {v: "Mushrooms"},
                {v: 3},
            ]},
            {c: $scope.onions},
            {c: [
                {v: "Olives"},
                {v: 31}
            ]},
            {c: [
                {v: "Zucchini"},
                {v: 1},
            ]},
            {c: [
                {v: "Pepperoni"},
                {v: 2},
            ]}
        ]};

        $scope.widget.chartObject.options = {
            'title': 'How Much Pizza I Ate Last Night',
            is3D: true,
        };
    }
    
    // ------------------ Functions ---------------------

    $scope.initWidgetData=function()
    {
        console.log("unutWidgetdata in widget");
        var intervalPromise=$interval($scope.loadData, 5000);
         $scope.$on('$destroy', function() {
            $interval.cancel(intervalPromise);
        });
    };
})