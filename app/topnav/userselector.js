app.component( 'appUserselector', {
    templateUrl: 'topnav/userselector.pug',
    controller: function ( $scope, $http, $location, ngDialog , $timeout) {

        $scope.userName = "";
        if($scope.$root.user){
            $scope.userName = $scope.$root.user.email;
        }
        else{
            $timeout(function(){
                if($scope.$root.user){
                    $scope.userName = $scope.$root.user.email;
                    console.log('userselector username', $scope.userName);
                }
                else{
                    console.warn('No current user loaded !');
                }
            }, 2000);
        }
        

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
