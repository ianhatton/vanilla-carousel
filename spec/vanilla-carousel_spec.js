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

function createDotsNavContainer(){
  let dotsContainer;
  let div = document.createElement('div');
  let ul = document.createElement('ul');
  dotsContainer = document.createElement('div');

  div.className = 'carousel-dots';
  dotsContainer.id = 'carousel-dots-container';

  div.appendChild(ul);
  dotsContainer.appendChild(div);
 
  return dotsContainer;
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
    this.dotsContainer = createDotsNavContainer();
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
    let li, ul, svg;

    beforeEach(()=>{
      li = document.createElement('li');
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      ul = document.createElement('ul');

      ul.className = 'carousel-arrows-container';

      ul.appendChild(li);

      spyOn(carousel, '_createArrowNavSvg').and.returnValue(svg);
    });

    describe('when the direction parameter is "previous"', ()=>{
      beforeEach(()=>{
        spyOn(carousel, '_addPreviousListener');

        carousel._createArrowNav('previous', li);
      });

      it('should call the _createArrowNavSvg function with a parameter of "previous"', ()=>{
        expect(carousel._createArrowNavSvg).toHaveBeenCalledWith('previous');
      });

      it('should create this.previousButton', ()=>{
        expect(carousel.previousButton.id).toEqual('carousel-previous');
      });

      it('should call the _addPreviousListener function', ()=>{
        expect(carousel._addPreviousListener).toHaveBeenCalled();
      });
    });

    describe('when the direction parameter is "next"', ()=>{
      beforeEach(()=>{
        spyOn(carousel, '_addNextListener');

        carousel._createArrowNav('next', li);
      });

      it('should call the _createArrowNavSvg function with a parameter of "next"', ()=>{
        expect(carousel._createArrowNavSvg).toHaveBeenCalledWith('next');
      });

      it('should create this.nextButton', ()=>{
        expect(carousel.nextButton.id).toEqual('carousel-next');
      });

      it('should call the _addNextListener function', ()=>{
        expect(carousel._addNextListener).toHaveBeenCalled();
      });
    });
  });

  // describe('_createArrowNavSvg function', ()=>{
  //  I don't see the point in testing this 
  // });

  describe('_createArrowNavContainer', ()=>{
    beforeEach(()=>{
      spyOn(carousel, '_createArrowNav');

      carousel._createArrowNavContainer();
    });

    it('should call the _createArrowNav function', ()=>{
      expect(carousel._createArrowNav).toHaveBeenCalled();
    });
  });

  describe('_createDotsNav function', ()=>{
    let ul;

    beforeEach(()=>{
      carousel.dotsContainer = this.dotsContainer;
      carousel.items = this.items;
      ul = this.dotsContainer.getElementsByTagName('ul')[0];

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
    })

    it('should call the _createDotsNav function', ()=>{
      expect(carousel._createDotsNav).toHaveBeenCalled();
    });
  });

  describe('_dotClick function', ()=>{
    let clickSpy;

    beforeEach(()=>{
      carousel.dots = this.dotsContainer.getElementsByTagName('a');

      clickSpy = jasmine.createSpyObj('e', ['preventDefault', 'target']);

      spyOn(carousel, '_setDotClass');
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

      it('should call the _setDotClass function', ()=>{
        expect(carousel._setDotClass).toHaveBeenCalled();
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

      it('should not call the _setDotClass function', ()=>{
        expect(carousel._setDotClass).not.toHaveBeenCalled();
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
      spyOn(carousel, '_setDotClass');

      carousel._getDots();
    });

    it('should call the _addDotClickListeners function', ()=>{
      expect(carousel._addDotClickListeners).toHaveBeenCalled();
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
    });

    describe('under all circumstances', ()=>{
      beforeEach(()=>{
        carousel._getItems();
      });

      it('should call the _checkDataURLs function', ()=>{
        expect(carousel._checkDataURLs).toHaveBeenCalled();
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
      let lastItem;

      beforeEach(()=>{
        lastItem = this.items[1];

        lastItem.parentNode.removeChild(lastItem);

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

    it('should return the removeAll function', ()=>{
      expect(eventManager.removeAll).toBeDefined();
    });
  });

  describe('_next function', ()=>{
    let clickSpy;

    beforeEach(()=>{
      carousel.items = this.items;

      spyOn(carousel, '_setSelected');
    });

    describe('under all circumstances', ()=>{
      beforeEach(()=>{
        clickSpy = jasmine.createSpyObj('e', ['preventDefault']);

        carousel._next(clickSpy);
      });

      it('should call e.preventDefault', ()=>{
        expect(clickSpy.preventDefault).toHaveBeenCalled();
      });
    });
  });
});
/* eslint-enable */
