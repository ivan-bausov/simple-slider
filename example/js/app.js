/**
 * Created by Ivan on 06/07/15.
 */
requirejs([
    'slider',
    'utils',
    'jquery'
], function (
             Slider,
             Utils,
             $
             ) {

    var utils = new Utils();

    //инициализируем слайдер

    var slider = new Slider('.slider'),
        slider_container = $('.slider');

    $('.arrow-left').click(function () {
        slider.prev()
    });
    $('.arrow-right').click(function () {
        slider.next()
    });

    $('body').on('keyup', function (event) {
        if (event.keyCode === 37 || event.keyCode === 39) {
            var offset = slider_container.offset().top,
                height = slider_container.height(),
                position = utils.getTopPosition();

            if (position >= offset - 300 && position < offset + height + 300) {
                if (event.keyCode === 37) {
                    slider.prev();
                }
                if (event.keyCode === 39) {
                    slider.next();
                }
            }
        }
    });
});
