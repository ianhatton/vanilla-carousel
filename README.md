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
          <h2>Bill Murray</h2>
          <h3>Lorem ipsum dolor sit amet</h3>
        </div>
      </div>
    </div>
  </div>
</div>
```

All carousels must be wrapped in a div with a class of ***carousel***, which always contains a div with a class of ***carousel-inner***. Similarly, all carousel items must be wrapped in a div with a class of ***carousel-item***, which always contains a div with a class of ***carousel-image-container***. Finally, if the carousel item has a text overlay, this will need to be wrapped in a div with a class of ***carousel-overlay***.

The ***style*** attribute of ***carousel-image-container*** is required, and it expects a ***background-image*** property pointing to the URL of the image.

The ***data-*** attributes for mobile, tablet and desktop are optional, but if they are present they will determine which image is shown at each corresponding breakpoint.

### CSS
As a bare minimum, you'll require the following, or similar CSS:

##### Non-responsive
(base styles)
```scss
.carousel {
  overflow: hidden;
  position: relative;

  .carousel-arrows-container {
    position: absolute;
    width: 100%;

    li {
      position: absolute;
      @include transition(all 0.2s ease-in-out);

      &.previous {
        left: 0;
      }

      &.next {
        right: 0;
      }

      a {
        display: block;
        height: 50px;
        width: 100px;
        background-color: #fff;

        span {
          @include hidden;
        }
      }

      svg {
        margin: auto;
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
      }
    }
  }

  .carousel-dots {
    float: right;
    margin: 0;
    padding: 0;
    position: relative;
    left: -50%;
    width: auto;

    a {
      float: left;
      height: 10px;
      margin: 0 3px;
      width: 10px;
      background-color: #000;
      border-radius: 5px;

      &.active {
        background-color: #333;
      }
    }

    li {
      float: left;
    }

    ul {
      display: inline-block;
      margin: 0;
      position: relative;
      left: 50%;
    }
  }

  #carousel-dots-container {
    margin: 20px 0;
    padding-bottom: 20px;
    width: 100%;
  }

  .carousel-image-container {
    height: 100%;
    position: relative;
    background-size: cover;
  }

  .carousel-inner {
    height: 0;
    position: relative;
    width: 100%;
  }

  .carousel-item {
    height: 100%;
    position: absolute;
    left: 0;
    width: 100%;

    &.animating {
      @include transition(left 0.6s cubic-bezier(0.86, 0, 0.07, 1));
    }

    &.hidden {
      display: none;
    }
  }
}
```

##### Responsive
(styles which are applied at different breakpoints)
```scss
.carousel {
  @include breakpoint($mobile-breakpoint) {
    .carousel-arrows-container {
      top: 38%;

      li {
        a {
          height: 25px;
          width: 50px;
        }
      }
    }

    .carousel-inner {
      padding-bottom: 75%; /* 480x360 */
    }
  }

  @include breakpoint($tablet-breakpoint) {
    .carousel-inner {
      padding-bottom: 60.15625%; /* 768x462 */
    }
  }

  @include breakpoint($tablet-and-desktop-breakpoint) {
    .carousel-arrows-container {
      top: 42%;
    }
  }

  @include breakpoint($desktop-breakpoint) {
    .carousel-inner {
      padding-bottom: 30.546875%; /* 1280x391 */
    }
  }
}
```