app.directive('uploader',function(ngDialog, $http, Upload, $filter) {
          return {
              restrict: 'EA',
              scope: {
                logo: "=file",
                path: "@path"
              },
              templateUrl: "generic/uploader/uploader.pug",
              link: function(scope,element,attrs){

                scope.newLogo = null;

                scope.$watch('newLogo', function(nv){
                  if(nv && typeof nv === 'object'){
                    ngDialog.openConfirm({
                      templateUrl:'modals/confirmationUpload.pug',
                      className: 'ngdialog-theme-default'
                    }).then(
                      function(){
                        Upload.upload({url: "/api/files"+(scope.path ? "/"+ scope.path : ""), file: nv}).then(
                          function (resp) {
                            console.log(resp);
                            scope.logo=resp.data.filename;
                          },
                          function (resp) {
                            console.error(resp);
                          },
                          function (evt) {
                            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                            console.log('progress: ' + progressPercentage + '% ');
                          });
                      },
                      function(){

                      }
                    );
                  }
                });

                scope.isString = isString;
                function isString(a){
                  return angular.isString(a);
                }

                scope.getLogo = function(a){
                  if(!isString(a))
                      return a;

                  if(a.indexOf('/api/files') == 0)
                    return a;

                  return '/api/files/'+a;
                }
              }
          };
      });
