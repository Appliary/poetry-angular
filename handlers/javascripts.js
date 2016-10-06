const Poetry = require( 'poetry' ),
    config = require( '../config' ),
    concat = require( 'concatenate' );

// Get dependencies
var dependencies = [];
config.dependencies.forEach( ( dep ) => {

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

    concat( dependencies, ( err, res ) => {

        if ( !err ) return reply( res );

        Poetry.log.error( 'Dependency', err );
        reply( err );

    } );

} );

Poetry.route( {
    method: 'GET',
    path: '/' + config.app.name + '/__core.js'
}, ( request, reply ) => {
    concat( [
        __dirname + '/../app/index.js',
        __dirname + '/../app/*/**/*.js'
    ], ( err, res ) => {

        if ( !err )
            return reply( res )
                .type( 'script/javascript' );

        Poetry.log.error( 'CoreJS', err );
        reply( err );

    } );
} );

Poetry.route( {
    method: 'GET',
    path: '/' + config.app.name + '/__app.js'
}, ( request, reply ) => {
    concat( [
        './app/**/*.js'
    ], ( err, res ) => {

        if ( err && ~err.toString()
            .indexOf( '"undefined"' ) )
            return reply( 'console.info("No app JS to load")' )
                .type( 'script/javascript' )

        if ( !err )
            return reply( res )
                .type( 'script/javascript' );

        Poetry.log.error( 'App JS', err );
        reply( err );

    } );
} );

Poetry.route( {
    method: 'GET',
    path: '/' + config.app.name + '/__sidebar.json'
}, ( request, reply ) => {
    reply.file( './config/sidebar.json' );
} );

Poetry.route( {
    method: 'GET',
    path: '/' + config.app.name + '/__routes.json'
}, ( request, reply ) => {
    reply.file( './config/routes.json' );
} );
