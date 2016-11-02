app.controller('videoCtrl',function($scope,ngDialog,DevicesData){
  $scope.loading=false;
  if(!$scope.widget){
    $scope.widget={};
  }
  $scope.widget.type='video';
  $scope.widget.isVideo=true;
  if(!$scope.widget.chartObject)
    $scope.widget.chartObject={};
  $scope.widget.chartObject.type="Video";
  $scope.clickToOpen = function() {
  ngDialog.openConfirm({
          template: 'dashboard/modalWidget.pug',
          className: 'ngdialog-theme-default',
          scope:$scope,
          width:'800px'
      })
      .then( function () {

      });
  };
});
