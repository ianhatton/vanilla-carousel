const _                   = require('lodash/core');
_.includes = require("lodash/includes");
const ViewportDetectionClass = require('viewport-detection-es6');

const viewport = new ViewportDetectionClass();

class CarouselClass{
  constructor(config = {}, init = true){
    this.config = _.defaults(config,
      {itemClass: 'carousel-item'
      , autoPlay: false
      , naturalScroll: true}
    );

    if (init){
      this._initViewport();
      this._init();
    }
  }

  _init(){
    this.animating = false;
    this.eventManager = this._manageListeners();
    this.itemActive = 0;
    this.items = [];
    this._render();
  }

  _initViewport(){
    this.device = viewport.getDevice();
    this.size = viewport.windowSize();
    viewport.trackSize(this._trackSize.bind(this));
  }

  _render(){
    this._setCarouselId();
    this._getItems();
    this._setSelectedDefaults();
  }

  _addDotClickListeners(){
    _.forEach(this.dots, (dot)=>{
      dot.addEventListener('click', this._dotClick.bind(this), false);
    });
  }

  _addFocusListeners(){
    this.config.element.addEventListener('mouseenter'
                                        , this._stopAutoPlay.bind(this)
                                        , false);

    this.config.element.addEventListener('mouseleave'
                                        , this._restartTimer.bind(this)
                                        , false);
  }

  _addNavigationListener(button, direction){
    button.addEventListener('click',
                            this._navigationClick.bind(this, button, direction)
                            , false);
  }

  _animateItemFinish(item){
    this.animating = false;

    item.className = item.className.replace(/(?:^|\s)animating(?!\S)/g, '');
  }

  _animateItemStart(item, fromPosition, toPosition){
    item.style.left = fromPosition;

    _.delay(()=>{
      this.animating = true;
      item.style.left = toPosition;
      item.className += ' animating';
    }, 100);

    this.eventManager.addListener(item
                                 , 'transitionend'
                                 , this._animateItemFinish.bind(this, item));
  }

  _checkDataURLs(){
    let imageContainer, imageMobile, imageTablet, imageDesktop;

    _.forEach(this.items, (item)=>{
      imageContainer = this._skipTextNodes(item, 'firstChild');
      imageMobile = imageContainer.getAttribute('data-mobile');
      imageTablet = imageContainer.getAttribute('data-tablet');
      imageDesktop = imageContainer.getAttribute('data-desktop');

      /* eslint-disable max-len */
      if ((!_.isEmpty(imageMobile)) && (!_.isEmpty(imageTablet)) && (!_.isEmpty(imageDesktop))){
      /* eslint-enable */
        item.setAttribute('data-urls', 'true');
        this._setBackgroundImage(imageContainer, this.device);
      } else {
        item.setAttribute('data-urls', 'false');
      }
    });
  }

  _createArrowNav(direction, parent){
    let a, span, svg;

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

  _createArrowNavSvg(direction){
    let pathA = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let pathB = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    svg.setAttribute('fill', '#4a4a4a');
    svg.setAttribute('height', '48');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '48');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    if (direction === 'next'){
      pathA.setAttributeNS(null
                          , 'd'
                          , 'M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z');
      pathB.setAttributeNS(null
                          , 'd'
                          , 'M0-.25h24v24H0z');
    } else {
      pathA.setAttributeNS(null
                          , 'd'
                          /* eslint-disable max-len */
                          , 'M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z');
                          /* eslint-enable */
      pathB.setAttributeNS(null
                          , 'd'
                          , 'M0-.5h24v24H0z');
    }

    pathB.setAttribute('fill', 'none');

    svg.appendChild(pathA);
    svg.appendChild(pathB);

    return svg;
  }

  _createArrowNavContainer(){
    let i, li, ul;

    ul = document.createElement('ul');
    ul.className = 'carousel-arrows-container';

    for (i = 0; i < 2; i++){
      li = document.createElement('li');

      li.className = i === 0 ? 'previous' : 'next';
      this._createArrowNav(i === 0 ? 'previous' : 'next', li);

      ul.appendChild(li);
    }

    this.config.element.appendChild(ul);
  }

  _createDotsNav(){
    let a, li, span;
    let ul = this.dotsContainer.getElementsByTagName('ul')[0];

    _.forEach(this.items, ()=>{
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

  _createDotsNavContainer(){
    let div = document.createElement('div');
    let ul = document.createElement('ul');
    this.dotsContainer = document.createElement('div');

    div.className = 'carousel-dots';
    this.dotsContainer.id = 'carousel-dots-container';

    div.appendChild(ul);
    this.dotsContainer.appendChild(div);
    this.config.element.appendChild(this.dotsContainer);

    this._createDotsNav();
  }

  _dotClick(e){
    e.preventDefault();

    let index = _.indexOf(this.dots, e.target);

    if (!this.animating){
      if (this.itemActive !== index){
        this.itemOut = this.itemActive;
        this.itemActive = index;

        this._setSelected('next');
      }
    }
  }

  _getDots(){
    this.dots = this.dotsContainer.getElementsByTagName('a');

    this._addDotClickListeners();
    this._setDotAriaSelectedDefaults();
    this._setDotAriaControls();
    this._setDotClass();
  }

  _getItems(){
    /* eslint-disable max-len */
    this.items = this.config.element.querySelectorAll('.' + this.config.itemClass);
    /* eslint-enable */

    if (this.items.length > 1){
      this._createArrowNavContainer();
      this._createDotsNavContainer();
    }

    this._checkDataURLs();
    this._setItemAriaHiddenDefaults();
    this._setItemId();
  }

  _manageListeners(){
    let listenerArray = [];

    return {
      addListener: (target, event, fn)=>{
        listenerArray.push({
          target: target
          , event: event
          , fn: fn
        });

        target.addEventListener(event, fn, false);
      }

      , removeListeners: ()=>{
        if (listenerArray.length > 0){
          _.forEach(listenerArray, (cur)=>{
            cur.target.removeEventListener(cur.event, cur.fn, false);
            cur.target.className.replace(/(?:^|\s)animating(?!\S)/g, '');
          });

          listenerArray = [];
        }
      }
    };
  }

  _navigationClick(button, direction, e){
    e.preventDefault();

    if (!this.animating){
      this.itemOut = this.itemActive;

      if (direction === 'next'){
        this._next();
      } else {
        this._previous();
      }
    }
  }

  _next(){
    if (this.itemActive < this.items.length - 1){
      this.itemActive++;
    } else {
      this.itemActive = 0;
    }

    this._setSelected('next');
  }

  _previous(){
    if (this.itemActive > 0){
      this.itemActive--;
    } else {
      this.itemActive = this.items.length - 1;
    }

    this._setSelected('previous');
  }

  _restartTimer(){
    this._stopAutoPlay();

    this.timer = window.setInterval(this._startAutoPlay.bind(this), 5000);
  }

  _setBackgroundImage(imageContainer, device){
    let url = imageContainer.getAttribute('data-' + device);

    imageContainer.style.backgroundImage = 'url(' + url + ')';
  }

  _setCarouselId(){
    this.config.element.id = _.uniqueId('carousel-');
  }

  _setDotAriaControls(){
    _.forEach(this.dots, (dot, i)=>{
      dot.setAttribute('aria-controls'
                       , `${this.config.element.id}-item-${i + 1}`);
    });
  }

  _setDotAriaSelected(){
    _.forEach(this.dots, (dot)=>{
      if (dot === this.dots[this.itemActive]){
        dot.setAttribute('aria-selected', 'true');
      } else {
        let ariaSelected = dot.getAttribute('aria-selected');

        if (ariaSelected === 'true'){
          dot.setAttribute('aria-selected', 'false');
        }
      }
    });
  }

  _setDotAriaSelectedDefaults(){
    _.forEach(this.dots, (dot)=>{
      dot.setAttribute('aria-selected'
                       , dot === this.dots[this.itemActive] ?
                       'true' : 'false');
    });
  }

  _setDotClass(){
    _.forEach(this.dots, (dot)=>{
      if (dot === this.dots[this.itemActive]){
        dot.className += ' active';
      } else {
        let className = dot.className;

        if (_.includes(className, 'active')){
          dot.className = className.replace(/(?:^|\s)active(?!\S)/g, '');
        }
      }
    });
  }

  _setItemAriaHidden(){
    _.forEach(this.items, (item)=>{
      if (item === this.items[this.itemActive]){
        item.setAttribute('aria-hidden', 'false');
      } else {
        let ariaHidden = item.getAttribute('aria-hidden');

        if (ariaHidden === 'false'){
          item.setAttribute('aria-hidden', 'true');
        }
      }
    });
  }

  _setItemAriaHiddenDefaults(){
    _.forEach(this.items, (item)=>{
      item.setAttribute('aria-hidden'
                        , item === this.items[this.itemActive] ?
                        'false' : 'true');
    });
  }

  _setItemId(){
    _.forEach(this.items, (item, i)=>{
      item.id = `${this.config.element.id}-item-${i + 1}`;
    });
  }

  _setPosition(direction, position){
    let inPosition, outPosition;

    if (direction === 'next'){
      if (this.config.naturalScroll){
        inPosition = position;
        outPosition = -position;
      } else {
        inPosition = -position;
        outPosition = position;
      }
    } else if (direction === 'previous'){
      if (this.config.naturalScroll){
        inPosition = -position;
        outPosition = position;
      } else {
        inPosition = position;
        outPosition = -position;
      }
    }

    return {
      inPosition: inPosition + 'px'
      , outPosition: outPosition + 'px'
    };
  }

  _setSelected(direction){
    let position = this._setPosition(direction, this.size.width);

    this.eventManager.removeListeners();
    this.itemIn = this.itemActive;
    this._animateItemStart(this.items[this.itemIn], position.inPosition, 0);
    this._animateItemStart(this.items[this.itemOut], 0, position.outPosition);
    this._setDotAriaSelected();
    this._setDotClass();
    this._setItemAriaHidden();
  }

  _setSelectedDefaults(){
    _.forEach(this.items, (item)=>{
      item.style.left = item === this.items[this.itemActive] ?
                        0 : this.size.width + 'px';
    });

    if (this.config.autoPlay && this.items.length > 0){
      this._addFocusListeners();
      this._restartTimer();
    }
  }

  _skipTextNodes(el, method){
    let element = el[method];

    while (element !== null && element.nodeType !== 1){
      element = element.nextSibling;
    }

    return element;
  }

  _startAutoPlay(){
    this.itemOut = this.itemActive;

    if (this.itemActive < this.items.length - 1){
      this.itemActive++;
    } else {
      this.itemActive = 0;
    }

    this._setSelected('next');
  }

  _stopAutoPlay(){
    if (!this.animating && !_.isUndefined(this.timer)){
      window.clearInterval(this.timer);

      this.timer = undefined;
    }
  }

  _trackSize(device, size){
    let item = this.items[this.itemActive];

    if (this.device !== device){
      this.device = device;

      if (item.getAttribute('data-urls') === 'true'){
        let imageContainer = this._skipTextNodes(item, 'firstChild');
        this._setBackgroundImage(imageContainer, this.device);
      }
    }

    this.size = size;
  }
}

module.exports = CarouselClass;
