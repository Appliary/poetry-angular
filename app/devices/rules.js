app.controller( 'devices/rules', function ( $scope, $http ) {

    function getRules(){
        $http.get( $scope.$root.__module.api + '/' + $scope.__id + '/rules')
            .then( function success( response ) {

                $scope.rules = response.data.data;

            } );
    }

    $scope.$watch('__id', getRules);

} );
