const Poetry = require( 'poetry' ),
    sass = require( 'node-sass' ),
    fs = require( 'fs' ),
    config = require( '../config' );

// Serve styles
Poetry.route( {

    method: 'GET',
    path: '/' + config.app.name + '/__styles.css'

}, ( request, reply ) => {

    sass.render( {
        file: __dirname + '/../styles/index.scss'
    }, ( err, result ) => {

        if ( err ) {
            Poetry.log.error( 'SASS', err );
            return reply( 'body *{display:none} body::before{display:block;position:absolute;top:0;left:0;bottom:0;right:0;background:#A45;color:white;font-family:courrier;padding:20px;content:\'' + err.message + ' at ' + err.file + ':' + err.line + '\';}' )
                .type( 'text/css' );
        }

        reply( result.css )
            .type( 'text/css' );

    } );

} );
