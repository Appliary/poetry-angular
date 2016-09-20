app.controller( 'generic/list', function ( $scope, $http, $location, ngDialog ) {

    $http.get( $scope.__module.api )
        .then( function success( response ) {

            if ( response.data.data )
                $scope.data = response.data.data;
            else if ( response.data instanceof Array )
                $scope.data = response.data;
            else
                $scope.data = [];

            $scope.columns = [];
            $scope.data.forEach( function ( data ) {
                Object.keys( data )
                    .forEach( function ( col ) {
                        if ( !~$scope.columns.indexOf( col ) )
                            $scope.columns.push( col );
                    } )
            } );

        }, function error( response ) {

            if ( response.status == 401 )
                return ngDialog.open( {
                    templateUrl: 'modals/login.pug',
                    controller: 'modals/login',
                    showClose: false,
                    className: 'login'
                } );

            $location.path( '/error/' + response.status );

        } );

} );
