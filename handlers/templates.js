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

        let r = 'app.run( function($templateCache){';
        files.forEach( ( file ) => {

            let name = file.slice( __dirname.length - 4 );
            if ( name == 'index.pug' ) return;

            try{
                Poetry.log.silly( 'Rendering :', name );
                let tmpl = Pug.renderFile( file );
                r += `$templateCache.put('${name}','`;
                r += tmpl.replace( /\'/g, '\\\'' ).replace( /\n/g, '\\n' );
                r += `');`;
            }catch(err){
                Poetry.log.error(err);
            }

        } );
        r += '} )';
        reply( r );

        if ( process.env.node_env == 'prod' ||
            process.env.NODE_ENV == 'prod' ||
            process.env.node_env == 'production' ||
            process.env.NODE_ENV == 'production' ) {
            cache = r;
            Poetry.log.verbose( 'Templates are now cached' );
        }

    } );
} );
