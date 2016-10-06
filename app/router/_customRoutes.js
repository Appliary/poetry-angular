app.provider('$customRoutesProvider', function ($stateProvider) {
    this.$get = function() {
        return { 
            addState: function(name, state) { 
                $stateProvider.state(name, state);
            }
        }
    }
});