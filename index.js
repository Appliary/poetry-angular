'use strict';
var mime = require('mime-types');

const Poetry = require( 'poetry' ),
    fs = require( 'fs' ),
    config = require( './config' ),
    angular = require( './handlers/angular' );


Poetry.route( {

    method: 'GET',
    path: '/' + config.app.name + '/{file*}',
    config: {
        description: config.app.name,
        tags: [ 'Applications (front-end)' ],
        cors: false
    }

}, ( request, reply ) => {
    console.log(request.params.file);
    fs.readFile( './assets/' + request.params.file, ( err, file ) => {
        console.log(err, file);
        if ( !err )
            return reply( file ).type(mime.lookup(request.params.file));

        if ( request.params.file && request.params.file.length > 4 &&
            (
                request.params.file.indexOf( '.pug' ) == request.params.file.length - 4 || request.params.file.indexOf( '.js' ) == request.params.file.length - 3
            ) ) return reply()
            .code( 404 );

        return reply( angular() );

    } );

} );

require( './handlers/javascripts' );
require( './handlers/templates' );
require( './handlers/styles' );
require( './handlers/devProxy' );
require( './register' );
