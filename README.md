fisheye.js
==========

fisheye.js is a javascript library for drawing images to the canvas with [simple radial lens distortion](https://en.wikipedia.org/wiki/Distortion_(optics)) using WebGL.

Visit [ericleong.github.io/fisheye.js](http://ericleong.github.io/fisheye.js) for a demo.

usage
-----

```Javascript
var fisheye = new Fisheye(<canvas>);

fisheye.setDistortion(<value>);
fisheye.draw(<image>);
```

where `<image>` either a [`<canvas>` element](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) or an [`HTMLImageElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement).