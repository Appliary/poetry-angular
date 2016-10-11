app.component( 'appUserselector', {
    templateUrl: 'topnav/userselector.pug',
    controller: function ( $scope, $http, $location, ngDialog , $rootScope ) {

        $scope.userName = '';
        setTimeout(function(){
            if($rootScope.session){
                $scope.userName = $rootScope.session.user;
                console.log('userselector username', $scope.userName);
            }
        }, 2000);

        $scope.editprofile = function ( ) {
            return ngDialog.open( {
	            templateUrl: 'modals/editprofile.pug',
	            controller: 'modals/editprofile',
	            showClose: true,
	            className: 'editprofile'
        	} );
        }
    }
} );
