app.component( 'appSidebar', {
    templateUrl: 'sidebar/_sidebar.pug',
    controller: function ( $element, $window, $location, $scope ) {

        $scope.$root.go = $scope.go = function ( module ) {
            $location.path( module.path );
            minify();
        }

        var minify = function minify () {
            if ( $window.innerWidth >= 600 ) return;
            $scope.$root.collapseSidebar = false;
        }

    }
} );
