const Poetry = require( 'poetry' ),
    FS = require( 'fs' ),
    config = require( '../config' ),
    concat = require( 'concatenate' );

let cache = {};

// Get dependencies
var dependencies = [];
config.dependencies.forEach( dep => {

    if ( dep.indexOf( '.js' ) != dep.length - 3 ) return;

    try {
        let file = require.resolve( dep );
        if ( !file )
            return Poetry.log.warn( 'Unable to solve JS depencency', dep );
        dependencies.push( file );
    } catch ( err ) {
        Poetry.log.error( 'Unable to solve JS depencency', dep );
    }

} );


// Serve dependencies
Poetry.route( {
    method: 'GET',
    path: '/' + config.app.name + '/__dependencies.js'
}, ( request, reply ) => {

    if ( !dependencies ) return reply();
    if ( cache.dependencies ) return reply( cache.dependencies );

    concat( dependencies, ( err, res ) => {

        if ( !err ) {
            cache.dependencies = res;
            return reply( res );
        }

        Poetry.log.error( 'Dependency', err );
        reply( err );

    } );

} );

Poetry.route( {
    method: 'GET',
    path: '/' + config.app.name + '/__core.js'
}, ( request, reply ) => {

    if ( cache.core ) return reply( cache.core );

    concat( [
        __dirname + '/../app/index.js',
        __dirname + '/../app/*/**/*.js'
    ], ( err, res ) => {

        if ( !err ) {
            cache.core = res;
            return reply( res )
                .type( 'script/javascript' );
        }

        Poetry.log.error( 'CoreJS', err );
        reply( err );

    } );
} );

Poetry.route( {
    method: 'GET',
    path: '/' + config.app.name + '/__app.js'
}, ( request, reply ) => {

    //if ( cache.app ) return reply( cache.app );

    concat( [
        './app/**/*.js'
    ], ( err, res ) => {

        if ( err && ~err.toString()
            .indexOf( '"undefined"' ) )
            return reply( 'console.info("No app JS to load")' )
                .type( 'script/javascript' );

        if ( !err ) {
            cache.app = res;
            return reply( res )
                .type( 'script/javascript' );
        }

        Poetry.log.error( 'App JS', err );
        reply( err );

    } );
} );

Poetry.route( {
    method: 'GET',
    path: '/' + config.app.name + '/__sidebar.json'
}, ( request, reply ) => {

    const modulesPath = 'config/modules';

    FS.readdir( modulesPath, ( err, files ) => {

        // Old way
        if ( err ) {
            Poetry.log.warn( 'DEPRECATED : `config/sidebar.json`\nPlease use the `config/modules` folder' );
            return reply.file( './config/sidebar.json' );
        }

        reply( files.sort( ( a, b ) => {

                let A = a.split( '.' ),
                    B = b.split( '.' );

                let Anum = parseInt( A[ 0 ] ),
                    Bnum = parseInt( B[ 0 ] );

                if ( Anum == A[ 0 ] ) A[ 0 ] = Anum;
                if ( Bnum == B[ 0 ] ) B[ 0 ] = Bnum;

                return ( A[ 0 ] > B[ 0 ] );

            } )
            .map( file => {

                let module = file.split( '.' );
                if ( module[ module.length - 1 ] != 'json' )
                    return {};

                let conf = {};
                try {
                    conf = require( `../../../${modulesPath}/${file}` );
                    if ( !conf.name )
                        conf.name = module[ module.length - 2 ].toLowerCase();
                } catch ( err ) {
                    Poetry.log.error( err );
                }

                return conf;

            } ) );

    } );

} );

Poetry.route( {
    method: 'GET',
    path: '/' + config.app.name + '/__routes.json'
}, ( request, reply ) => {
    reply.file( './config/routes.json' );
} );
