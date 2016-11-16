app.controller('imageCtrl',function($scope,ngDialog,DevicesData,$http,$q){

  console.log("image controller loaded");
  $scope.loading=false;
  if(!$scope.widget)
    $scope.widget={};
  $scope.widget.type="image";
  $scope.widget.forceReload=false;
  $scope.widget.isImage=true;
  $scope.loadingImagePath = false;
  if(!$scope.widget.chartObject)
    $scope.widget.chartObject={};

  $scope.widget.chartObject.type="Image";
  $scope.image = {};
  if($scope.widget.url){
    $scope.image.url = $scope.widget.url;
  }

  console.log("widget in imagectrl", $scope.widget);

  $scope.clickToOpen = function() {
    console.log("click to open");
        ngDialog.openConfirm({
            template: 'dashboard/modalWidget.pug',
            className: 'ngdialog-theme-default',
            scope:$scope,
            width:'800px'
        })
      .then( function (res) {
          if(res.file){
              upload(res.file);
          }
      });

  };
  $scope.setCurrentImage=function(index){
    $scope.widget.currentImage=index;
    $scope.widget.url=$scope.widget.imagesPath[index].url;
    console.log(" ---------- image url ---------------- ", $scope.widget.url);
  }
  function upload(file){
    
      $scope.widget.url=file;

    console.log("upload file");
  }
  function getImages(){
    console.log("getImages");
    var defer=$q.defer();
    /*$http.get(window.serverUrl+'/api/upload/getimages').then(function(res){
      defer.resolve(res);
    });*/
    return defer.promise;
  }
  $scope.loadData=function(){
    // getImages().then(function(res){
    //   $scope.widget.imagesPath=res.data;
    //   var url='';
    //   if($scope.widget.currentImage)
    //     url=res.data[$scope.widget.currentImage].url;
    //   else
    //     url=res.data[1].url

    //   $scope.widget.url=res.data[$scope.widget.currentImage].url;
    // });
    // $scope.widget.forceReload===false;
  };
  // $scope.$watch('widget.forceReload',function(){
  //   if($scope.widget.forceReload===true)
  //     $scope.loadData();
  // });
  // $scope.loadData();

  $scope.updateImage = function(){
    $scope.widget.url = $scope.image.url;
    console.log("----update image----", $scope.widget.url);
  };

});
