app.service('fileUpload', ['$http','$q', function ($http,$q) {
    this.uploadFileToUrl = function(file){
      var defer=$q.defer();
      console.log('file',file);
        var fd = new FormData();
        fd.append('file', file);
        $http.post(window.serverUrl + '/api/upload', fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .then(function(res){
          defer.resolve(res.data);
        })
        return defer.promise;
    }
}]);
