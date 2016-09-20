const Poetry = require( 'poetry' ),
    config = require( '../config' );

Server = Poetry.hapiServer;

Server.register( {
    register: require( 'h2o2' )
}, ( err ) => {

    if ( err ) throw err;

    Server.route( {
        method: '*',
        path: '/{p*}',
        config: {
            payload: {
                parse: false
            }
        },
        handler( request, reply ) {

            reply.proxy( {
                host: config.app.remote,
                port: 80,
                protocol: 'http',
                passThrough: true,
                localStatePassThrough: true
            } );

        }
    } );

} );
