app.provider('$customRoutesProvider', function ($stateProvider) {
    this.$get = function() {
        var _initialLoadDone = false;

        return { 
            addState: function(name, state) { 
                $stateProvider.state(name, state);
            },
            getProvider: function () {
                return $stateProvider;
            },
            checkInitialState: function () {
                if (!_initialLoadDone) {
                    angular.injector().get('$state').get().forEach( function (state) {
                    var match = $stateProvider.url.exec(url);
                    if (match) {
                        _initialLoadDone = true;
                        return { state: state, stateParams: match };
                    }})
                } else {
                    return null;
                }
            }

            //$state.transitionTo($state.current, $stateParams, { reload: true, inherit: true, notify: true });
        }
    }
});