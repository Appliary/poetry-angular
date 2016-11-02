app.service('LocalForage',function($http,$q,ngNotify){
            var time=2000;
            var timeout;
            this.store=function(idUser,idDashboard,dashboard){

                if(timeout)
                    clearTimeout(timeout);
                
                timeout=setTimeout(function(){
                    storeDashboard(idUser,idDashboard,dashboard);
                },time);
            };
            
            function storeDashboard(idUser,idDashboard,dashboard){
                    //console.log(dashboard)
                    localforage.setItem(idUser+idDashboard, dashboard).then(function (value) {
                    Notify.success( {
                        title: 'Success',
                        message: 'Your dashboard has been saved'
                    } );
                    }).catch(function(err) {
                        Notify.danger( {
                            title: 'Error',
                            message: 'An error occured while processing your request'
                        } ); 
                    }); 
 
            }
            this.getDashboard=function(idUser,idDashboard){
                var deferred=$q.defer();
                localforage.getItem(idUser+idDashboard).then(function (value) {
                    // Do other things once the value has been saved.
                    //console.log(value);
                    deferred.resolve(value);
                }).catch(function(err) {
                    // This code runs if there were any errors
                    console.log(err);
                });
                return deferred.promise;
            };

    });
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


