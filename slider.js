/**
 * Created by Ivan on 13/04/15.
 */
define(['jquery'], function ($) {
    function Slider(selector) {
        var _SL = this;

        _SL.slider = $(selector);
        _SL.slide_selector = '.slide';
        _SL.touch_point = 0;
        _SL.offset = 0;
        _SL.slides = [];
        _SL.is_animation_in_progress = false;

        _SL
            .processSlides()
            .createPagination()
            .recalculateSliderWidth()
            .setInitialSlidesPositions(true)
            .setActive()
            .observeWheel()
            .observeTouch();

        $(window).resize(function () {
            _SL
                .recalculateSliderWidth()
                .setInitialSlidesPositions(true);

        });
    }

    Slider.prototype.processSlides = function () {
        var _SL = this,
            index = 0;

        _SL.slides_original = _SL.slider.find(_SL.slide_selector);

        if(!_SL.isIEMobile()) {
            _SL.slides_original.each(function () {
                $(this).attr('data-index', index++);
            });

            _SL.count = _SL.slides_original.size();

            if (_SL.slides_original.size() < 5) {
                _SL.slides_original.clone().appendTo(_SL.slider);
            }
            _SL.slides_original = _SL.slider.find(_SL.slide_selector);

            if (_SL.slides_original.size() < 5) {
                _SL.slides_original.clone().appendTo(_SL.slider);
            }
            _SL.slides_original = _SL.slider.find(_SL.slide_selector);
        }

        _SL.slides_original.each(function () {
            var self = $(this);
            _SL.slides.push(self);
        });

        _SL
            .shiftLeft()
            .shiftLeft();

        return this;
    };

    Slider.prototype.recalculateSliderWidth = function () {
        this.slider_width = parseInt(this.slider.width());
        this.width = parseInt(this.slides[0].width());
        return this;
    };

    Slider.prototype.observeWheel = function () {
        var _SL = this;

        _SL.slider.on('wheel', function (e) {
            if (!_SL.isAnimationInProgress()) {
                var original_event = e.originalEvent,
                    deltaX = original_event.wheelDeltaX !== undefined ? original_event.wheelDeltaX : -original_event.deltaX;

                if (Math.abs(deltaX) > 10) {
                    e.preventDefault();
                    if (deltaX < -20) {
                        _SL.speed = 40;
                        _SL.calculateFreeMove(true);
                    }

                    if (deltaX > 20) {
                        _SL.speed = - 40;
                        _SL.calculateFreeMove(true);
                    }
                }
            } else {
                e.preventDefault();
            }
        });

        return _SL;
    };

    Slider.prototype.isIEMobile = function () {
        return window.navigator.msPointerEnabled && window.navigator.userAgent.search('Trident') !== -1 && window.navigator.userAgent.search('Phone') !== -1;
    };

    Slider.prototype.observeTouch = function () {
        var _SL = this;

        if(_SL.isIEMobile()){
            _SL.slider.css('overflow-x', 'auto');
        } else {
            _SL.slider.get(0).addEventListener(Slider.TOUCH_START, function (event) {
                _SL.touch_point_x = event.pageX || event.changedTouches[0].pageX;
                _SL.touch_start_point_x = event.pageX || event.changedTouches[0].pageX;
            }, false);

            _SL.slider.get(0).addEventListener(Slider.TOUCH_END, function () {
                _SL.calculateFreeMove();
            }, false);

            _SL.slider.get(0).addEventListener(Slider.TOUCH_CANCEL, function () {
                _SL.calculateFreeMove();
            }, false);

            _SL.slider.get(0).addEventListener(Slider.TOUCH_MOVE, function (event) {
                var new_touch_point_x = event.pageX || event.changedTouches[0].pageX,
                    delta;

                _SL.touch_point_x = _SL.touch_point_x ? _SL.touch_point_x : new_touch_point_x;
                _SL.touch_start_point_x = _SL.touch_start_point_x ? _SL.touch_start_point_x : new_touch_point_x;
                delta = _SL.touch_point_x - new_touch_point_x;
                _SL.touch_point_x = new_touch_point_x;

                if (delta) {
                    clearTimeout(_SL.timeout);
                    _SL.speed = parseInt(delta);
                    _SL.calculateMove();
                }
                if(Math.abs(new_touch_point_x - _SL.touch_start_point_x) > 10){
                    event.preventDefault();
                }
            }, false);
        }

        return _SL;
    };

    Slider.prototype.shiftLeft = function () {
        this.slides.unshift(this.slides.pop());
        return this;
    };

    Slider.prototype.shiftRight = function () {
        this.slides.push(this.slides.shift());
        return this;
    };

    Slider.prototype.offsetReset = function () {
        this.offset = this.getDefaultOffset();
        return this;
    };

    Slider.prototype.getDefaultOffset = function () {
        return -parseInt(2 * this.width - (this.slider_width - this.width) / 2);
    };

    Slider.prototype.createPagination = function () {
        var _SL = this,
            pagination = '',
            i, max;

        if(!_SL.isIEMobile()){
            for (i = 0, max = _SL.count; i < max; i++) {
                pagination += '<li></li>';
            }
        }

        $('<ul></ul>').addClass('slider-pagination').html(pagination).insertBefore(_SL.slider);
        _SL.pagination = $('.slider-pagination li');

        _SL.pagination.eq(0).addClass('active');

        _SL.pagination.on('click', function () {
            _SL.slide(_SL.pagination.index($(this)));
        });

        return this;
    };

    Slider.prototype.setInitialSlidesPositions = function (all) {
        return this
            .offsetReset()
            .setSlidesPositions(all);
    };

    Slider.prototype.setSlidesPositions = function (all) {
        var _SL = this,
            position = _SL.offset,
            max = all ? _SL.slides.length : 5,
            i;

        for (i = 0; i < max; i++) {
            _SL.slides[i].css('left', position);
            position += _SL.width;
        }

        return this;
    };

    Slider.prototype._next = function () {
        if(!this.isAnimationInProgress()){
            this.speed = 40;
            this.calculateFreeMove(true);
        }
    };

    Slider.prototype._prev = function () {
        if(!this.isAnimationInProgress()){
            this.speed = -40;
            this.calculateFreeMove(true);
        }
    };

    Slider.prototype.next = function () {
        this.slide(parseInt(this.slides[3].attr('data-index')), true);
    };

    Slider.prototype.prev = function () {
        this.slide(parseInt(this.slides[1].attr('data-index')), false);
    };

    Slider.prototype.slide = function (id, direction) {
        var _SL = this;

        if (!_SL.is_animation_in_progress) {
            _SL.is_animation_in_progress = true;

            _SL.slideTo(id, direction).done(function () {
                _SL.is_animation_in_progress = false;
                _SL.setInitialSlidesPositions();
                _SL.setActive();
            });
        }
    };

    Slider.prototype.slideTo = function (id, direction) {
        var _SL = this,
            deferreds = [],
            offset,
            left_position,
            right_position,
            target_id,
            i;

        for(i = 3; i < _SL.slides_original.length; i ++) {
            if(parseInt(_SL.slides[i].attr('data-index')) === id) {
                right_position = i;
                break;
            }
        }

        for(i = 0; i < 2; i ++) {
            if(parseInt(_SL.slides[i].attr('data-index')) === id) {
                left_position = i;
                break;
            }
        }

        if(right_position !== undefined && left_position !== undefined) {
            if(right_position - 2 !== 2 - left_position) {
                direction = (right_position - 2 < 2 - left_position);
            }
            target_id = direction ? right_position : left_position;
        } else {
            direction = right_position !== undefined;
            target_id = right_position !== undefined ? right_position : left_position;
        }

        offset = parseInt(_SL.slides[target_id].css('left')) - (_SL.getDefaultOffset() + 2 * _SL.width);

        while (parseInt(_SL.slides[2].attr('data-index')) !== id) {
            direction ? _SL.shiftRight() : _SL.shiftLeft();
        }

        _SL.slides_original.each(function () {
            var slide = $(this),
                dfd = $.Deferred();

            deferreds.push(dfd);

            slide.animate({
                left: parseInt(slide.css('left')) - offset
            }, 400, 'swing', function () {
                dfd.resolve();
            });
        });

        return $.when.apply(null, deferreds);
    };

    Slider.prototype.calculateMove = function () {
        if (this.isPositionReadyToSave()) {
            this.setCurrentPositions();
        } else {
            this.calculatePositions();
        }
        return this;
    };

    Slider.prototype.calculateFreeMove = function (force) {
        var _SL = this;

        clearTimeout(_SL.timeout);

        if (_SL.isPositionReadyToSave()) {
            _SL.is_animation_in_progress = false;
            _SL.setCurrentPositions();

        } else {
            _SL.is_animation_in_progress = true;

            _SL
                .calculatePositions()
                .calculateVelocity(force);

            _SL.timeout = setTimeout(function () {
                _SL.calculateFreeMove(force);
            }, 30);
        }
    };

    Slider.prototype.calculatePositions = function () {
        this.offset -= this.speed;
        this.direction = this.speed > 0;
        this.setSlidesPositions();

        return this;
    };

    Slider.prototype.isPositionReadyToSave = function () {
        return !(this.speed && this.isOffsetInLimits());
    };

    Slider.prototype.setCurrentPositions = function () {
        if (this.getRealOffset()) {
            (this.direction ? this.shiftRight() : this.shiftLeft())
                .setInitialSlidesPositions()
                .setActive();
        }
        return this;
    };

    Slider.prototype.calculateVelocity = function (force) {
        var _SL = this,
            friction = 0.3;

        if ((Math.abs(_SL.getRealOffset()) > 0.2 * _SL.width) || force) {
            _SL.speed = _SL.speed > 0 ?
            friction * (_SL.width - Math.abs(_SL.getRealOffset() - _SL.width) % _SL.width) :
            -friction * (Math.abs(_SL.getRealOffset() - _SL.width) % _SL.width);
        } else {
            _SL.speed = friction * (_SL.getRealOffset() % _SL.width);
        }

        if (_SL.speed) {
            if (Math.abs(_SL.speed) < 1) {
                _SL.speed = _SL.speed > 0 ? 1 : -1;
            } else {
                _SL.speed = parseInt(_SL.speed);
            }
        }
    };

    Slider.prototype.setActive = function () {
        var _SL = this,
            active_slide = _SL.slides[2],
            active_index = _SL.slides[2].attr('data-index');

        _SL.slides_original.removeClass('active');
        active_slide.addClass('active');

        _SL.pagination
            .removeClass('active')
            .eq(active_index)
            .addClass('active');

        return this;
    };

    Slider.prototype.isAnimationInProgress = function () {
        return this.is_animation_in_progress;
    };

    Slider.prototype.getRealOffset = function () {
        return this.offset - this.getDefaultOffset();
    };

    Slider.prototype.isOffsetInLimits = function () {
        return ((this.offset > - this.width + this.getDefaultOffset()) && (this.offset < this.getDefaultOffset() + this.width));
    };

    Slider.TOUCH_START = "touchstart";
    Slider.TOUCH_MOVE = "touchmove";
    Slider.TOUCH_END = "touchend";
    Slider.TOUCH_CANCEL = "touchcancel";

    return Slider;
});
