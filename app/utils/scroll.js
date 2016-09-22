app.directive( 'scroll', function () {
    return {
        scope: {
            'scroll': '&'
        },
        link: function ( scope, elem, attrs ) {
            elem[0].onscroll = function( event ){
                return scope.scroll()( event );
            }
        }
    };
} );
