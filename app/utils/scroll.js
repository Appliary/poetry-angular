app.directive('scroll', function () {
    return {
        scope: {
            'scroll': '&'
        },
        link: function (scope, elem, attrs) {
            var scrollHead = elem[0].querySelector('.dataTables_scrollHead');
            var scrollBody = elem[0].querySelector('.dataTables_scrollBody');

            scrollHead.onscroll = function() {
                scrollBody.scrollLeft = scrollHead.scrollLeft;
            }

            scrollBody.onscroll = function (event) {
                scrollHead.scrollLeft = scrollBody.scrollLeft;

                return scope.scroll()(event, scrollHead);
            }
        }
    };
});
