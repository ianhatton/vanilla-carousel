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
    dataURLMobile = 'null';
    dataURLTablet = 'null';
  } else {
    dataURLMobile = 'mobile.jpg';
    dataURLTablet = 'tablet.jpg';
  }

  carouselImageContainer.setAttribute('data-mobile', dataURLMobile);
  carouselImageContainer.setAttribute('data-tablet', dataURLTablet);
  carouselImageContainer.setAttribute('data-desktop', dataURLDesktop);

  /* eslint-disable max-len */
  carouselImageContainer.style.backgroundImage = "url('" + dataURLDesktop + "')";
  /* eslint-enable */

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

describe('carousel', ()=>{
  let c, carousel, viewport;

  beforeEach(()=>{
    c = createCarousel();
    viewport = CarouselClass.__get__('viewport');

    carousel = new CarouselClass({
      element: c
      , autoPlay: false
      , itemClass: 'carousel-item'
    }, false);
  });

  it('should exist', ()=>{
    expect(carousel).toBeDefined();
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

  describe('_init function', ()=>{
    beforeEach(()=>{
      spyOn(carousel, '_render');

      carousel._init();
    });

    it('should set this.animating to false', ()=>{
      expect(carousel.animating).toBeFalsy();
    });

    it('should set this.eventManager to the _manageListeners function', ()=>{
      expect(carousel.eventManager.addListener).toBeDefined();
      expect(carousel.eventManager.removeAll).toBeDefined();
    });

    it('should set this.hasDataURLs to false', ()=>{
      expect(carousel.hasDataURLs).toBeFalsy();
    });

    it('should set this.itemActive to 0', ()=>{
      expect(carousel.itemActive).toEqual(0);
    });

    it('should set this.items to be an empty array', ()=>{
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
});
