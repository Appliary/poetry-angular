const Poetry = require( 'poetry' ),
    sass = require( 'node-sass' ),
    fs = require( 'fs' ),
    config = require( '../config' ),
    concat = require( 'concatenate' );

// Get dependencies
var dependencies = [];
config.dependencies.forEach( ( dep ) => {

    if ( dep.indexOf( '.css' ) != dep.length - 4 ) return;

    try {
        let file = require.resolve( dep );

        if( !file )
            return Poetry.log.warn( 'Unable to solve JS depencency', dep );

        dependencies.push( file );
    } catch ( err ) {
        Poetry.log.error( 'Unable to solve CSS depencency', dep );
    }

} );

// Serve styles
Poetry.route( {

    method: 'GET',
    path: '/' + config.app.name + '/__styles.css'

}, ( request, reply ) => {

    concat( dependencies, ( err, res ) => {

        if ( dependencies.length && err ) return reply( 'body *{display:none} body::before{display:block;position:absolute;top:0;left:0;bottom:0;right:0;background:#A45;color:white;font-family:courrier;padding:20px;content:\'Dependency ' + err.toString() +'\';}' )
            .type( 'text/css' );

        sass.render( {
            file: __dirname + '/../styles/index.scss'
        }, ( err, result ) => {

            if ( err ) {
                Poetry.log.error( 'SASS', err );
                return reply( 'body *{display:none} body::before{display:block;position:absolute;top:0;left:0;bottom:0;right:0;background:#A45;color:white;font-family:courrier;padding:20px;content:\'' + err.message + ' at ' + err.file + ':' + err.line + '\';}' )
                    .type( 'text/css' );
            }

            reply( res + result.css )
                .type( 'text/css' );

        } );

    } );

} );

// Themes
Poetry.route( {
    method: 'GET',
    path: '/' + config.app.name + '/__themes/default.css'
}, ( request, reply ) => {
    concat( dependencies, ( err, res ) => {
        sass.render( {
            file: __dirname + '/../styles/metronic/layouts/layout/themes/default.scss'
        }, ( err, result ) => {
            if ( err ) {
                Poetry.log.error( 'SASS', err );
                return reply( 'body *{display:none} body::before{display:block;position:absolute;top:0;left:0;bottom:0;right:0;background:#A45;color:white;font-family:courrier;padding:20px;content:\'' + err.message + ' at ' + err.file + ':' + err.line + '\';}' )
                    .type( 'text/css' );
            }
            reply( res + result.css )
                .type( 'text/css' );
        } );
    } );
} );

Poetry.route( {
    method: 'GET',
    path: '/' + config.app.name + '/__themes/blue.css'
}, ( request, reply ) => {
    concat( dependencies, ( err, res ) => {
        sass.render( {
            file: __dirname + '/../styles/metronic/layouts/layout/themes/blue.scss'
        }, ( err, result ) => {
            reply( res + result.css )
                .type( 'text/css' );
        } );
    } );
} );

Poetry.route( {
    method: 'GET',
    path: '/' + config.app.name + '/__themes/grey.css'
}, ( request, reply ) => {
    concat( dependencies, ( err, res ) => {
        sass.render( {
            file: __dirname + '/../styles/metronic/layouts/layout/themes/grey.scss'
        }, ( err, result ) => {
            reply( res + result.css )
                .type( 'text/css' );
        } );
    } );
} );

Poetry.route( {
    method: 'GET',
    path: '/' + config.app.name + '/__themes/darkblue.css'
}, ( request, reply ) => {
    concat( dependencies, ( err, res ) => {
        sass.render( {
            file: __dirname + '/../styles/metronic/layouts/layout/themes/darkblue.scss'
        }, ( err, result ) => {
            reply( res + result.css )
                .type( 'text/css' );
        } );
    } );
} );

Poetry.route( {
    method: 'GET',
    path: '/' + config.app.name + '/__themes/light.css'
}, ( request, reply ) => {
    concat( dependencies, ( err, res ) => {
        sass.render( {
            file: __dirname + '/../styles/metronic/layouts/layout/themes/light.scss'
        }, ( err, result ) => {
            reply( res + result.css )
                .type( 'text/css' );
        } );
    } );
} );

Poetry.route( {
    method: 'GET',
    path: '/' + config.app.name + '/__themes/light2.css'
}, ( request, reply ) => {
    concat( dependencies, ( err, res ) => {
        sass.render( {
            file: __dirname + '/../styles/metronic/layouts/layout/themes/light2.scss'
        }, ( err, result ) => {
            reply( res + result.css )
                .type( 'text/css' );
        } );
    } );
} );
