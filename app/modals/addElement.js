app.controller( 'modals/addElement', function ( $scope, $http, $window, $location ) {

    $scope.failedChangepwd = false;
    $scope.failChangepwdMsg = "";
    $scope.module = $scope.$root.__module;

    $scope.element = {};
    $scope.columns = [];
    $scope.module.config.columns.forEach(function(field){
        console.log("field to add", field);
        if(field != "_id" && field != "timestamp" && field != "createdAt"){
            $scope.columns.push(field);
            $scope.element[field] = "";
        }
    });


    console.log("module in addElement modal : ", $scope.module);


    $scope.cancel = function cancel (){
        $window.location.replace( $location.absUrl() );
    }

    $scope.add = function add(){
        console.log("add elem : ", $scope.element);
        $http.post( $scope.module.api, $scope.element )
            .then( function success( response ) {

                console.info( 'add success', response );
                //$window.location.replace( $location.absUrl() );

            }, function error( response ) {

                console.warn( 'add failed', response );

            } );
    }

} );
