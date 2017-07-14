app.directive( 'tagsViewer', function arrayInput() {
    return {
        templateUrl: 'generic/arrayInput/tagsViewer.pug',
        scope: {
            'array': "=",
            'selectedTag': "=?"
        },
        controller: function arrayInputCtrl( $scope, $http ) {

            if ( $scope.array && !angular.isArray( $scope.array ) )
                $scope.array = [ $scope.array ];

            $scope.$watchCollection( 'array', function watchModel( n, o ) {

                if ( !n || !n.map ) return;

                isLoading = true;

                async.map( n, function mapTags( model, cb ) {
                    if ( model.text ) return cb( null, model );

                    // object with kind and id
                    if(angular.isObject(model) && angular.isString(model.id) && angular.isString(model.kind)){
                        return cb( null, {
                          text: model.kind + ':' + model.id,
                          collection: 'arrayItem-' + model.kind,
                          color: getCollectionColor(model.kind),
                          name: model.name
                        });
                    }

                    // Not a collection, send raw
                    if ( !~model.indexOf( ':' ) ) return cb( null, {
                        text: model,
                        collection: '',
                        color: 'transparent'
                    } );

                    var collection = model.split( ':' )[ 0 ];
                    var ObjID = model.split( ':' )[ 1 ];

                    var color = getCollectionColor(collection);

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


            function getCollectionColor(collection){
              var hash = 0;
              for ( i = 0; i < collection.length; i++ ) {
                  hash = ( ( hash << 4 ) - hash ) + collection.charCodeAt( i );
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

              return color;
            }

        }
    };
} );
