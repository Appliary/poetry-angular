const Pug = require( 'pug' ),
    Poetry = require( 'poetry' ),
    config = require( '../config' );

if ( !( process.env.node_env == 'prod' ||
        process.env.NODE_ENV == 'prod' ||
        process.env.node_env == 'production' ||
        process.env.NODE_ENV == 'production' ) ) {

    Poetry.log.verbose( 'Dev mode' );
    config.pretty = true;
    config.cache = false;

}

module.exports = () => {

    try {
        return Pug.renderFile( __dirname + '/../app/index.pug', config );
    } catch ( err ) {
        return '<h1>Jade error:</h1><pre>' + err.toString() + '</pre>';
    }

};
