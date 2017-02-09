# vanilla-carousel

### Synopsis
An image carousel written in vanilla JavaScript.

### Installation
```
npm install @ianhatton/vanilla-carousel
```

### Running tests
```
npm run test
```

### Example Instantiation
```javascript
const CarouselClass = require('@ianhatton/vanilla-carousel');

const carouselElements = document.querySelectorAll('.carousel');

if (carouselElements.length > 0){
  Array.from(carouselElements).map((element)=>{
    return new CarouselClass({
      element: element
    });
  });
}
```

### Configuration
A new instance of CarouselClass can contain the following in its configuration object:
```javascript
new CarouselClass({
  element: // The DOM node to be instantiated as a carousel
  , autoPlay: // Boolean. Determines whether or not the carousel plays automatically. Default is false
  , naturalScroll: // Boolean. Determines the direction of movement. Default is true
  , itemClass: // String. Class for each carousel item. Default is "carousel-item"
});
```

### Example HTML structure
```html
<div class="carousel">
  <div class="carousel-inner">
    <div class="carousel-item">
      <div class="carousel-image-container" style="background-image:url('http://www.fillmurray.com/1280/391')" data-mobile="http://www.fillmurray.com/480/360" data-tablet="http://www.fillmurray.com/768/432" data-desktop="http://www.fillmurray.com/1280/391">
        <div class="carousel-overlay">
          <h1>Bill Murray</h1>
          <h2>Lorem ipsum dolor sit amet</h2>
        </div>
      </div>
    </div>
  </div>
</div>
```

All carousels must be wrapped in a div with a class of ***carousel***, which always contains a div with a class of ***carousel-inner***. Similarly, all carousel items must be wrapped in a div with a class of ***carousel-item***, which always contains a div with a class of ***carousel-image-container***. Finally, if the carousel item has a text overlay, this will need to be wrapped in a div with a class of ***carousel-overlay***.

The ***style*** attribute of ***carousel-image-container*** is required, and it expects a ***background-image*** property pointing the URL of the image.

The ***data-*** attributes for mobile, tablet and desktop are optional, but if they are present they will determine which image is shown at each corresponding breakpoint.

