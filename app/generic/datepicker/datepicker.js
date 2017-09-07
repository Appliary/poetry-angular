var datepicker = $.fn.datepicker.noConflict();
$.fn.bootstrapDP = datepicker;

app.directive( "datepicker", function () {
    console.log( 'DATEPICKER' );
    return {
        restrict: 'E',
        scope: {
            datevalue: '=ngModel',
            options: '=options'
        },
        templateUrl: 'generic/datepicker/datepicker.pug',
        link: function ( scope, elem, attrs ) {
          var selfChange = false;
          scope.$watch('datevalue', function(nv){
            if(selfChange){
              selfChange = false;
              return;
            }
            if(nv && angular.isObject(nv) && typeof nv.getMonth === 'function' && !isNaN(nv.getMonth())){
              var d = new Date(nv);
              selfChange = true;
              scope.datevalue = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
            }
          });
          scope.calendars = {
            c1: {
              options: scope.options || {},
              format: scope.$root.user && scope.$root.user.locale && scope.$root.user.locale == 'fr' ? "dd/MM/yyyy" : "MM/dd/yyyy",
              altFormats: scope.$root.user && scope.$root.user.locale && scope.$root.user.locale == 'fr' ? ["d!/M!/yyyy"] : ["M!/d!/yyyy"]
            }
          };
          scope.open = function(name){
            if(!scope.calendars[name]) return;
            scope.calendars[name].open = !scope.calendars[name].open;
          };
        }

    };
} );

/**
*
* OLD ONE: kept for testing purpose (and in case of re-use)
*/
app.directive( "datepickerold", function () {
    console.log( 'DATEPICKER' );
    return {
        restrict: 'E',
        scope: {
            datevalue: '=ngModel'
        },
        templateUrl: 'generic/datepicker/datepickerOld.pug',
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
