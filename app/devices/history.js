app.controller( 'devices/history', function ( $scope, $http ) {

    var before = Date.now();
    var after = Date.now() - 48*60*60*1000; // 2 days ago
    var page = 0;
    function getHistory(){
        //$http.get( $scope.$root.__module.api + '/' + $scope.__id + '/measurements')
        page = 0;
        $http.get( $scope.$root.__module.api + '/' + $scope.__id + '/measurements?page=' + page + '&limit=100&sort=timestamp&order=desc')
            .then( function success( response ) {

                console.log("HISTORY");
                console.log(response);

                $scope.measurements = response.data.data;

            } );
    }

    function nextHistory(){
      page++;
      console.log("NEXT:" + page);
      $http.get( $scope.$root.__module.api + '/' + $scope.__id + '/measurements?page=' + page + '&limit=100&sort=timestamp&order=desc')
          .then( function success( response ) {

              if(angular.isArray(response.data.data)){
                response.data.data.forEach(function(m){
                  $scope.measurements.push(m);
                });
              }

          } );
    }

    $scope.scroll = function scroll( event ) {
      console.log("scroll");
        var elem = event.target;
        if ( ( elem.scrollTop + elem.offsetHeight + 0 ) > elem.scrollHeight )
            nextHistory();
    };

    $scope.$watch('__id', getHistory);

} );
