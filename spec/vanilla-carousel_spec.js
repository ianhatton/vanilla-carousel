/* eslint-disable max-len, require-jsdoc */
const _ = require('lodash');
const CarouselClass = require('../src/vanilla-carousel');

function createCarousel(){
  let carouselInner = document.createElement('div');
  let carouselOuter = document.createElement('div');

  carouselInner.className = 'carousel-inner';

  carouselOuter.appendChild(carouselInner);

  createCarouselItems(carouselInner);

  document.body.appendChild(carouselOuter);

  return carouselOuter;
}

function createCarouselImageContainers(item, i){
  let dataURLDesktop, dataURLMobile, dataURLTablet;
  let carouselImageContainer = document.createElement('div');

  carouselImageContainer.className = 'carousel-image-container';

  dataURLDesktop = 'desktop.jpg';

  if (i % 2){
    dataURLMobile = '';
    dataURLTablet = '';
  } else {
    dataURLMobile = 'mobile.jpg';
    dataURLTablet = 'tablet.jpg';
  }

  carouselImageContainer.setAttribute('data-mobile', dataURLMobile);
  carouselImageContainer.setAttribute('data-tablet', dataURLTablet);
  carouselImageContainer.setAttribute('data-desktop', dataURLDesktop);

  carouselImageContainer.style.backgroundImage = "url('" + dataURLDesktop + "')";

  createCarouselOverlays(carouselImageContainer, i);

  item.appendChild(carouselImageContainer);
}

function createCarouselItems(carouselInner, items = 2){
  let item;
  let range = _.range(1, (items + 1));

  _.forEach(range, (i)=>{
    item = document.createElement('div');
    item.className = 'carousel-item';

    createCarouselImageContainers(item, i);

    carouselInner.appendChild(item);
  });
}

function createCarouselOverlays(carouselImageContainer, i){
  let carouselOverlay = document.createElement('div');
  let a = document.createElement('a');
  let subtitle = document.createElement('h3');
  let title = document.createElement('h2');

  carouselOverlay.className = 'carousel-overlay';

  if (i % 2){
    a.href = 'http://www.bobdylan.com';
    a.innerHTML = 'Bob Dylan';
    title.innerHTML = 'Bob Dylan\'s official website';
    subtitle.innerHTML = 'Blind boy grunt';
  } else {
    a.href = 'http://www.paulsimon.com';
    a.innerHTML = 'Paul Simon';
    title.innerHTML = 'Paul Simon\'s official website';
    subtitle.innerHTML = 'He\'s a tiny little showbiz man';
  }

  carouselOverlay.appendChild(title);
  carouselOverlay.appendChild(subtitle);
  carouselOverlay.appendChild(a);

  carouselImageContainer.appendChild(carouselOverlay);
}

function createDotsContainer(){
  let div = document.createElement('div');
  let dotsContainer = document.createElement('div');
  let ul = document.createElement('ul');

  div.className = 'carousel-dots';
  dotsContainer.id = 'carousel-dots-container';

  div.appendChild(ul);
  dotsContainer.appendChild(div);

  return dotsContainer;
}

function createDotsNav(dotsContainer, items){
  let a, li, span;

  let ul = dotsContainer.getElementsByTagName('ul')[0];

  _.forEach(items, function(item){
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

  return ul;
}

describe('carousel', function(){
  let c, carousel, dotsNav, viewport;

  beforeEach(()=>{
    c = createCarousel();
    viewport = CarouselClass.__get__('viewport');

    carousel = new CarouselClass({
      element: c
      , autoPlay: false
      , itemClass: 'carousel-item'
    }, false);

    // For testing
    this.items = carousel.config.element.querySelectorAll('.' + carousel.config.itemClass);
    this.dotsContainer = createDotsContainer();
    dotsNav = createDotsNav(this.dotsContainer, this.items);
    this.dots = dotsNav.getElementsByTagName('a');
  });

  it('should exist', ()=>{
    expect(carousel).toBeDefined();
  });

  describe('_init function', ()=>{
    beforeEach(()=>{
      spyOn(carousel, '_render');

      carousel._init();
    });

    it('should set this.animating to false', ()=>{
      expect(carousel.animating).toBeFalsy();
    });

    it('should set this.eventManager to be a call to the _manageListeners function', ()=>{
      expect(carousel.eventManager.addListener).toBeDefined();
      expect(carousel.eventManager.removeListeners).toBeDefined();
    });

    it('should set this.itemActive to 0', ()=>{
      expect(carousel.itemActive).toEqual(0);
    });

    it('should set this.items be an empty array', ()=>{
      expect(carousel.items.length).toEqual(0);
    });

    it('should call the _render function', ()=>{
      expect(carousel._render).toHaveBeenCalled();
    });
  });

  describe('_initViewport function', ()=>{
    beforeEach(()=>{
      spyOn(viewport, 'getDevice').and.returnValue('massive swanky monitor');
      spyOn(viewport, 'windowSize').and.returnValue('99999px');
      spyOn(viewport, 'trackSize');

      carousel._initViewport();
    });

    it('should set this.device to the viewport.getDevice function', ()=>{
      expect(carousel.device).toEqual('massive swanky monitor');
    });

    it('should set this.size to the viewport.windowSize function', ()=>{
      expect(carousel.size).toEqual('99999px');
    });

    it('should call the viewport.trackSize function', ()=>{
      expect(viewport.trackSize).toHaveBeenCalled();
    });
  });

  describe('_render function', ()=>{
    beforeEach(()=>{
      spyOn(carousel, '_setCarouselId');
      spyOn(carousel, '_getItems');
      spyOn(carousel, '_setSelectedDefaults');

      carousel._render();
    });

    it('should call the _setCarouselId function', ()=>{
      expect(carousel._setCarouselId).toHaveBeenCalled();
    });

    it('should call the _getItems function', ()=>{
      expect(carousel._getItems).toHaveBeenCalled();
    });

    it('should call the _setSelectedDefaults function', ()=>{
      expect(carousel._setSelectedDefaults).toHaveBeenCalled();
    });
  });

  // describe('_addDotClickListeners function', ()=>{
  //   How do I test this?
  // });

  // describe('_addFocusListeners function', ()=>{
  //   How do I test this?
  // });

  // describe('_addNavigationListener function', ()=>{
  //   How do I test this?
  // });

  describe('_animateItemFinish function', ()=>{
    let item;

    beforeEach(()=>{
      carousel.animating = true;
      carousel.items = this.items;
      item = carousel.items[0];
      item.className += ' animating';

      carousel._animateItemFinish(item);
    });

    it('should set this.animating to false', ()=>{
      expect(carousel.animating).toBeFalsy();
    });

    it('should remove the "animating" class from the item', ()=>{
      expect(item.className).not.toContain('animating');
    });
  });

  describe('_animateItemStart function', ()=>{
    let item;

    beforeEach((done)=>{
      carousel.animating = false;
      carousel.eventManager = carousel._manageListeners();
      carousel.items = this.items;
      item = carousel.items[0];

      spyOn(carousel.eventManager, 'addListener');

      carousel._animateItemStart(item, -1000, 0);
      done();
    });

    it('should set this.animating to true', (done)=>{
      setTimeout(function(){
        expect(carousel.animating).toBeTruthy();
        done();
      }, 100);
    });

    it('should set the left property of the carousel item to value of the end parameter', (done)=>{
      setTimeout(function(){
        expect(item.style.left).toEqual('0px');
        done();
      }, 100);
    });

    it('should add the "animating" class to the carousel item', (done)=>{
      setTimeout(function(){
        expect(item.className).toContain('animating');
        done();
      }, 100);
    });

    it('should call the eventManager.addListener function', ()=>{
      expect(carousel.eventManager.addListener).toHaveBeenCalled();
    });
  });

  describe('_checkDataURLs function', ()=>{
    let imageContainer, item;

    beforeEach(()=>{
      carousel.items = this.items;
      item = carousel.items[0];
      imageContainer = item.children[0];

      spyOn(carousel, '_skipTextNodes').and.returnValue(imageContainer);
      spyOn(carousel, '_setBackgroundImage');
    });

    describe('when there is only a desktop image', ()=>{
      beforeEach(()=>{
        carousel._checkDataURLs();
      });

      it("should set the item's 'data-urls' attribute to be 'false'", ()=>{
        expect(item.getAttribute('data-urls')).toEqual('false');
      });
    });

    describe('when there are mobile, tablet and desktop images', ()=>{
      beforeEach(()=>{
        carousel.device = 'massive swanky monitor';
        imageContainer.setAttribute('data-mobile', 'mobile.jpg');
        imageContainer.setAttribute('data-tablet', 'tablet.jpg');

        carousel._checkDataURLs();
      });

      it("should set the item's 'data-urls' attribute to be 'true'", ()=>{
        expect(item.getAttribute('data-urls')).toEqual('true');
      });

      it('should call the _setBackgroundImage function with imageContainer and this.device as parameters', ()=>{
        expect(carousel._setBackgroundImage).toHaveBeenCalledWith(imageContainer, 'massive swanky monitor');
      });
    });
  });

  describe('_createArrowNav function', ()=>{
    let li, svg, ul;

    beforeEach(()=>{
      li = document.createElement('li');
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      ul = document.createElement('ul');

      ul.className = 'carousel-arrows-container';

      ul.appendChild(li);

      spyOn(carousel, '_addNavigationListener');
      spyOn(carousel, '_createArrowNavSvg').and.returnValue(svg);

      carousel._createArrowNav('next', li);
    });

    it('should call the _createArrowNavSvg function with the direction as a parameter', ()=>{
      expect(carousel._createArrowNavSvg).toHaveBeenCalledWith('next');
    });

    it('should call the _addNavigationListener function with the direction as a parameter', ()=>{
      expect(carousel._addNavigationListener.calls.mostRecent().args[1]).toEqual('next');
    });
  });

  describe('_createArrowNavContainer', ()=>{
    beforeEach(()=>{
      spyOn(carousel, '_createArrowNav');

      carousel._createArrowNavContainer();
    });

    it('should call the _createArrowNav function', ()=>{
      expect(carousel._createArrowNav).toHaveBeenCalled();
    });
  });

  // describe('_createArrowNavSvg function', ()=>{
  //  I don't see the point in testing this
  // });

  describe('_createDotsNav function', ()=>{
    let listItems, ul;

    beforeEach(()=>{
      carousel.dotsContainer = this.dotsContainer;
      carousel.items = this.items;
      ul = this.dotsContainer.getElementsByTagName('ul')[0];
      listItems = ul.querySelectorAll('li');

      _.forEach(listItems, (li)=>{
        li.parentNode.removeChild(li);
      });

      spyOn(carousel, '_getDots');

      carousel._createDotsNav();
    });

    it('should create a dot navigation item for each of this.items', ()=>{
      expect(ul.querySelectorAll('li').length).toEqual(2);
    });

    it('should call the _getDots function', ()=>{
      expect(carousel._getDots).toHaveBeenCalled();
    });
  });

  describe('_createDotsNavContainer', ()=>{
    beforeEach(()=>{
      spyOn(carousel, '_createDotsNav');

      carousel._createDotsNavContainer();
    });

    it('should create this.dotsContainer', ()=>{
      expect(carousel.dotsContainer.id).toEqual('carousel-dots-container');
    });

    it('should call the _createDotsNav function', ()=>{
      expect(carousel._createDotsNav).toHaveBeenCalled();
    });
  });

  describe('_dotClick function', ()=>{
    let clickSpy;

    beforeEach(()=>{
      carousel.dots = this.dots;

      clickSpy = jasmine.createSpyObj('e', ['preventDefault', 'target']);

      spyOn(carousel, '_setSelected');
    });

    describe('under all circumstances', ()=>{
      beforeEach(()=>{
        carousel._dotClick(clickSpy);
      });

      it('should call e.preventDefault', ()=>{
        expect(clickSpy.preventDefault).toHaveBeenCalled();
      });
    });

    describe('when this.animating is false', ()=>{
      beforeEach(()=>{
        carousel.animating = false;
        carousel.itemActive = 0;
        carousel.itemOut = 1;

        carousel._dotClick(clickSpy);
      });

      it('should set this.itemOut to be the value of this.itemActive', ()=>{
        expect(carousel.itemOut).toEqual(0);
      });

      it('should set this.active to be the value of index', ()=>{
        expect(carousel.itemActive).toEqual(-1);
      });

      it('should call the _setSelected function', ()=>{
        expect(carousel._setSelected).toHaveBeenCalled();
      });
    });

    describe('when this.animating is true', ()=>{
      beforeEach(()=>{
        carousel.animating = true;
        carousel.itemActive = 0;
        carousel.itemOut = 1;

        carousel._dotClick(clickSpy);
      });

      it('should not set this.itemOut to be the value of this.itemActive', ()=>{
        expect(carousel.itemOut).not.toEqual();
      });

      it('should not set this.active to be the value of index', ()=>{
        expect(carousel.itemActive).not.toEqual(-1);
      });

      it('should not call the _setSelected function', ()=>{
        expect(carousel._setSelected).not.toHaveBeenCalled();
      });
    });
  });

  describe('_getDots function', ()=>{
    beforeEach(()=>{
      carousel.dotsContainer = this.dotsContainer;

      spyOn(carousel, '_addDotClickListeners');
      spyOn(carousel, '_setDotAriaSelectedDefaults');
      spyOn(carousel, '_setDotAriaControls');
      spyOn(carousel, '_setDotClass');

      carousel._getDots();
    });

    it('should call the _addDotClickListeners function', ()=>{
      expect(carousel._addDotClickListeners).toHaveBeenCalled();
    });

    it('should call the _setDotAriaSelectedDefaults function', ()=>{
      expect(carousel._setDotAriaSelectedDefaults).toHaveBeenCalled();
    });

    it('should call the _setDotAriaControls function', ()=>{
      expect(carousel._setDotAriaControls).toHaveBeenCalled();
    });

    it('should call the _setDotClass function', ()=>{
      expect(carousel._setDotClass).toHaveBeenCalled();
    });
  });

  describe('_getItems function', ()=>{
    beforeEach(()=>{
      spyOn(carousel, '_checkDataURLs');
      spyOn(carousel, '_createArrowNavContainer');
      spyOn(carousel, '_createDotsNavContainer');
      spyOn(carousel, '_setItemAriaHiddenDefaults');
      spyOn(carousel, '_setItemId');
    });

    describe('under all circumstances', ()=>{
      beforeEach(()=>{
        carousel._getItems();
      });

      it('should call the _checkDataURLs function', ()=>{
        expect(carousel._checkDataURLs).toHaveBeenCalled();
      });

      it('should call the _setItemAriaHiddenDefaults function', ()=>{
        expect(carousel._setItemAriaHiddenDefaults).toHaveBeenCalled();
      });

      it('should call the _setItemId function', ()=>{
        expect(carousel._setItemId).toHaveBeenCalled();
      });
    });

    describe('when there is more than 1 item in this.items', ()=>{
      beforeEach(()=>{
        carousel._getItems();
      });

      it('should call the _createArrowNavContainer function', ()=>{
        expect(carousel._createArrowNavContainer).toHaveBeenCalled();
      });

      it('should call the _createDotsNavContainer function', ()=>{
        expect(carousel._createDotsNavContainer).toHaveBeenCalled();
      });
    });

    describe('when there is only 1 item in this.items', ()=>{
      let itemTwo;

      beforeEach(()=>{
        itemTwo = this.items[1];

        itemTwo.parentNode.removeChild(itemTwo);

        carousel._getItems();
      });

      it('should not call the _createArrowNavContainer function', ()=>{
        expect(carousel._createArrowNavContainer).not.toHaveBeenCalled();
      });

      it('should not call the _createDotsNavContainer function', ()=>{
        expect(carousel._createDotsNavContainer).not.toHaveBeenCalled();
      });
    });
  });

  describe('_manageListeners function', ()=>{
    let eventManager;

    beforeEach(()=>{
      eventManager = carousel._manageListeners();
    });

    it('should return the addListener function', ()=>{
      expect(eventManager.addListener).toBeDefined();
    });

    it('should return the removeListeners function', ()=>{
      expect(eventManager.removeListeners).toBeDefined();
    });
  });

  describe('_navigationClick function', ()=>{
    let a, clickSpy;

    beforeEach(()=>{
      a = document.createElement('a');
      a.setAttribute('href', "#");

      carousel.itemActive = 0;
      carousel.itemOut = 1;

      clickSpy = jasmine.createSpyObj('e', ['preventDefault']);

      spyOn(carousel, '_next');
      spyOn(carousel, '_previous');
    });

    describe('under all circumstances', ()=>{
      beforeEach(()=>{
        carousel._navigationClick(a, 'next', clickSpy);
      });

      it('should call e.preventDefault', ()=>{
        expect(clickSpy.preventDefault).toHaveBeenCalled();
      });
    });

    describe('when this.animating is false', ()=>{
      beforeEach(()=>{
        carousel.animating = false;
      });

      describe('under all circumstances', ()=>{
        beforeEach(()=>{
          carousel._navigationClick(a, 'next', clickSpy);
        });

        it('should set this.itemOut to be the value of this.itemActive', ()=>{
          expect(carousel.itemOut).toEqual(0);
        });
      });

      describe('and the direction parameter is "next"', ()=>{
        beforeEach(()=>{
          carousel._navigationClick(a, 'next', clickSpy);
        });

        it('should call the _next function', ()=>{
          expect(carousel._next).toHaveBeenCalled();
        });

        it('should not call the _previous function', ()=>{
          expect(carousel._previous).not.toHaveBeenCalled();
        });
      });

      describe('and the direction parameter is "previous"', ()=>{
        beforeEach(()=>{
          carousel._navigationClick(a, 'previous', clickSpy);
        });

        it('should call the _previous function', ()=>{
          expect(carousel._previous).toHaveBeenCalled();
        });

        it('should not call the _next function', ()=>{
          expect(carousel._next).not.toHaveBeenCalled();
        });
      });
    });

    describe('when this.animating is true', ()=>{
      beforeEach(()=>{
        carousel.animating = true;

        carousel._navigationClick(a, 'next', clickSpy);
      });

      it('should not set this.itemOut to be the value of this.itemActive', ()=>{
        expect(carousel.itemOut).not.toEqual(0);
      });

      it('should not call the _previous function', ()=>{
        expect(carousel._previous).not.toHaveBeenCalled();
      });

      it('should not call the _next function', ()=>{
        expect(carousel._next).not.toHaveBeenCalled();
      });
    });
  });

  describe('_next function', ()=>{
    beforeEach(()=>{
      carousel.items = this.items;

      spyOn(carousel, '_setSelected');
    });

    describe('under all circumstances', ()=>{
      beforeEach(()=>{
        carousel._next();
      });

      it('should call the _setSelected function with "next" as a parameter', ()=>{
        expect(carousel._setSelected).toHaveBeenCalledWith('next');
      });
    });

    describe('when this.itemActive is less than this.items.length - 1', ()=>{
      beforeEach(()=>{
        carousel.itemActive = 0;
        carousel._next();
      });

      it('should increment this.itemActive by 1', ()=>{
        expect(carousel.itemActive).toEqual(1);
      });
    });

    describe('when this.itemActive is greater than this.items.length - 1', ()=>{
      beforeEach(()=>{
        carousel.itemActive = 2;
        carousel._next();
      });

      it('should set this.itemActive to 0', ()=>{
        expect(carousel.itemActive).toEqual(0);
      });
    });
  });

  describe('_previous function', ()=>{
    beforeEach(()=>{
      carousel.items = this.items;

      spyOn(carousel, '_setSelected');
    });

    describe('under all circumstances', ()=>{
      beforeEach(()=>{
        carousel._previous();
      });

      it('should call the _setSelected function with "previous" as a parameter', ()=>{
        expect(carousel._setSelected).toHaveBeenCalledWith('previous');
      });
    });

    describe('when this.itemActive is greater than 0', ()=>{
      beforeEach(()=>{
        carousel.itemActive = 1;
        carousel._previous();
      });

      it('should decrement this.itemActive by 1', ()=>{
        expect(carousel.itemActive).toEqual(0);
      });
    });

    describe('when this.itemActive is not greater than 0', ()=>{
      beforeEach(()=>{
        carousel.itemActive = 0;
        carousel._previous();
      });

      it('should set this.itemActive to this.items.length - 1', ()=>{
        expect(carousel.itemActive).toEqual(1);
      });
    });
  });

  describe('_restartTimer function', ()=>{
    beforeEach(()=>{
      spyOn(carousel, '_stopAutoPlay');

      carousel._restartTimer();
    });

    it('should call the _stopAutoPlay function', ()=>{
      expect(carousel._stopAutoPlay).toHaveBeenCalled();
    });

    it('should set this.timer', ()=>{
      expect(carousel.timer).toBeDefined();
    });
  });

  describe('_setBackgroundImage function', ()=>{
    let imageContainer, item;

    beforeEach(()=>{
      item = this.items[1];
      imageContainer = item.children[0];
      this.device = 'mobile';

      carousel._setBackgroundImage(imageContainer, this.device);
    });

    it('should set the background image of the image container according to the device parameter', ()=>{
      expect(imageContainer.style.backgroundImage).toContain('mobile');
    });
  });

  describe('_setCarouselId function', ()=>{
    beforeEach(()=>{
      carousel._setCarouselId();
    });

    it('should set this.config.element.id to be "carousel-" followed by a unique ID', ()=>{
      expect(carousel.config.element.id).toContain('carousel-');
    });
  });

  describe('_setDotAriaControls function', ()=>{
    let a;

    beforeEach(()=>{
      carousel.config.element.id = 'carousel-123';
      carousel.items = this.items;
      carousel.dots = this.dots;

      carousel._setDotAriaControls();
    });

    it("should set each dot's 'aria-controls' attribute to be the carousel id followed by the dot's index plus 1", ()=>{
      expect(carousel.dots[0].getAttribute('aria-controls')).toEqual('carousel-123-item-1');
    });
  });

  describe('_setDotAriaSelected function', ()=>{
    beforeEach(()=>{
      carousel.dots = this.dots;
      carousel.itemActive = 0;

      carousel.dots[1].setAttribute('aria-selected', 'true');

      carousel._setDotAriaSelected();
    });

    it("should set the active dot's 'aria-selected' attribute to be 'true'", ()=>{
      expect(carousel.dots[0].getAttribute('aria-selected')).toEqual('true');
    });

    it("should set the previously active dot's 'aria-selected' attribute to be 'false'", ()=>{
      expect(carousel.dots[1].getAttribute('aria-selected')).toEqual('false');
    });
  });

  describe('_setDotAriaSelectedDefaults function', ()=>{
    beforeEach(()=>{
      carousel.dots = this.dots;
      carousel.itemActive = 0;

      carousel._setDotAriaSelectedDefaults();
    });

    it("should set the active dot's 'aria-selected' attribute to be 'true'", ()=>{
      expect(carousel.dots[0].getAttribute('aria-selected')).toEqual('true');
    });

    it("should set the all other dots' aria-selected' attributes to be 'false'", ()=>{
      expect(carousel.dots[1].getAttribute('aria-selected')).toEqual('false');
    });
  });

  describe('_setDotClass function', ()=>{
    let a;

    beforeEach(()=>{
      carousel.dots = this.dots;
      carousel.itemActive = 0;

      carousel.dots[1].className = 'active';

      carousel._setDotClass();
    });

    it('should add the "active" class to the active dot', ()=>{
      expect(carousel.dots[0].className).toContain('active');
    });

    it('should remove the "active" class from the previously active dot', ()=>{
      expect(carousel.dots[1].className).not.toContain('active');
    });
  });

  describe('_setItemAriaHidden function', ()=>{
    beforeEach(()=>{
      carousel.items = this.items;
      carousel.itemActive = 0;

      carousel.items[1].setAttribute('aria-hidden', 'false');

      carousel._setItemAriaHidden();
    });

    it("should set the active item's 'aria-hidden' attribute to be 'false'", ()=>{
      expect(carousel.items[0].getAttribute('aria-hidden')).toEqual('false');
    });

    it("should set the previously active item's 'aria-hidden' attribute to be 'true'", ()=>{
      expect(carousel.items[1].getAttribute('aria-hidden')).toEqual('true');
    });
  });

  describe('_setItemAriaHiddenDefaults function', ()=>{
    beforeEach(()=>{
      carousel.items = this.items;
      carousel.itemActive = 0;

      carousel._setItemAriaHiddenDefaults();
    });

    it("should set the active item's 'aria-hidden' attribute to be 'false'", ()=>{
      expect(carousel.items[0].getAttribute('aria-hidden')).toEqual('false');
    });

    it("should set the all other items' aria-hidden' attributes to be 'true'", ()=>{
      expect(carousel.items[1].getAttribute('aria-hidden')).toEqual('true');
    });
  });

  describe('_setItemId function', ()=>{
    beforeEach(()=>{
      carousel.config.element.id = 'carousel-123';
      carousel.items = this.items;

      carousel._setItemId();
    });

    it("should set each item's id to be the carousel id followed by '-item-' followed by the item's index plus 1", ()=>{
      expect(carousel.items[0].id).toEqual('carousel-123-item-1');
    });
  });

  describe('_setPosition function', ()=>{
    let direction, functionCall, position;

    beforeEach(()=>{
      position = '1000';
    });

    describe('under all circumstances', ()=>{
      beforeEach(()=>{
        direction = 'next';

        functionCall = carousel._setPosition(direction, position);
      });

      it('should return the inPosition method ', ()=>{
        expect(functionCall.inPosition).toBeDefined();
      });

      it('should return the outPosition method ', ()=>{
        expect(functionCall.outPosition).toBeDefined();
      });
    });

    describe('when the direction parameter is "next"', ()=>{
      beforeEach(()=>{
        direction = 'next';
      });

      describe('and this.config.naturalScroll is true', ()=>{
        beforeEach(()=>{
          carousel.config.naturalScroll = true;

          functionCall = carousel._setPosition(direction, position);
        });

        it('the inPosition method should return the position parameter expressed as a positive pixel value', ()=>{
          expect(functionCall.inPosition).toEqual('1000px');
        });

        it('the outPosition method should return the position parameter expressed as a negative pixel value', ()=>{
          expect(functionCall.outPosition).toEqual('-1000px');
        });
      });

      describe('and this.config.naturalScroll is false', ()=>{
        beforeEach(()=>{
          carousel.config.naturalScroll = false;

          functionCall = carousel._setPosition(direction, position);
        });

        it('the inPosition method should return the position parameter expressed as a negative pixel value', ()=>{
          expect(functionCall.inPosition).toEqual('-1000px');
        });

        it('the outPosition method should return the position parameter expressed as a positive pixel value', ()=>{
          expect(functionCall.outPosition).toEqual('1000px');
        });
      });
    });

    describe('when the direction parameter is "previous"', ()=>{
      beforeEach(()=>{
        direction = 'previous';
      });

      describe('and this.config.naturalScroll is true', ()=>{
        beforeEach(()=>{
          carousel.config.naturalScroll = true;

          functionCall = carousel._setPosition(direction, position);
        });

        it('the inPosition method should return the position parameter expressed as a negative pixel value', ()=>{
          expect(functionCall.inPosition).toEqual('-1000px');
        });

        it('the outPosition method should return the position parameter expressed as a positive pixel value', ()=>{
          expect(functionCall.outPosition).toEqual('1000px');
        });
      });

      describe('and this.config.naturalScroll is false', ()=>{
        beforeEach(()=>{
          carousel.config.naturalScroll = false;

          functionCall = carousel._setPosition(direction, position);
        });

        it('the inPosition method should return the position parameter expressed as a positive pixel value', ()=>{
          expect(functionCall.inPosition).toEqual('1000px');
        });

        it('the outPosition method should return the position parameter expressed as a negative pixel value', ()=>{
          expect(functionCall.outPosition).toEqual('-1000px');
        });
      });
    });
  });

  describe('_setSelected function', ()=>{
    let direction, itemIn, itemOut, ul;

    beforeEach(()=>{
      carousel.dots = this.dots;
      carousel.eventManager = carousel._manageListeners();
      carousel.itemActive = 1;
      carousel.itemIn = 1;
      carousel.itemOut = 0;
      carousel.items = this.items;
      carousel.size = {
        height: 391
        , width: 1280
      };
      itemIn = this.items[1];
      itemOut = this.items[0];

      spyOn(carousel, '_animateItemStart');
      spyOn(carousel, '_setDotAriaSelected');
      spyOn(carousel, '_setDotClass');
      spyOn(carousel, '_setItemAriaHidden');
      spyOn(carousel, '_setPosition').and.returnValue({inPosition: '1000px', outPosition: '-1000px'});
      spyOn(carousel.eventManager, 'removeListeners');

      carousel._setSelected('next');
    });

    it('should call the carousel.eventManager.removeListeners function', ()=>{
      expect(carousel.eventManager.removeListeners).toHaveBeenCalled();
    });

    it('should set this.itemIn to be the value of this.itemActive', ()=>{
      expect(carousel.itemIn).toEqual(1);
    });

    it('should call the _animateItemStart function', ()=>{
      expect(carousel._animateItemStart).toHaveBeenCalled();
    });

    it('should call the _animateItemStart function with the right parameters for the first call', ()=>{
      expect(carousel._animateItemStart.calls.argsFor(0)).toEqual([itemIn, '1000px', 0]);
    });

    it('should call the _animateItemStart function with the right parameters for the second call', ()=>{
      expect(carousel._animateItemStart.calls.argsFor(1)).toEqual([itemOut, 0, '-1000px']);
    });

    it('should call the _setDotAriaSelected function', ()=>{
      expect(carousel._setDotAriaSelected).toHaveBeenCalled();
    });

    it('should call the _setDotClass function', ()=>{
      expect(carousel._setDotClass).toHaveBeenCalled();
    });

    it('should call the _setItemAriaHidden function', ()=>{
      expect(carousel._setItemAriaHidden).toHaveBeenCalled();
    });
  });

  describe('_setSelectedDefaults function', ()=>{
    let itemOne, itemTwo;

    beforeEach(()=>{
      carousel.items = this.items;
      carousel.itemActive = 0;
      carousel.size = {
        height: 391
        , width: 1280
      };
      itemOne = this.items[0];
      itemTwo = this.items[1];
    });

    describe('under all circumstances', ()=>{
      beforeEach(()=>{
        carousel._setSelectedDefaults();
      });

      it('should set the left CSS property of the active item to 0px', ()=>{
        expect(itemOne.style.left).toEqual('0px');
      });

      it('should set the left CSS property of the inactive items to be the same as carousel.size.width', ()=>{
        expect(itemTwo.style.left).toEqual('1280px');
      });
    });

    describe('when this.config.autoPlay is true and items.length is greater than 0', ()=>{
      beforeEach(()=>{
        carousel.config.autoPlay = true;

        spyOn(carousel, '_addFocusListeners');
        spyOn(carousel, '_restartTimer');

        carousel._setSelectedDefaults();
      });

      it('should call the _addFocusListeners function', ()=>{
        expect(carousel._addFocusListeners).toHaveBeenCalled();
      });

      it('should call the _restartTimer function', ()=>{
        expect(carousel._restartTimer).toHaveBeenCalled();
      });
    });

    describe('when this.config.autoPlay is true and items.length is 0', ()=>{
      beforeEach(()=>{
        carousel.config.autoPlay = true;

        carousel.items = [];

        spyOn(carousel, '_addFocusListeners');
        spyOn(carousel, '_restartTimer');

        carousel._setSelectedDefaults();
      });

      it('should not call the _addFocusListeners function', ()=>{
        expect(carousel._addFocusListeners).not.toHaveBeenCalled();
      });

      it('should not call the _restartTimer function', ()=>{
        expect(carousel._restartTimer).not.toHaveBeenCalled();
      });
    });

    describe('when this.config.autoPlay is false and items.length is greater than 0', ()=>{
      beforeEach(()=>{
        carousel.config.autoPlay = false;

        spyOn(carousel, '_addFocusListeners');
        spyOn(carousel, '_restartTimer');

        carousel._setSelectedDefaults();
      });

      it('should not call the _addFocusListeners function', ()=>{
        expect(carousel._addFocusListeners).not.toHaveBeenCalled();
      });

      it('should not call the _restartTimer function', ()=>{
        expect(carousel._restartTimer).not.toHaveBeenCalled();
      });
    });

    describe('when this.config.autoPlay is false and items.length is 0', ()=>{
      beforeEach(()=>{
        carousel.config.autoPlay = false;

        carousel.items = [];

        spyOn(carousel, '_addFocusListeners');
        spyOn(carousel, '_restartTimer');

        carousel._setSelectedDefaults();
      });

      it('should not call the _addFocusListeners function', ()=>{
        expect(carousel._addFocusListeners).not.toHaveBeenCalled();
      });

      it('should not call the _restartTimer function', ()=>{
        expect(carousel._restartTimer).not.toHaveBeenCalled();
      });
    });
  });

  describe('_startAutoPlay function', ()=>{
    beforeEach(()=>{
      carousel.items = this.items;

      spyOn(carousel, '_setSelected');
    });

    describe('under all circumstances', ()=>{
      beforeEach(()=>{
        carousel.itemActive = 0;

        carousel._startAutoPlay();
      });

      it('should set this.itemOut to be the same value as this.itemActive', ()=>{
        expect(carousel.itemOut).toEqual(0);
      });

      it('should call the _setSelected function with "next" as a parameter', ()=>{
        expect(carousel._setSelected).toHaveBeenCalledWith('next');
      });
    });

    describe('when this.itemActive is less than this.items.length - 1', ()=>{
      beforeEach(()=>{
        carousel.itemActive = 0;

        carousel._startAutoPlay();
      });

      it('should increment this.itemActive by 1', ()=>{
        expect(carousel.itemActive).toEqual(1);
      });
    });

    describe('when this.itemActive is greater than this.items.length - 1', ()=>{
      beforeEach(()=>{
        carousel.itemActive = 2;

        carousel._startAutoPlay();
      });

      it('should set this.itemActive to 0', ()=>{
        expect(carousel.itemActive).toEqual(0);
      });
    });
  });
});
/* eslint-enable */
