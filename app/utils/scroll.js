app.directive('scroll', function () {
    return {
        scope: {
            'scroll': '&'
        },
        link: function (scope, elem, attrs) {
            var scrollHead = elem[0].querySelector('.dataTables_scrollHead');
            var scrollBody = elem[0].querySelector('.dataTables_scrollBody');

            // if(scope.filtered > 10)
            scrollBody.style.height = '400px';

            scrollHead.onscroll = function() {
                scrollBody.scrollLeft = scrollHead.scrollLeft;
            }

            scrollBody.onscroll = function (event) {
                scrollHead.scrollLeft = scrollBody.scrollLeft;

                return scope.scroll()(event);
            }
        }
    };
});
