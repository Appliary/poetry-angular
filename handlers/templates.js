const Poetry = require( 'poetry' ),
    Pug = require( 'pug' ),
    glob = require( 'glob' ),
    config = require( '../config' );

let cache;

// Serve templates
Poetry.route( {
    method: 'GET',
    path: '/' + config.app.name + '/__templates.js'
}, ( request, reply ) => {

    if ( cache ) return reply( cache );
    Poetry.log.info( 'Rendering templates' );

    glob( __dirname + '/../app/**/*.pug', ( err, files ) => {
        glob( process.cwd() + '/app/**/*.pug', ( err, files2 ) => {

            files = files.map( file => ( {
                file: file,
                name: file.slice( __dirname.length - 4 )
            } ) )
            files2 = files2.map( file => ( {
                file: file,
                name: file.slice( process.cwd().length + 5 )
            } ) )
            files = files.concat( files2 );

            let r = 'app.run( function($templateCache){';
            files.forEach( ( file ) => {

                if ( file.name == 'index.pug' ) return;

                try {
                    Poetry.log.silly( 'Rendering :', file.name );
                    let tmpl = Pug.renderFile( file.file );
                    r += `$templateCache.put('${file.name}','`;
                    r += tmpl.replace( /\'/g, '\\\'' )
                        .replace( /\n/g, '\\n' );
                    r += `');`;
                } catch ( err ) {
                    Poetry.log.error( err );
                    return reply( err );
                }

            } );
            r += '} )';
            reply( r )
                .type( 'script/javascript' );

            if ( process.env.node_env == 'prod' ||
                process.env.NODE_ENV == 'prod' ||
                process.env.node_env == 'production' ||
                process.env.NODE_ENV == 'production' ) {
                cache = r;
                Poetry.log.verbose( 'Templates are now cached' );
            }

        } );
    } );
} );
