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
            $scope.$watchCollection( 'tags', function watchModel() {
                if ( isLoading ) return;
                if ( !$scope.array || !$scope.array.push ) $scope.array = [];
                $scope.tags.forEach( function eachTag( tag ) {
                    $scope.array.push( tag.text );
                } );
            } );

            $scope.$watchCollection( 'array', function watchModel( n ) {

                if ( !n || !n.map ) return ( $scope.array = [] );

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
                        hash = ( ( hash << 3 ) - hash ) + chr;
                        hash |= 0;
                    }
                    hash = hash.toString( 16 );

                    var color = 'rgba(';
                    color += parseInt( hash.splice( 0, 2 ), 16 ) + ',';
                    color += parseInt( hash.splice( 0, 2 ), 16 ) + ',';
                    color += parseInt( hash.splice( 0, 2 ), 16 ) + ',';
                    color += ',0.3';

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
