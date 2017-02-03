const fs = require( 'fs' ),
    Poetry = require( 'poetry' ),
    poetryAngularConf = './node_modules/poetry-angular/config';

let files = [],
    poaFiles = [],
    config = require('./default.json');

let _processFiles = (files, parentFolder) => {
    files.forEach( ( file ) => {
        let name = file.split( '.', 1 )[ 0 ];
        try {

            let imp = require( parentFolder + file );

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
}

try {
    files = fs.readdirSync( './config' );

    Poetry.log.info('Attempting to read poetry-angular dependencies');
    if (fs.existsSync(poetryAngularConf)) {
        poaFiles = fs.readdirSync(poetryAngularConf);
    }
    Poetry.log.info('Sucessfully read the poetry-angular files: ', poaFiles)
} catch ( err ) {
    throw Poetry.log.error( 'Unable to access config directory', err );
}


// Process first the poetry-angular's own dependencies
_processFiles(poaFiles, './config/')

// Process then the app's dependencies
_processFiles(files, '../../config/')

module.exports = config;
