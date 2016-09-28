app.controller( 'generic/list', function ( $scope, $http, $location, ngDialog ) {

    if($scope.__id) retrieveItem($scope.__id);
    $http.get( $scope.$root.__module.api )
        .then( function success( response ) {

            if ( response.data.data )
                $scope.data = response.data.data;
            else if ( response.data instanceof Array )
                $scope.data = response.data;
            else
                $scope.data = [];

            if ( $scope.$root.__module.config && $scope.$root.__module.config.columns )
                $scope.columns = $scope.$root.__module.config.columns;
            else $scope.columns = [];

            if ( !$scope.columns.length )
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

    $scope.select = function select( id ) {
        retrieveItem( id );
        $location.path(
            '/' + $scope.$root.__module.name +
            '/' + id +
            '/' + ( $scope.__view || '' )
        );
    }

    $scope.tab = function tab( name ){
        $location.path(
            '/' + $scope.$root.__module.name +
            '/' + $scope.__id +
            '/' + name
        );
    }

    $scope.scroll = function scroll( event ) {
        var elem = event.target;
        var header = elem.querySelectorAll( 'th' );
        for ( var i = 0; i < header.length; i++ ) {
            header[ i ].style.top = elem.scrollTop + 'px';
        };
    }

    $scope.isArray = angular.isArray;

    function retrieveItem( id ){
        $scope.item = undefined;
        $http.get( $scope.$root.__module.api + '/' + id )
            .then( function success( response ) {
                $scope.item = response.data
            }, function error( response ) {
                $location.path( '/error/' + response.status );
            } );
    }

} );
