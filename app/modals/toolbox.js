app.controller( 'modals/toolbox', function ( $scope, $http, $window, $location ) {

    // Instantiate new object
    $scope.item = {};
    $scope.fields = $scope.__config.fields;

    var api = $scope.__config.api || $scope.$root.__module.api,
        method = $scope.__config.method || 'post';

    // Get validation
    $http[method]( '/__joi' + api )
        .then( function success( response ) {
            if(!response.data.payload._inner)
                return $scope.__joi = response.data.payload;

            $scope.__joi = {};
            response.data.payload._inner.children.forEach( function(elem){
                $scope.__joi[elem.key] = elem.schema;
            } )
        }, function error( err ) {} );

    $scope.cancel = function cancel (){
        $window.location.replace( $location.absUrl() );
    }

    $scope.save = function save(){
        $http[method]( api, $scope.item )
            .then( function success( response ) {

                $window.location.replace( $location.absUrl() );

            }, function error( response ) {

                console.warn( 'add failed', response );
                $scope.item.__failed = response.data.message;

            } );
    }

} );
