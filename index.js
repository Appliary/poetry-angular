'use strict';

const Poetry = require( 'poetry' ),
    fs = require( 'fs' ),
    config = require( './config' ),
    angular = require('./handlers/angular');


Poetry.route( {

    method: 'GET',
    path: '/' + config.app.name + '/{file*}',
    config: {
        description: 'Get the application',
        tags: ['front-end', 'application', 'angular'],
        cors: false
    }

}, ( request, reply ) => {

    fs.readFile( './assets/' + request.params.file, ( err, file ) => {

        if( !err )
            return reply( file );

        return reply( angular() );

    } );

} );

require( './handlers/javascripts' );
require( './handlers/templates' );
require( './handlers/styles' );
require( './handlers/devProxy' );
require( './register' );
