app.controller('videoCtrl',function($scope,ngDialog,DevicesData, $sce){
  $scope.loading=false;
  if(!$scope.widget){
    $scope.widget={};
  }
  $scope.video = {};
  $scope.widget.type='video';
  $scope.widget.isVideo=true;
  if($scope.widget.url){
    $scope.video.url = $scope.widget.url;
  }

  $scope.clickToOpen = function() {
  ngDialog.openConfirm({
          template: 'dashboard/modalWidget.pug',
          className: 'ngdialog-theme-default',
          scope:$scope
      })
      .then( function (res) {
      });
  };

  $scope.apply = function(){
    $scope.widget.url = $scope.video.url;
    $scope.confirm({'newWidget': $scope.widget,'title': $scope.$parent.$parent.widget.title});
  };

  $scope.trustUrl = function(url){
      return $sce.trustAsResourceUrl(url);
  };
});
