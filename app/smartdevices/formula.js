app.controller( 'smartdevices/formula', function ( $scope, $http, $q, ngDialog ) {

    $scope.date = new Date();
    $scope.rebuiltMsg = "";
    $scope.rebuilt = false;

    $scope.rebuild = function(){
        ngDialog.openConfirm({
            template: 'modals/confirmation.pug',
            className: 'ngdialog-theme-default'
        })
        .then(function(){
            var startDate = new Date($scope.date);
            $scope.rebuiltMsg = "Rebuilding...";
            $scope.rebuilt = true;

            $http.get( '/api/smartdevices/' + $scope.item._id + '/rebuild?date=' + startDate)
            .then( function ( res ) {
                if ( res.status == 200 ){
                    console.log("res of rebuild", res);
                    $scope.rebuiltMsg = "Rebuild done.";
                    $scope.rebuilt = true;
                }
                else{
                    console.log("error in last-measurement", res);
                    $scope.rebuiltMsg = "Rebuild failed.";
                    $scope.rebuilt = true;
                }
            });
        });

    }

    $scope.resetMsg = function(){
        $scope.rebuiltMsg = "";
        $scope.rebuilt = false;
    }

    $scope.$watch("__id", $scope.resetMsg);

} );
