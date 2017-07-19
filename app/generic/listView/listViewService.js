app.factory('listViewService', function() {
    var listeners = [];
    const GLOBAL_EVENT = 'GLOBAL';
    return {
      emit: function(event, args) {
        if(event && angular.isString(event)){
          listeners.forEach(function(listener) {
            if(listener.event == GLOBAL_EVENT || listener.event == event){
              listener.callback(args, event);
            }
          });
        }
        else{
          listeners.forEach(function(listener) {
            listener.callback(args, GLOBAL_EVENT);
          });
        }

      },
      register: function(callback) {
        if(!callback) return;

        if(typeof callback === 'function'){
          callback = {callback: callback};
        }

        if(!(angular.isObject(callback) && typeof callback.callback === 'function')) return;

        if(!angular.isString(callback.event)){
          callback.event = GLOBAL_EVENT;
        }

        listeners.push(callback);
      }
    };
  }
);
