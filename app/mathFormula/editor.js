app.controller( 'mathFormula/editor', function ( $scope, $http, $timeout, $q,ngDialog ) {

    $scope.inputValues = {};
    $scope.deviceValues = {};
    $scope.newInput = {};
    $scope.tagInput = {};

    $scope.setAutofill = function (autofill) {
        $scope.newInput.autofill = autofill;

        if (autofill) {
            searchGlobal( '' );
        }
    }

    $scope.checkVarName = function checkVarName(input) {

        // if ( !$scope.newInput ) $scope.newInput = {};

        var varName = input.varName;
        if ( !varName ) return true;

        if ( ~[
                'pi',
                'e',
                'sin',
                'cos',
                'min',
                'max',
                'avg',
                'sqrt',
                'log',
                'exp',
                'tau',
                'phi',
                'PI',
                'E',
                'SQRT2',
                'null',
                'undefined',
                'NaN',
                'LN2',
                'LN10',
                'LOG2E',
                'LOG10E',
                'Infinity',
                'i',
                'uninitialized',
                'version',
                'add',
                'cub',
                'divide',
                'ceil',
                'hypot',
                'floor',
                'exp',
                'fix',
                'mod',
                'round',
                'sign',
                'sqrt',
                'square',
                'substract',
                'pow',
                'norm',
                'xgcd',
                'unit',
                'to',
                'in',
                'not'
            ].indexOf( varName ) )
            return true;

        if ( !varName.match( /^[a-z_][a-z0-9_]*$/i ) )
            return true;

        var error = false;
        if ( $scope.item && $scope.item.inputs )
            $scope.item.inputs.forEach( function ( i ) {
                if ( varName == i.varName ) error = true;
            } );
        return error;

    };

    function testFormula( n ) {
        if ( !n )
            return $scope.currentOutput = '';

        var out;
        try {
            out = math.eval( $scope.item.formula, $scope.inputValues );
            $scope.currentOutputErr = false;
        } catch ( err ) {
            out = err;
            $scope.currentOutputErr = true;
        }

        $scope.currentOutput = out;

    }
    $scope.$watch( 'item.formula', testFormula );

    $scope.$watchCollection( 'item.inputs', function getCurrValues( n ) {

        if ( !n ) return;

        var devices = {};
        n.forEach( function ( i ) {
            if(i.inputType == "tags"){
                if ( !devices[ i.varName ] )
                    devices[ i.varName ] = [];
                devices[ i.varName ].push( i );
            }
            else{
                if ( !devices[ i.device ] )
                    devices[ i.device ] = [];
                devices[ i.device ].push( i );
            }
        } );
        Object.keys( devices )
            .forEach( function ( id ) {
                if(!devices[id][0].inputType)
                    devices[id][0].inputType == "devices";

                if(devices[id][0].inputType == "tags"){
                    let promises = [
                        devicesFromTags("devices", devices[id][0].device),
                        devicesFromTags("smartdevices", devices[id][0].device),
                    ];

                    $q.all(promises)
                    .then( function (values){
                        let inputValues = [];
                        let tagDevices = [].concat.apply([], values);
                        $scope.deviceValues[id] = tagDevices;
                        tagDevices.forEach(function (device){
                            if(device.last){
                                device.last.forEach( function ( measurement ) {

                                    if ( measurement.type == devices[id][0].type && measurement.id == devices[id][0].id )
                                        inputValues.push(measurement.value);

                                } );
                            }
                        });
                        $scope.inputValues[ id ] = inputValues;
                        testFormula(true);
                    });
                }
                else{
                    let collection = devices[id][0].inputType || "devices";
                    let api = '/api/' + collection + '/';
                    $http.get( api + id )
                        .then( function success( res ) {
                            var device = res.data;
                            device.last.forEach( function ( measurement ) {
                                devices[ id ].forEach( function ( value ) {

                                    if ( value.type != measurement.type || value.id != measurement.id ) return;

                                    $scope.inputValues[ value.varName ] = measurement.value;

                                    testFormula(true);
                                } );
                            } );
                        } );
                }
            } );

    } );

    function searchGlobal( n ) {

        $scope.newInput.searchResults = undefined;
        let promises = [searchDevice(n)];

        if($scope.item && $scope.item.degree == "Secondary") {
            promises.push(searchSmartdevice(n));
        }

        $q.all(promises)
        .then(function (values){
            $scope.newInput.searchResults = [].concat.apply([], values);
        });
    }

    function searchDevice( n ) {
        var deferred = $q.defer();

        $http.get( '/api/devices?limit=20&search=' + encodeURIComponent( n || '' ) )
            .then( function success( res ) {
                let devices = res.data.data || [];
                devices.forEach(function (device){
                    device.inputType = "devices";
                });
                deferred.resolve(devices);
            } );

        return deferred.promise;
    }

    $scope.loadTags = function(query) {
        var deferred = $q.defer();

        $q.all([deviceTags(query, "devices"), deviceTags(query, "smartdevices")])
        .then(function (values){
            deferred.resolve([].concat.apply([], values));
        });

        return deferred.promise;
    };

    function deviceTags( query, type ){
        var deferred = $q.defer();

        let api = '/api/' + type + '/tags/';

        $http.get( api + query)
            .then( function success( response ) {
                deferred.resolve(response.data);
            }, function error( response ) {
                $location.path( '/error/' + response.status );
            } );

        return deferred.promise;
    }


    function searchSmartdevice( n ) {
        var deferred = $q.defer();

        $http.get( '/api/smartdevices?limit=20&search=' + encodeURIComponent( n || '' ) )
            .then( function success( res ) {
                let smartdevices = res.data.data || [];
                smartdevices.forEach(function (smartdevice){
                    smartdevice.inputType = "smartdevices";
                });
                deferred.resolve(smartdevices);;
            } );

        return deferred.promise;
    }

    searchGlobal( '' );
    $scope.$watch( 'newInput.deviceSearch', searchGlobal );

    $scope.addInput = function addInput(input) {
        if(!$scope.item.inputs)
            $scope.item.inputs = [];
        if(input.tags){
            let tags = [];
            input.tags.forEach(function (tag){
                tags.push(tag.text);
            })
            $scope.item.inputs.push( {
                varName: input.varName,
                device: tags,
                type: input.type.type,
                id: input.type.id,
                inputType: "tags"
            } );
        }
        else{
            $scope.item.inputs.push( {
                varName: input.varName,
                device: input.device._id,
                type: input.device.last[ input.measurement ].type,
                id: input.device.last[ input.measurement ].id,
                inputType: input.device.inputType
            } );
        }
        $scope.newInput = {};
        $scope.tagInput = {};

    }

    $scope.$watchCollection('tagInput.tags', loadFromTags);

    function loadFromTags (){
        if($scope.tagInput.tags && $scope.tagInput.tags.length){
            let promises = [
                devicesFromTags("smartdevices", $scope.tagInput.tags),
                devicesFromTags("devices", $scope.tagInput.tags)
            ];

            $q.all(promises)
            .then(function (values){
                $scope.tagInput.searchResults = [].concat.apply([], values);
                loadTagTypes();
                $scope.tagsLoaded = true;
            })
        }
    }

    function devicesFromTags (type, tags) {
        var deferred = $q.defer();
        let tagsQuery = "?tags=";
        tags.forEach(function (tag){
            if(tag.text)
                tagsQuery += "&tags=" + tag.text;
            else
                tagsQuery += "&tags=" + tag;
        });

        let api = "/api/" + type;

        $http.get( api + tagsQuery )
            .then( function success( res ) {
                deferred.resolve(res.data.data);
            } );

        return deferred.promise;
    }

    function loadTagTypes (){
        $scope.tagTypes = [];

        $scope.tagInput.searchResults.forEach(function (device){
            if(device.last){
                device.last.forEach(function (measurement){
                    if(!containsType($scope.tagTypes, measurement.type, measurement.id)){
                        $scope.tagTypes.push({
                            type: measurement.type,
                            id: measurement.id
                        });
                    }
                })
            }
        });

    }

    function containsType(tagTypes, type, id){
        var result = false;
        for(var i = 0; i < tagTypes.length; i++) {
            if(tagTypes[i].type == type && tagTypes[i].id == id){
                result = true;
                break;
            }
        }

        return result;

    }

    $scope.showTagDevices = function showTagDevices(tags, devices, type, id) {
        return ngDialog.open( {
            templateUrl: 'modals/tagDetails.pug',
            controller: 'modals/tagDetails',
            showClose: true,
            data: {
                devices : devices,
                tags: tags,
                type: type,
                id: id
            }
        } );
    };
} );
