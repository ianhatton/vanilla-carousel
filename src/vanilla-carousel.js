const _              = require('lodash/core');
_.difference         = require('lodash/difference');
_.includes           = require('lodash/includes');
_.times              = require('lodash/times');
const ViewportDetect = require('viewport-detection-es6');

const viewport = new ViewportDetect();

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
    this.hasDataURLs = false;
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
    this._getItems();
    this._setDefaultSelected();
  }

  _addDotClickListeners(){
    _.forEach(this.dots, function(dot){
      dot.addEventListener('click', this._dotClick.bind(this), false);
    }.bind(this));
  }

  _addFocusListeners(){
    this.config.element.addEventListener('mouseenter'
                                        , this._stopAutoPlay.bind(this)
                                        , false);

    this.config.element.addEventListener('mouseleave'
                                        , this._restartTimer.bind(this)
                                        , false);
  }

  _addNextListener(){
    this.nextButton.addEventListener('click'
                                    , this._next.bind(this)
                                    , false);
  }

  _addPreviousListener(){
    this.previousButton.addEventListener('click'
                                        , this._previous.bind(this)
                                        , false);
  }

  _animateItemFinish(e){
    let item = e.target;

    _.defer(()=>{
      this.animating = false;
    });

    item.className = item.className.replace(/(?:^|\s)animating(?!\S)/g, '');
  }

  _animateItemStart(item, st, end){
    item.style.left = st;

    _.delay(()=>{
      this.animating = true;
      item.style.left = end;
      item.className += ' animating';
    }, 100);

    this.eventManager.addListener(item
                                 , 'transitionend'
                                 , this._animateItemFinish.bind(this));
  }

  _checkDataURLs(){
    let imageContainer, imageMobile, imageTablet, imageDesktop;

    _.forEach(this.items, function(item){
      imageContainer = this._skipTextNodes(item, 'firstChild');
      imageMobile = imageContainer.getAttribute('data-mobile');
      imageTablet = imageContainer.getAttribute('data-tablet');
      imageDesktop = imageContainer.getAttribute('data-desktop');

      /* eslint-disable max-len */
      if ((!_.isNull(imageMobile) && !_.includes(imageMobile, 'null')) && (!_.isNull(imageTablet) && !_.includes(imageTablet, 'null')) && (!_.isNull(imageDesktop) && !_.includes(imageDesktop, 'null'))){
      /* eslint-enable */
        this.hasDataURLs = true;
        this._setBackgroundImages(this.device);
      }
    }.bind(this));
  }

  _createArrowNav(direction, parent){
    let a, span, svg;

    a = document.createElement('a');
    span = document.createElement('span');

    a.id = 'carousel-' + direction;
    a.setAttribute('href', '#');

    if (direction === 'previous'){
      span.innerHTML = 'Previous';
      a.appendChild(span);
      svg = this._createArrowNavSvg(direction);
      a.appendChild(svg);
      this.previousButton = a;
      this._addPreviousListener();
    } else {
      span.innerHTML = 'Next';
      a.appendChild(span);
      svg = this._createArrowNavSvg(direction);
      a.appendChild(svg);
      this.nextButton = a;
      this._addNextListener();
    }

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
    let li, ul;

    ul = document.createElement('ul');
    ul.className = 'carousel-arrows-container';

    _.times(2, function(i){
      li = document.createElement('li');

      li.className = i === 0 ? 'previous' : 'next';
      this._createArrowNav(i === 0 ? 'previous' : 'next', li);

      ul.appendChild(li);
    }.bind(this));

    this.config.element.appendChild(ul);
  }

  _createDotsNav(){
    let a, li;
    let ul = this.dotsContainer.getElementsByTagName('ul')[0];

    _.forEach(this.items, function(item){
      a = document.createElement('a');
      li = document.createElement('li');

      a.setAttribute('href', '#');

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

        this._setDotClass(e.target);
        this._setSelected('next');
      }
    }
  }

  _getDots(){
    this.dots = this.dotsContainer.getElementsByTagName('a');

    this._addDotClickListeners();
    this._setDotClass((this.dots[this.itemActive]));
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

      , removeAll: ()=>{
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

  _next(e){
    e.preventDefault();

    if (!this.animating){
      this.itemOut = this.itemActive;

      if (this.itemActive < this.items.length - 1){
        this.itemActive++;
      } else {
        this.itemActive = 0;
      }

      this._setSelected('next');
    }
  }

  _previous(e){
    e.preventDefault();

    if (!this.animating){
      this.itemOut = this.itemActive;

      if (this.itemActive > 0){
        this.itemActive--;
      } else {
        this.itemActive = this.items.length - 1;
      }

      this._setSelected('previous');
    }
  }

  _restartTimer(){
    if (!this.animating || this.items.length < 2){
      this._stopAutoPlay();
      this.timer = window.setInterval(this._startAutoPlay.bind(this), 5000);
    }
  }

  _setBackgroundImages(device){
    _.forEach(this.items, function(item){
      let imageContainer = this._skipTextNodes(item, 'firstChild');

      let url = imageContainer.getAttribute('data-' + device);

      imageContainer.style.backgroundImage = 'url(' + url + ')';
    }.bind(this));
  }

  _setDefaultSelected(){
    let items = _.difference(this.items, [this.items[this.itemActive]]);
    let windowWidth = this.config.element.clientWidth;

    this.items[this.itemActive].style.left = 0;

    if (items.length > 0){
      _.forEach(items, function(item){
        item.style.left = windowWidth + 'px';
      });
    }

    if (this.config.autoPlay && items.length > 0){
      this._addFocusListeners();
      this._restartTimer();
    }
  }

  _setDotClass(clickedDot){
    _.forEach(this.dots, function(dot){
      let className = dot.className;

      dot.className = className.replace(/(?:^|\s)active(?!\S)/g, '');
    });

    clickedDot.className += ' active';
  }

  _setPosition(direction, position){
    let inPos, outPos;

    if (direction === 'next'){
      if (this.config.naturalScroll){
        inPos = position + 'px';
        outPos = -position + 'px';
      } else {
        inPos = -position + 'px';
        outPos = position + 'px';
      }
    } else if (direction === 'previous'){
      if (this.config.naturalScroll){
        inPos = -position + 'px';
        outPos = position + 'px';
      } else {
        inPos = position + 'px';
        outPos = -position + 'px';
      }
    }

    return {
      inPos: inPos
      , outPos: outPos
    };
  }

  _setSelected(direction){
    let windowWidth = this.config.element.clientWidth;
    let pos = this._setPosition(direction, windowWidth);

    this.eventManager.removeAll();
    this.itemIn = this.itemActive;
    this._animateItemStart(this.items[this.itemIn], pos.inPos, 0);
    this._animateItemStart(this.items[this.itemOut], 0, pos.outPos);
    this._setDotClass((this.dots[this.itemActive]));
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
    if (this.device !== device){
      this.device = device;

      if (this.hasDataURLs){
        this._setBackgroundImages(this.device);
      }
    }

    this.size = size;
  }
}

module.exports = CarouselClass;
