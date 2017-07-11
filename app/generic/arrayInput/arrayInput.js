app.directive( 'arrayInput', function arrayInput() {
    return {
        templateUrl: 'generic/arrayInput/arrayInput.pug',
        //transclude: true,
        scope: {
            'array': "=",
            'autocomplete': '&'
        },
        controller: function arrayInputCtrl( $scope, $http ) {

            var isLoading = true;

            $scope.tags = [];
            $scope.$watchCollection( 'tags', function watchTags( n, o ) {
                if ( isLoading || !o || o == n )
                    if ( !n.length ) return;

                $scope.array = $scope.tags.map( function mapTag( tag ) {
                    return tag.text;
                } );
            } );

            $scope.loadTags = function(query){
              return $http.get('/api/tags/' + query);
            }

            $scope.$watchCollection( 'array', function watchModel( n, o ) {

                if ( !n || !n.map ) return;

                isLoading = true;

                async.map( n, function mapTags( model, cb ) {
                    if ( model.text ) return cb( null, model );

                    // Not a collection, send raw
                    if ( !~model.indexOf( ':' ) ) return cb( null, {
                        text: model,
                        collection: '',
                        color: 'transparent'
                    } );

                    var collection = model.split( ':' )[ 0 ];
                    var ObjID = model.split( ':' )[ 1 ];
                    var hash = 0;
                    for ( i = 0; i < collection.length; i++ ) {
                        chr = collection.charCodeAt( i );
                        hash = ( ( hash << 4 ) - hash ) + chr;
                        hash |= 0;
                    }
                    hash = hash.toString( 16 );
                    while ( hash.length < 6 ) {
                        hash = '0' + hash;
                    }

                    var color = 'rgba(';
                    var c = parseInt( hash.slice( 0, 2 ), 16 );
                    if ( c < 0 ) c = 0 - c;
                    color += c + ',';
                    c = parseInt( hash.slice( 2, 4 ), 16 );
                    if ( c < 0 ) c = 0 - c;
                    color += c + ',';
                    c = parseInt( hash.slice( 4, 6 ), 16 );
                    if ( c < 0 ) c = 0 - c;
                    color += c + ',';
                    color += '0.3)';

                    $http.get( '/api/' + collection + '/' + ObjID )
                        .then( function success( obj ) {

                            var ret = {
                                text: model,
                                collection: 'arrayItem-' + collection,
                                color: color
                            };

                            if ( obj && obj.data && obj.data.name )
                                ret.name = obj.data.name;

                            return cb( null, ret );

                        }, function fail() {
                            return cb( null, {
                                text: model,
                                collection: 'arrayItem-' + collection,
                                color: color || 'transparent'
                            } );
                        } );



                }, function success( err, tags ) {
                    if ( err ) console.error( err );
                    $scope.tags = tags;
                    isLoading = false;
                } );

            } );

        }
    };
} );
