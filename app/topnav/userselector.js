app.component( 'appUserselector', {
    templateUrl: 'topnav/userselector.pug',
    controller: function ( $scope, $http, $location, ngDialog ) {

        $scope.userName = "";

        $scope.editprofile = function () {
            return ngDialog.open( {
                templateUrl: 'modals/editprofile.pug',
                controller: 'modals/editprofile',
                showClose: true,
                className: 'editprofile'
            } );
        }

        $scope.$root.$watch( 'loaded', function () {
            if ( $scope.$root.loaded )
                $scope.userName = $scope.$root.user.email;
        } );
    }
} );
