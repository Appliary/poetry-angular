/**
 * Register
 * This file give a registry of apps, and register this one to others
 */


// Load dependencies & config
const Poetry = require( 'poetry' ),
    config = require( './config' );

// Registry of the apps, prefilled with current app
let apps = [ config.app.name ];

// On an app init, register this app again to the others
Poetry.on( 'app:init', {}, () => {
    Poetry.emit( 'app', config.app );
} );

// When an app declares itslef, register it
Poetry.on( 'app', {}, ( app ) => {
    if ( !~apps.indexOf( app.name ) )
        apps.push( app.name );
} )

// At boot, emit an app:init to get others
Poetry.emit( 'app:init', {} );

// API to list applications
Poetry.route( {
    method: 'GET',
    path: '/__apps',
    config: {
        description: '__ LIST APPS __',
        tags: [ 'Applications (front-end)' ]
    }
}, ( request, reply ) => {

    return reply( apps );

} );
