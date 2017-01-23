var i18n_registry = {},
    pot = function pot() {
        var out = '# ' + Date.now() + '\nmsgid ""\nmsgstr ""\n\n';
        pot.active = true;
        pot.registry.forEach( function ( k ) {
            out += '#. ' + k.split( ":" )[ 0 ] + '\n';
            out += 'msgid "' + k + '"\n';
            out += 'msgstr "' + k.split( ":" )[ 0 ] + '"\n\n';
        } );
        window.location.replace(
            'data:application/octet-stream,' + encodeURIComponent( out )
        );
    };

pot.registry = [];
pot.active = false;
pot.activate = function () {
    pot.active = true
};

app.filter( 'translate', function () {

    var translate = function translate( key ) {

        if ( !key ) return undefined;

        var k = key;
        do {
            if ( !~pot.registry.indexOf( k ) )
                pot.registry.push( k );
            k = k.split( ':' )
                .slice( 0, -1 )
                .join( ':' );
        } while ( ~k.indexOf( ':' ) );

        if ( pot.active ) return key;

        if ( i18n_registry[ key ] !== undefined )
            return i18n_registry[ key ];

        if ( !~key.indexOf( ':' ) ) return key;

        key = key.split( ':' )
            .slice( 0, -1 )
            .join( ':' );

        return translate( key );

    }
    translate.$stateful = true;

    return translate;
} );
