app.filter( 'localize', function ( $filter, $rootScope ) {

    function localize( input, kind ) {

        //console.log("%clocalize","background-color: black; color: #2BFF00");
        //console.log("localize input ",(typeof input), input);

        if ( kind == 'daily' ) {
            if ( !input ) return;
            var val = _date( input );
            return val.substring( 0, 10 );
        }
        if ( kind == 'weekly' ) {
            var inputDate = new Date( input );
            var newYear = new Date( inputDate.getFullYear(), 0, 1 );
            var day = newYear.getDay();
            day = ( day >= 0 ? day : day + 7 );
            var daynum = Math.floor( ( inputDate.getTime() - newYear.getTime() -
                ( inputDate.getTimezoneOffset() - newYear.getTimezoneOffset() ) * 60000 ) / 86400000 ) + 1;
            var weeknum;
            //if the year starts before the middle of a week
            if ( day < 4 ) {
                weeknum = Math.floor( ( daynum + day - 1 ) / 7 ) + 1;
                if ( weeknum > 52 ) {
                    nYear = new Date( inputDate.getFullYear() + 1, 0, 1 );
                    nday = nYear.getDay();
                    nday = nday >= 0 ? nday : nday + 7;
                    weeknum = nday < 4 ? 1 : 53;
                }
            } else {
                weeknum = Math.floor( ( daynum + day - 1 ) / 7 );
            }
            return inputDate.getFullYear() + "-W" + ( weeknum < 10 ? "0" : "" ) + weeknum + "-1";
        }
        if ( kind == 'monthly' ) {
            /*return ( new Date( input ) )
              .getMonth() + 1;*/
            return ( new Date( input ) )
                .toLocaleString( $rootScope.user.language, {
                    month: "short"
                } ) + " " + ( new Date( input ) )
                .getFullYear();
        }
        if ( kind == 'yearly' ) {
            /*return ( new Date( input ) )
              .getMonth() + 1;*/
            return ( new Date( input ) )
                .getFullYear();
        }
        if( kind == 'UTC'){
          var d = new Date( input );
          var timezoneOffset = (d.getTimezoneOffset() * 60000);
          var utcD = new Date(d.getTime() + timezoneOffset);
          return _date( utcD );
        }
        if ( kind ) return _date( input );

        if ( input === undefined ) return;
        if ( input === null ) return $filter( 'translate' )( 'null:value' );
        if ( input === false ) return $filter( 'translate' )( 'false:value' );
        if ( input === true ) return $filter( 'translate' )( 'true:value' );

        if ( isFinite( input ) ) {
            input = parseFloat( input );
            if ( input > 0xe8d4a51000 && input < 0x82f79cd9000 )
                return _date( input );

            return _number( input );
        }

        if ( input.length == 24 || input instanceof Date )
            if ( _date( input ) != "Invalid Date" ) return _date( input );

        if ( typeof input == 'object' ) {
            if ( input.name ) return input.name;
            if ( input.id ) return input.id;
            if ( input._id ) return input._id;

            var output = '';
            Object.keys( input )
                .forEach( function ( key ) {
                    output += $filter( 'translate' )( key + ':subvalue' );
                    output += ': ' + localize( input[ key ] ) + '\n';
                } );
            return output;
        }

        return input;

    }

    function _date( input ) {
        var output = new Date( input );
        if ( output.getFullYear() == 1970 )
            output = new Date( output.getTime() * 1000 );
        return output.toLocaleString( $rootScope.user.locale || undefined );
    }

    function _number( input ) {
        if(!$rootScope.user.locale && input){
          // matrix
          console.log("%cMissing user locale ???","background-color: black; color: #2BFF00");
        }
        var val = input.toLocaleString( $rootScope.user.locale || undefined );

        if(val == "NaN"){
          return;
        }
        return val;
    }

    return localize;

} );
