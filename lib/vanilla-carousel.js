'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ = require('lodash/core');
_.includes = require('lodash/includes');
var ViewportDetectionClass = require('viewport-detection-es6');

var viewport = new ViewportDetectionClass();

var CarouselClass = function () {
  function CarouselClass() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    _classCallCheck(this, CarouselClass);

    this.config = _.defaults(config, { itemClass: 'carousel-item',
      autoPlay: false,
      naturalScroll: true });

    if (init) {
      this._initViewport();
      this._init();
    }
  }

  _createClass(CarouselClass, [{
    key: '_init',
    value: function _init() {
      this.animating = false;
      this.eventManager = this._manageListeners();
      this.itemActive = 0;
      this.items = [];
      this._render();
    }
  }, {
    key: '_initViewport',
    value: function _initViewport() {
      this.device = viewport.getDevice();
      this.size = viewport.windowSize();
      viewport.trackSize(this._trackSize.bind(this));
    }
  }, {
    key: '_render',
    value: function _render() {
      this._setCarouselId();
      this._getItems();
      this._setSelectedDefaults();
    }
  }, {
    key: '_addDotClickListeners',
    value: function _addDotClickListeners() {
      var _this = this;

      _.forEach(this.dots, function (dot) {
        dot.addEventListener('click', _this._dotClick.bind(_this), false);
      });
    }
  }, {
    key: '_addFocusListeners',
    value: function _addFocusListeners() {
      this.config.element.addEventListener('mouseenter', this._stopAutoPlay.bind(this), false);

      this.config.element.addEventListener('mouseleave', this._restartTimer.bind(this), false);
    }
  }, {
    key: '_addNavigationListener',
    value: function _addNavigationListener(button, direction) {
      button.addEventListener('click', this._navigationClick.bind(this, button, direction), false);
    }
  }, {
    key: '_animateItemFinish',
    value: function _animateItemFinish(item) {
      this.animating = false;

      item.className = item.className.replace(/(?:^|\s)animating(?!\S)/g, '');
    }
  }, {
    key: '_animateItemStart',
    value: function _animateItemStart(item, fromPosition, toPosition) {
      var _this2 = this;

      item.style.left = fromPosition;

      _.delay(function () {
        _this2.animating = true;
        item.style.left = toPosition;
        item.className += ' animating';
      }, 100);

      this.eventManager.addListener(item, 'transitionend', this._animateItemFinish.bind(this, item));
    }
  }, {
    key: '_checkDataURLs',
    value: function _checkDataURLs() {
      var _this3 = this;

      var imageContainer = void 0,
          imageMobile = void 0,
          imageTablet = void 0,
          imageDesktop = void 0;

      _.forEach(this.items, function (item) {
        imageContainer = _this3._skipTextNodes(item, 'firstChild');
        imageMobile = imageContainer.getAttribute('data-mobile');
        imageTablet = imageContainer.getAttribute('data-tablet');
        imageDesktop = imageContainer.getAttribute('data-desktop');

        /* eslint-disable max-len */
        if (!_.isEmpty(imageMobile) && !_.isEmpty(imageTablet) && !_.isEmpty(imageDesktop)) {
          /* eslint-enable */
          item.setAttribute('data-urls', 'true');
          _this3._setBackgroundImage(imageContainer, _this3.device);
        } else {
          item.setAttribute('data-urls', 'false');
        }
      });
    }
  }, {
    key: '_createArrowNav',
    value: function _createArrowNav(direction, parent) {
      var a = void 0,
          span = void 0,
          svg = void 0;

      a = document.createElement('a');
      span = document.createElement('span');

      a.setAttribute('href', '#');

      span.innerHTML = direction;
      a.appendChild(span);
      svg = this._createArrowNavSvg(direction);
      a.appendChild(svg);
      this._addNavigationListener(a, direction);

      parent.appendChild(a);
    }
  }, {
    key: '_createArrowNavContainer',
    value: function _createArrowNavContainer() {
      var i = void 0,
          li = void 0,
          ul = void 0;

      ul = document.createElement('ul');
      ul.className = 'carousel-arrows-container';

      for (i = 0; i < 2; i++) {
        li = document.createElement('li');

        li.className = i === 0 ? 'previous' : 'next';
        this._createArrowNav(i === 0 ? 'previous' : 'next', li);

        ul.appendChild(li);
      }

      this.config.element.appendChild(ul);
    }
  }, {
    key: '_createArrowNavSvg',
    value: function _createArrowNavSvg(direction) {
      var pathA = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      var pathB = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

      svg.setAttribute('fill', '#4a4a4a');
      svg.setAttribute('height', '48');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('width', '48');
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

      if (direction === 'next') {
        pathA.setAttributeNS(null, 'd', 'M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z');
        pathB.setAttributeNS(null, 'd', 'M0-.25h24v24H0z');
      } else {
        pathA.setAttributeNS(null, 'd'
        /* eslint-disable max-len */
        , 'M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z');
        /* eslint-enable */
        pathB.setAttributeNS(null, 'd', 'M0-.5h24v24H0z');
      }

      pathB.setAttribute('fill', 'none');

      svg.appendChild(pathA);
      svg.appendChild(pathB);

      return svg;
    }
  }, {
    key: '_createDotsNav',
    value: function _createDotsNav() {
      var a = void 0,
          li = void 0,
          span = void 0;
      var ul = this.dotsContainer.getElementsByTagName('ul')[0];

      _.forEach(this.items, function () {
        a = document.createElement('a');
        li = document.createElement('li');
        span = document.createElement('span');

        a.setAttribute('href', '#');

        span.className = 'hidden';
        span.innerHTML = 'view carousel item';

        a.appendChild(span);
        li.appendChild(a);
        ul.appendChild(li);
      });

      this._getDots();
    }
  }, {
    key: '_createDotsNavContainer',
    value: function _createDotsNavContainer() {
      var div = document.createElement('div');
      var ul = document.createElement('ul');
      this.dotsContainer = document.createElement('div');

      div.className = 'carousel-dots';
      this.dotsContainer.id = 'carousel-dots-container';

      div.appendChild(ul);
      this.dotsContainer.appendChild(div);
      this.config.element.appendChild(this.dotsContainer);

      this._createDotsNav();
    }
  }, {
    key: '_dotClick',
    value: function _dotClick(e) {
      e.preventDefault();

      var index = _.indexOf(this.dots, e.target);

      if (!this.animating) {
        if (this.itemActive !== index) {
          this.itemOut = this.itemActive;
          this.itemActive = index;

          this._setSelected('next');
        }
      }
    }
  }, {
    key: '_getDots',
    value: function _getDots() {
      this.dots = this.dotsContainer.getElementsByTagName('a');

      this._addDotClickListeners();
      this._setDotAriaSelectedDefaults();
      this._setDotAriaControls();
      this._setDotClass();
    }
  }, {
    key: '_getItems',
    value: function _getItems() {
      /* eslint-disable max-len */
      this.items = this.config.element.querySelectorAll('.' + this.config.itemClass);
      /* eslint-enable */

      if (this.items.length > 1) {
        this._createArrowNavContainer();
        this._createDotsNavContainer();
      }

      this._checkDataURLs();
      this._setItemAriaHiddenDefaults();
      this._setItemId();
    }
  }, {
    key: '_manageListeners',
    value: function _manageListeners() {
      var listenerArray = [];

      return {
        addListener: function addListener(target, event, fn) {
          listenerArray.push({
            target: target,
            event: event,
            fn: fn
          });

          target.addEventListener(event, fn, false);
        },

        removeListeners: function removeListeners() {
          if (listenerArray.length > 0) {
            _.forEach(listenerArray, function (cur) {
              cur.target.removeEventListener(cur.event, cur.fn, false);
              cur.target.className.replace(/(?:^|\s)animating(?!\S)/g, '');
            });

            listenerArray = [];
          }
        }
      };
    }
  }, {
    key: '_navigationClick',
    value: function _navigationClick(button, direction, e) {
      e.preventDefault();

      if (!this.animating) {
        this.itemOut = this.itemActive;

        if (direction === 'next') {
          this._next();
        } else {
          this._previous();
        }
      }
    }
  }, {
    key: '_next',
    value: function _next() {
      if (this.itemActive < this.items.length - 1) {
        this.itemActive++;
      } else {
        this.itemActive = 0;
      }

      this._setSelected('next');
    }
  }, {
    key: '_previous',
    value: function _previous() {
      if (this.itemActive > 0) {
        this.itemActive--;
      } else {
        this.itemActive = this.items.length - 1;
      }

      this._setSelected('previous');
    }
  }, {
    key: '_restartTimer',
    value: function _restartTimer() {
      this._stopAutoPlay();

      this.timer = window.setInterval(this._startAutoPlay.bind(this), 5000);
    }
  }, {
    key: '_setBackgroundImage',
    value: function _setBackgroundImage(imageContainer, device) {
      var url = imageContainer.getAttribute('data-' + device);

      imageContainer.style.backgroundImage = 'url(' + url + ')';
    }
  }, {
    key: '_setCarouselId',
    value: function _setCarouselId() {
      this.config.element.id = _.uniqueId('carousel-');
    }
  }, {
    key: '_setDotAriaControls',
    value: function _setDotAriaControls() {
      var _this4 = this;

      _.forEach(this.dots, function (dot, i) {
        dot.setAttribute('aria-controls', _this4.config.element.id + '-item-' + (i + 1));
      });
    }
  }, {
    key: '_setDotAriaSelected',
    value: function _setDotAriaSelected() {
      var _this5 = this;

      _.forEach(this.dots, function (dot) {
        if (dot === _this5.dots[_this5.itemActive]) {
          dot.setAttribute('aria-selected', 'true');
        } else {
          var ariaSelected = dot.getAttribute('aria-selected');

          if (ariaSelected === 'true') {
            dot.setAttribute('aria-selected', 'false');
          }
        }
      });
    }
  }, {
    key: '_setDotAriaSelectedDefaults',
    value: function _setDotAriaSelectedDefaults() {
      var _this6 = this;

      _.forEach(this.dots, function (dot) {
        dot.setAttribute('aria-selected', dot === _this6.dots[_this6.itemActive] ? 'true' : 'false');
      });
    }
  }, {
    key: '_setDotClass',
    value: function _setDotClass() {
      var _this7 = this;

      _.forEach(this.dots, function (dot) {
        if (dot === _this7.dots[_this7.itemActive]) {
          dot.className += ' active';
        } else {
          var className = dot.className;

          if (_.includes(className, 'active')) {
            dot.className = className.replace(/(?:^|\s)active(?!\S)/g, '');
          }
        }
      });
    }
  }, {
    key: '_setItemAriaHidden',
    value: function _setItemAriaHidden() {
      var _this8 = this;

      _.forEach(this.items, function (item) {
        if (item === _this8.items[_this8.itemActive]) {
          item.setAttribute('aria-hidden', 'false');
        } else {
          var ariaHidden = item.getAttribute('aria-hidden');

          if (ariaHidden === 'false') {
            item.setAttribute('aria-hidden', 'true');
          }
        }
      });
    }
  }, {
    key: '_setItemAriaHiddenDefaults',
    value: function _setItemAriaHiddenDefaults() {
      var _this9 = this;

      _.forEach(this.items, function (item) {
        item.setAttribute('aria-hidden', item === _this9.items[_this9.itemActive] ? 'false' : 'true');
      });
    }
  }, {
    key: '_setItemId',
    value: function _setItemId() {
      var _this10 = this;

      _.forEach(this.items, function (item, i) {
        item.id = _this10.config.element.id + '-item-' + (i + 1);
      });
    }
  }, {
    key: '_setPosition',
    value: function _setPosition(direction, position) {
      var inPosition = void 0,
          outPosition = void 0;

      if (direction === 'next') {
        if (this.config.naturalScroll) {
          inPosition = position;
          outPosition = -position;
        } else {
          inPosition = -position;
          outPosition = position;
        }
      } else if (direction === 'previous') {
        if (this.config.naturalScroll) {
          inPosition = -position;
          outPosition = position;
        } else {
          inPosition = position;
          outPosition = -position;
        }
      }

      return {
        inPosition: inPosition + 'px',
        outPosition: outPosition + 'px'
      };
    }
  }, {
    key: '_setSelected',
    value: function _setSelected(direction) {
      var position = this._setPosition(direction, this.size.width);

      this.eventManager.removeListeners();
      this.itemIn = this.itemActive;
      this._animateItemStart(this.items[this.itemIn], position.inPosition, 0);
      this._animateItemStart(this.items[this.itemOut], 0, position.outPosition);
      this._setDotAriaSelected();
      this._setDotClass();
      this._setItemAriaHidden();
    }
  }, {
    key: '_setSelectedDefaults',
    value: function _setSelectedDefaults() {
      var _this11 = this;

      _.forEach(this.items, function (item) {
        item.style.left = item === _this11.items[_this11.itemActive] ? 0 : _this11.size.width + 'px';
      });

      if (this.config.autoPlay && this.items.length > 1) {
        this._addFocusListeners();
        this._restartTimer();
      }
    }
  }, {
    key: '_skipTextNodes',
    value: function _skipTextNodes(el, method) {
      var element = el[method];

      while (element !== null && element.nodeType !== 1) {
        element = element.nextSibling;
      }

      return element;
    }
  }, {
    key: '_startAutoPlay',
    value: function _startAutoPlay() {
      this.itemOut = this.itemActive;

      if (this.itemActive < this.items.length - 1) {
        this.itemActive++;
      } else {
        this.itemActive = 0;
      }

      this._setSelected('next');
    }
  }, {
    key: '_stopAutoPlay',
    value: function _stopAutoPlay() {
      if (!this.animating && !_.isUndefined(this.timer)) {
        window.clearInterval(this.timer);

        this.timer = undefined;
      }
    }
  }, {
    key: '_trackSize',
    value: function _trackSize(device, size) {
      var item = this.items[this.itemActive];

      if (this.device !== device) {
        this.device = device;

        if (item.getAttribute('data-urls') === 'true') {
          var imageContainer = this._skipTextNodes(item, 'firstChild');
          this._setBackgroundImage(imageContainer, this.device);
        }
      }

      this.size = size;
    }
  }]);

  return CarouselClass;
}();

module.exports = CarouselClass;
//# sourceMappingURL=vanilla-carousel.js.map