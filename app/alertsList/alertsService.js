app.factory("AlertsService", function(){

  var paramsListeners = [];

  function observeParams(fn){
    paramsListeners.push(fn);
    console.log("paramsListeners", paramsListeners);
  }

  function sendParams( params ){
    paramsListeners.forEach(function(fn){
      fn(params, true);
    });
  }


  return {
    observeParams: observeParams,
    sendParams: sendParams
  };

});
