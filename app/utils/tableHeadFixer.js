app.directive("tableHeadFixer", function($timeout, listViewService){
  return {
    restrict: 'A',
    transclude: false,
    scope: {
      tableHeadFixer: "=",
      thfHideScroll: "<?"
    },
    link: function(scope, elem, attrs, ctrls){
      run();

      function run(ar, ev){

        $timeout(function(){
          if(scope.tableHeadFixer
            && (angular.isUndefined(scope.tableHeadFixer.active) || scope.tableHeadFixer.active)
          ){
            var config = {
              head: false,
              left: scope.tableHeadFixer.left || 0,
              'z-index': scope.tableHeadFixer.left || 10
            };

            // call tableHeadFixer plugin
            $(elem).tableHeadFixer(config);

            // hide parent scroll
            if(scope.thfHideScroll){
              var parent = $( elem ).parent();
              if( parent ){
                parent.css( "overflow", "hidden" );
              }
            }

          }
        },999);
      }

      // register callback on event: 'tableHeadFixer:run'
      listViewService.register({
          event: 'tableHeadFixer:run',
          callback: run
      });
    }
  };
});
