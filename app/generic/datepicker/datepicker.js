var datepicker = $.fn.datepicker.noConflict();
$.fn.bootstrapDP = datepicker;

app.directive( "datepicker", function () {
    console.log( 'DATEPICKER' );
    return {
        restrict: 'E',
        scope: {
            datevalue: '=ngModel'
        },
        templateUrl: 'generic/datepicker/datepicker.pug',
        link: function ( scope, elem, attrs ) {
            console.log( 'DATEPICKER link', scope, elem );
            var lang = 'en',
                hid = $( elem )
                .children( '.valueHolder' ),
                formc = $( elem )
                .children( '.input-group' );
            try {
                lang = scope.$parent.$root.user.language;
            } catch ( err ) {}
            hid.bootstrapDP( {
                language: lang,
                format: {
                    toDisplay: function ( date, format, language ) {
                        return new Date( date ).toISOString();
                    },
                    toValue: function ( date, format, language ) {
                        return new Date( date );
                    }
                },
                todayBtn: "linked",
                todayHighlight: true,
                weekStart: 1,
                autoclose: true,
                defaultViewDate: scope.datevalue
            } );

            formc.on( 'click', function () {
                hid.bootstrapDP( 'show' );
            } );
        }
    };
} );
