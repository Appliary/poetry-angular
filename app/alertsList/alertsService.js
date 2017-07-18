app.factory("AlertsService", function($http){

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
      "context",
      "message",
      "acknowledgedBy",
      "acknowledgedAt",
      "notes",
      {key:"tags", type: "tags"}
    ];
  }

  function getRules(){
    return $http.get( "/api/rules" );
  }

  function getDefaults(){
    return {sorting: {col: 'createdAt', order: 'desc'}};
  }


  return {
    getDefaults: getDefaults,
    getColumns: getColumns,

    getRules: getRules,

    observeParams: observeParams,
    sendParams: sendParams
  };

});
