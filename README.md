# fisheye.js

fisheye.js is a javascript library for drawing images to the canvas with [simple radial lens distortion](https://en.wikipedia.org/wiki/Distortion_(optics)) using WebGL.

Visit [ericleong.github.io/fisheye.js](http://ericleong.github.io/fisheye.js) for a demo.

## install

For those using [bower](http://bower.io/)

```bash
$ bower install fisheye.js
```

## usage

```javascript
var fisheye = new Fisheye(<canvas>);

fisheye.setDistortion(<red value>, <green value>, <blue value>);
fisheye.draw(<image>);
```

where `<image>` either a [`<canvas>` element](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) or an [`HTMLImageElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement).

For `setDistortion(<value>)`, if only the first argument is supplied, it is used for all colors. Use a positive value for barrel distortion and a negative value for pincushion distortion.

Use different amounts of distortion for each color channel to simulate [chromatic aberration](https://en.wikipedia.org/wiki/Chromatic_aberration).  