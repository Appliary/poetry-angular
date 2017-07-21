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

  function getDefaultAfter(){
    var r = new Date();
    r.setDate(r.getDate() -7);
    return r;
  }

  function getDefaultBefore(){
    var r = new Date();
    r.setHours(23, 59, 59, 999);
    return r;
  }


  return {
    getDefaults: getDefaults,
    getDefaultAfter: getDefaultAfter,
    getDefaultBefore: getDefaultBefore,
    getColumns: getColumns,

    getRules: getRules,

    observeParams: observeParams,
    sendParams: sendParams
  };

});
