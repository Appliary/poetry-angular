app.component( 'appUserselector', {
    templateUrl: 'topnav/userselector.pug',
    controller: function ( $scope, $http, $location, ngDialog ) {

        $scope.editprofile = function ( ) {
            return ngDialog.open( {
	            templateUrl: 'modals/editprofile.pug',
	            controller: 'modals/editprofile',
	            showClose: false,
	            className: 'editprofile'
        	} );
        }
    }
} );
