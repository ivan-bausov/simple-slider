/**
 * Created by Ivan on 01/05/15.
 */
define(['jquery'], function ($) {
    function Utils() {
        if(Utils.instance){
            return Utils.instance;
        }
        this.marker_top = $('<div></div>')
            .attr('id', 'marker-top')
            .appendTo('body');
        this.marker_bottom = $('<div></div>')
            .attr('id', 'marker-bottom')
            .appendTo('body');
        Utils.instance = this;
    }

    Utils.prototype.getMiddlePosition = function () {
        return this.marker_top.offset().top + (this.marker_bottom.offset().top - this.marker_top.offset().top) / 2;
    };

    Utils.prototype.getTopPosition = function () {
        return this.marker_top.offset().top;
    };

    return Utils;
});
