app.directive( 'arrayInput', function arrayInput() {
    return {
        templateUrl: 'generic/arrayInput/arrayInput.pug',
        //transclude: true,
        scope: {
            'array': "=",
            'autocomplete': '&'
        },
        controller: function arrayInputCtrl( $scope ) {

            var isLoading = true;

            $scope.tags = [];
            $scope.$watchCollection( 'tags', function watchTags( n, o ) {
                if ( isLoading || !o || o == n )
                    if ( !n.length ) return;

                $scope.array = $scope.tags.map( function mapTag( tag ) {
                    return tag.text;
                } );
            } );

            $scope.$watchCollection( 'array', function watchModel( n, o ) {

                if ( !n || !n.map ) return;

                isLoading = true;

                $scope.tags = n.map( function mapTags( model ) {
                    if ( model.text ) model = model.text;

                    // Not a collection, send raw
                    if ( !~model.indexOf( ':' ) ) return {
                        text: model,
                        collection: '',
                        color: 'transparent'
                    };

                    var collection = model.split( ':' )[ 0 ];
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
                    color += parseInt( hash.slice( 0, 2 ), 16 ) + ',';
                    color += parseInt( hash.slice( 2, 4 ), 16 ) + ',';
                    color += parseInt( hash.slice( 4, 6 ), 16 ) + ',';
                    color += '0.3)';

                    return {
                        text: model,
                        collection: 'arrayItem-' + collection,
                        color: color || 'transparent'
                    };
                } );

                isLoading = false;
            } );

        }
    };
} );
