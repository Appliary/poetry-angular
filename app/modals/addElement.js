app.controller( 'modals/addElement', function ( $scope, $http, $window, $location ) {

    $scope.failedChangepwd = false;
    $scope.failChangepwdMsg = "";
    $scope.module = $scope.$root.__module;
    $scope.item = {};

    $scope.cancel = function cancel (){
        $window.location.replace( $location.absUrl() );
    }

    console.log("tabs config", $scope.module.config);

    $scope.add = function add(){
        console.log("add elem : ", $scope.item);
        $http.post( $scope.module.api, $scope.item )
            .then( function success( response ) {

                console.info( 'add success', response );
                $window.location.replace( $location.absUrl() );

            }, function error( response ) {

                console.warn( 'add failed', response );
                $window.location.replace( $location.absUrl() );

            } );
    }

    $scope.isArray = function isArray(elem){
        return angular.isArray(elem);
    }

} );