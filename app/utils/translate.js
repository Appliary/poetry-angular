var i18n_registry = {};

app.filter( 'translate', function () {
    function translate( key ) {

        if ( i18n_registry[ key ] !== undefined )
            return i18n_registry[ key ];

        if ( !~key.indexOf( ':' ) ) return key;

        key = key.split( ':' )
            .slice( 0, -1 )
            .join( ':' );

        return translate( key );

    }

    return translate
} );
