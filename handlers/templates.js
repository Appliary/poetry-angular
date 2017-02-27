const Poetry = require( 'poetry' ),
    Pug = require( 'pug' ),
    glob = require( 'glob' ),
    config = require( '../config' ),
    fs = require( 'fs' );

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
            glob( process.cwd() + '/app/**/*.html', ( err, files3 ) => {

                files = files.map( file => ( {
                    file: file,
                    pug: true,
                    name: file.slice( __dirname.length - 4 )
                } ) );
                files2 = files2.map( file => ( {
                    file: file,
                    pug: true,
                    name: file.slice( process.cwd()
                        .length + 5 )
                } ) );
                files3 = files3.map( file => ( {
                    file: file,
                    pug: false,
                    name: file.slice( process.cwd()
                        .length + 5 )
                } ) );

                files = files.concat( files2 )
                    .concat( files3 );

                let r = 'app.run( function($templateCache){';
                let errorJade;
                files.forEach( ( file ) => {

                    if ( file.name == 'index.pug' || file.name == 'index.html' || errorJade )
                        return;

                    try {

                        Poetry.log.silly( 'Rendering :', file.name );

                        let tmpl;
                        if ( file.pug ) tmpl = Pug.renderFile( file.file );
                        else tmpl = fs.readFileSync( file.file )
                            .toString();

                        r += `$templateCache.put('${file.name}','`;
                        r += tmpl.replace( /\'/g, '\\\'' )
                            .replace( /\n/g, '\\n' );
                        r += `');`;

                    } catch ( err ) {
                        Poetry.log.error( err );
                        errorJade = err;
                    }

                } );
                r += '} )';
                reply( errorJade, r )
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
} );
