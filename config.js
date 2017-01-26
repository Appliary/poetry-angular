const fs = require( 'fs' ),
    Poetry = require( 'poetry' ),
    poetryAngularConf = './node-modules/poetry-angular/config';

let files = [],
    poaFiles = [],
    config = require('./default.json');

try {
    files = fs.readdirSync( './config' );

    Poetry.log.info('Attempting to read poetry-angular dependencies');
    poaFiles = require(poetryAngularConf);
    Poetry.log.info('Sucessfully read the poetry-angular files: ', poaFiles)
} catch ( err ) {
    throw Poetry.log.fatal( 'Unable to access config directory', err );
}

files.forEach( ( file ) => {
    let name = file.split( '.', 1 )[ 0 ];
    try {

        let imp = require( '../../config/' + file );

        if ( !config[ name ] ) {
            if( imp instanceof Array )
                config[ name ] = [];
            else
                config[ name ] = {};
        }

        Object.keys( imp )
            .forEach( ( key ) => {
                if( imp instanceof Array )
                    config[ name ].push( imp[ key ] );
                else
                    config[ name ][ key ] = imp[ key ];
            } );

    } catch ( err ) {
        Poetry.log.error( 'Unable to require configFile', file )
    }
} );

module.exports = config;
