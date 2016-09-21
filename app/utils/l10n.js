app.filter( 'localize', function ( $filter ) {

    function localize( input ){

        if( input === undefined ) return undefined;
        if( input === false ) return $filter('translate')('false:value');
        if( input === true ) return $filter('translate')('true:value');

        if( _date( input ) != "Invalid Date" ) return _date( input );

        return input;

    };

    function _date( input ){
        input = new Date(input);
        return input.toLocaleString( i18n_registry['lang'] );
    }

    return localize;

} );
