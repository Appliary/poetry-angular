app.controller( 'devices/history', function ( $scope, $http ) {

    var before = Date.now();
    var after = Date.now() - 48*60*60*1000; // 2 days ago
    function getHistory(){
        // $http.get( $scope.$root.__module.api + '/' + $scope.__id + '/measurements?before=' + before + '&after=' + after)
        $http.get( $scope.$root.__module.api + '/' + $scope.__id + '/measurements')
            .then( function success( response ) {

                $scope.measurements = response.data.data;

            } );
    }

    $scope.$watch('__id', getHistory);

} );
