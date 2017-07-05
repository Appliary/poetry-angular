// My Metronic script

var MyMetronic = function () {

    return {
        init: function () {

            $('.my-toggler').click(function () {
                $('.toggler-close').show();
                $('.theme-panel > .theme-options').show();
            });
            
        }
    }
}()

jQuery(document).ready(function () {
    MyMetronic.init();
});
