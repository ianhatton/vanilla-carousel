/* eslint-disable max-len, require-jsdoc */
const _ = require('lodash');
const CarouselClass = require('../src/vanilla-carousel');

function createCarousel(){
  let carouselInner = document.createElement('div');
  let carouselOuter = document.createElement('div');

  carouselInner.className = 'carousel-inner';
  carouselOuter.id = 'carousel';

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

describe('carousel', function(){
  let c, carousel, viewport;

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
      expect(carousel.eventManager.removeAll).toBeDefined();
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
      spyOn(carousel, '_getItems');
      spyOn(carousel, '_setDefaultSelected');

      carousel._render();
    });

    it('should call the _getItems function', ()=>{
      expect(carousel._getItems).toHaveBeenCalled();
    });

    it('should call the _setDefaultSelected function', ()=>{
      expect(carousel._setDefaultSelected).toHaveBeenCalled();
    });
  });

  // describe('_addDotClickListeners function', ()=>{
  //   How do I test this?
  // });

  // describe('_addFocusListeners function', ()=>{
  //   How do I test this?
  // });

  // describe('_addNextListener function', ()=>{
  //   How do I test this?
  // });

  // describe('_addPreviousListener function', ()=>{
  //   How do I test this?
  // });

  describe('_animateItemFinish function', ()=>{
    let eventSpy, item;

    beforeEach(()=>{
      carousel.animating = true;
      carousel.items = this.items;
      eventSpy = jasmine.createSpyObj('e', ['']);
      item = carousel.items[0];
      item.className += ' animating';

      carousel._animateItemFinish(item, eventSpy);
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
      spyOn(carousel, '_setBackgroundImages');
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

      it('should call the _setBackgroundImages function with imageContainer and this.device as parameters', ()=>{
        expect(carousel._setBackgroundImages).toHaveBeenCalledWith(imageContainer, 'massive swanky monitor');
      });
    });
  });

  describe('_createArrowNav function', ()=>{

  });
});
/* eslint-enable */
