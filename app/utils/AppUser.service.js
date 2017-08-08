<< << << < HEA
app.factory( "AppUserService", function ( $rootScope, $http ) {

    function isObject( o ) {
        return o && angular.isObject( o );
    }

    function __has( role, stackName, appName, moduleName ) {

        if ( !( isObject( role.permissions ) && isObject( role.permissions[ stackName ] ) ) ) return false;
        if ( !role.permissions[ stackName ][ appName ] ) return false;
        if ( !( isObject( role.permissions[ stackName ][ appName ] ) ) ) return true;

        if ( !moduleName ) return true;

        if ( role.permissions[ stackName ][ appName ][ moduleName ] ) return true;

        return false;

    }

    function has( stackName, appName, moduleName ) {
        stackName = stackName.toUpperCase();
        if ( !appName ) return true;
        if ( $rootScope.user.role === "SUPER" ) return true;
        if ( $rootScope.user.role === "*" ) {
            return __has( $rootScope.team, stackName, appName, moduleName );
        }

        return __has( $rootScope.role, stackName, appName, moduleName );
    }

    function hasApp( appName, moduleName ) {
        return has( "app", appName, moduleName );
    }

    function hasApi( appName, moduleName ) {
        return has( "api", appName, moduleName );
    }

    function getPermissions() {
        return $http.get( '/api/userGroups/permissions' );
    }

    return {
        has: has,
        hasApp: hasApp,
        hasApi: hasApi,
        getPermissions: getPermissions
    };
} );
