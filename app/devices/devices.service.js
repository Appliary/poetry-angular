app.factory( 'deviceService',
    function deviceService(
        $http,
        $q,
        $rootScope
    ) {

        var factory = {

            getAllDevices: getAllDevices,
            addNewDevice: addNewDevice,
            transformDataFormToApi: transformDataFormToApi,
            updateDevice: updateDevice,
            getDeviceMeasurements: getDeviceMeasurements,

            getDevicesPositions: getDevicesPositions,
            getDevicePositions: getDevicePositions

        };
        return factory;

        function getDevicePositions( idDevice ) {
            var defer = $q.defer();
            $http.get( '/api/devices/' + idDevice + '/positions' )
                .then( function ( response ) {
                    defer.resolve( response.data );
                } )
                .catch( function ( error ) {
                    defer.reject( error );
                } );
            return defer.promise;
        }


        function getAllDevices() {

            var defer = $q.defer();
            $http.get( '/api/devices' )
                .then( function ( response ) {
                    defer.resolve( response.data );
                } )
                .catch( function ( error ) {
                    defer.reject( error );
                } );

            return defer.promise;
        }


        function addNewDevice( body ) {
            var defer = $q.defer();
            $http.post( '/api/devices', body )
                .then( function ( response ) {
                    defer.resolve( response );
                } )
                .catch( function ( error ) {
                    defer.reject( error );
                } );
            return defer.promise;
        }

        function transformDataFormToApi( body ) {
            var d = new Date();
            var timestamp = d.getTime();

            var newDevice = {
                timestamp: timestamp,
                createdAt: timestamp,
                team: $rootScope.session.team,
                _id: setEmptyDataToUndefined( body.id ),
                status: setEmptyDataToUndefined( body.status ),
                type: setEmptyDataToUndefined( body.type ),

                datalogger: setEmptyDataToUndefined( body.datalogger ),
                name: setEmptyDataToUndefined( body.name ),
                model: setEmptyDataToUndefined( body.model ),
                brand: setEmptyDataToUndefined( body.brand ),
                notes: setEmptyDataToUndefined( body.notes ),
                timeout: setEmptyDataToUndefined( body.timeout )
            };


            /**
             * Need to set to undefined empty input, because the DB refuse to accept an empty string
             */
            function setEmptyDataToUndefined( data ) {
                if ( data === "" ) data = undefined;
                return data;
            }

            return newDevice;
        }

        function updateDevice( idDevice, data ) {
            var defer = $q.defer();
            $http.put( '/api/devices/' + idDevice, data )
                .then( function ( response ) {
                    defer.resolve( response.data );
                } )
                .catch( function ( error ) {
                    defer.reject( error );
                } );
            return defer.promise;
        }

        function getDeviceMeasurements( idDevice ) {
            var defer = $q.defer();
            $http.get( '/api/devices/' + idDevice + '/measurements' )
                .then( defer.resolve )
                .catch( defer.reject );
            return defer.promise;
        }

        function getDevicesPositions( params ) {
            var defer = $q.defer();

            var string = "?";
            for ( var i in params ) {
                string += i;
                string += "=";
                string += params[ i ];
                string += "&";
            }
            string = string.substr( 0, string.length - 1 );

            $http.get( '/api/devices/positions' + string )
                .then( defer.resolve )
                .catch( defer.reject );
            return defer.promise;
        }

    } );
