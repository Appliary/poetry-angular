app.component( 'arrayInput', {
    templateUrl: 'generic/arrayInput/arrayInput.pug',
    transclude: true,
    bindings: {
        'model': "=",
    },
    controller: function arrayInputCtrl( $scope ) {

        $scope.$watchCollection( 'model', function watchModel() {
            if ( !$scope.model || !$scope.model.map ) $scope.model = [];
            $scope.tags = $scope.model.map( function mapTags( model ) {
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
        } );

    }
} );
