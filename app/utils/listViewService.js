app.service('ListViewService', function ($q, $filter) {
    $.extend($.fn.dataTable.defaults, {
        "aoColumnDefs": [
            {
                "targets": "_all",
                "defaultContent": ''
            }]
    });

    var _generateDnyamicListViewCols = function (DTColumnBuilder, columns, customCols) {
        var result = [];
        for (var index = 0; index < columns.length; index++) {
            var col = columns[index];
            var dtCol = DTColumnBuilder.newColumn(col.name, $filter('translate')(col.title + ":Table:Column"));

            if (col.hidden) {
                dtCol = dtCol.notVisible();
            }

            if (col.isBool) {
                dtCol = dtCol.renderWith( function (data, type, full) {
                    if (data) {
                        return '<i class="fa fa-check" aria-hidden="true"></i>';
                    } else {
                        return '<i class="fa fa-times" aria-hidden="true"></i>';
                    }
                }).withClass('alignC');
            }

            if (col.onClick || col.isEditCol) {
                var clickHandler = col.onClick,
                    colName = col.name;
                    dtCol = dtCol.renderWith( function (data, type, full) {
                        var anchor = '<div class="ng-scope"><span ng-click="actions.resolveLVClickHandler(\'' + full._id + '\',\'' + $filter('translate')(colName + ":Table:Column") + '\')">' + data + '</span></div>';

                        return anchor;
                    });
            }

            if (col.customRenderer) {
                dtCol.renderWith(col.customRenderer);
            }

            result.push(dtCol);
        }

        return result;
    }


    return {
        generateListViewOptions: function (DTOptionsBuilder, $q, data) {
            var result = DTOptionsBuilder        
                .fromFnPromise(function () {
                    var deferred = $q.defer();
                    deferred.resolve(data);
                    return deferred.promise;
                }).withLanguage({
                    "sEmptyTable":     $filter('translate')("No data available in table:Table"),
                    "sInfo":           $filter('translate')("Showing _START_ to _END_ of _TOTAL_ entries:Table"),
                    "sInfoEmpty":      $filter('translate')("Showing 0 to 0 of 0 entries:Table"),
                    "sInfoFiltered":   $filter('translate')("(filtered from _MAX_ total entries):Table"),
                    "sInfoPostFix":    "",
                    "sInfoThousands":  ",",
                    "sLengthMenu":     $filter('translate')("Show _MENU_ entries:Table"),
                    "sLoadingRecords": $filter('translate')("Loading...:Table"),
                    "sProcessing":     $filter('translate')("Processing...:Table"),
                    "sSearch":         $filter('translate')("Search:Table") + ":",
                    "sZeroRecords":    $filter('translate')("No matching records found:Table"),
                    "oPaginate": {
                        "sFirst":    $filter('translate')("First:Table"),
                        "sLast":     $filter('translate')("Last:Table"),
                        "sNext":     $filter('translate')("Next:Table"),
                        "sPrevious": $filter('translate')("Previous:Table")
                    },
                    "oAria": {
                        "sSortAscending":  ": " + $filter('translate')("activate to sort column ascending:Table"),
                        "sSortDescending": ": " + $filter('translate')("activate to sort column descending:Table")
                    }
                });

            return result;
        },
        generateListViewCols: function (DTColumnBuilder, columns, customCols) {
            return _generateDnyamicListViewCols(DTColumnBuilder, columns, customCols);

            // return $q(function (fulfil, reject) {
            //     if (columns.call) {
            //         columns()
            //             .then(fulfil)
            //             .catch(reject);
            //     } else {
            //         fulfil(_generateDnyamicListViewCols(DTColumnBuilder, columns, customCols))
            //     }
            // });            
        },                
    }
});
