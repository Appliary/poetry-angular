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

  function getColumns(){
    return [
      "_id",
      "createdAt",
      "rule",
      "source",
      "level",
      "category",
      "device",
      "message",
      "acknowledgedBy",
      "acknowledgedAt",
      "notes"
    ];
  }


  return {
    getColumns: getColumns,
    observeParams: observeParams,
    sendParams: sendParams
  };

});
