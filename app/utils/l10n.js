app.filter( 'localize', function ( $filter ) {

    function localize( input ) {

        if ( input === undefined ) return undefined;
        if ( input === false ) return $filter( 'translate' )( 'false:value' );
        if ( input === true ) return $filter( 'translate' )( 'true:value' );

        if ( isFinite( input ) ) {
            input = parseFloat( input );
            if ( input > 0xe8d4a51000 && input < 0x82f79cd9000 )
                return _date( input );
            return _number( input );
        }

        if ( _date( input ) != "Invalid Date" ) return _date( input );

        if ( typeof input == 'object' ) {
            if ( input.name ) return input.name;
            if ( input.id ) return input.id;
            if ( input._id ) return input._id;

            var output = '';
            Object.keys( input )
                .forEach( function ( key ) {
                    output += $filter('translate')( key + ':subvalue' );
                    output += ': ' + localize( input[ key ] ) + '\n';
                } );
            return output;
        }

        return input;

    };

    function _date( input ) {
        input = new Date( input );
        return input.toLocaleString( i18n_registry[ 'lang' ] );
    }

    function _number( input ) {
        return input.toLocaleString( i18n_registry[ 'lang' ] );
    }

    return localize;

} );
