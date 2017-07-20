app.factory("AppUserService", function($rootScope){

  function isObject(o){
    return o && angular.isObject(o);
  }

  function __has(role, stackName, appName, moduleName){
    if(!(isObject($rootScope.team.permissions) && isObject($rootScope.team.permissions[stackName]))) return false;
    if(!$rootScope.team.permissions[stackName][appName]) return false;

    if(!moduleName) return true;

    return true;
  }

  function has(stackName, appName, moduleName){
    stackName = stackName.toUpperCase();
    console.debug("$rootScope",$rootScope);
    console.debug("appName",appName);
    console.debug("moduleName",moduleName);
    if(!appName) return true;
    if($rootScope.user.role === "SUPER") return true;
    if($rootScope.user.role === "*"){
      return __has($rootScope.team, stackName, appName, moduleName);
    }

    return __has($rootScope.role, stackName, appName, moduleName);
  }

  function hasApp(appName, moduleName){
    return has("app", appName, moduleName);
  }

  function hasApi(appName, moduleName){
    return has("api", appName, moduleName);
  }

  return {
    has: has,
    hasApp: hasApp,
    hasApi: hasApi
  };
});
