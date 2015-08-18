# fisheye.js

fisheye.js is a javascript library for drawing images to the canvas with [simple radial lens distortion](https://en.wikipedia.org/wiki/Distortion_(optics)) using WebGL.

Visit [ericleong.github.io/fisheye.js](http://ericleong.github.io/fisheye.js) for a demo.

## install

For those using [bower](http://bower.io/)

```bash
$ bower install fisheye.js
```

## usage

Make sure to include the library!

```html
<script src="fisheye.js"></script>
```

Use it like this:

```javascript
var fisheye = new Fisheye(<canvas>);

fisheye.setDistortion(<red value>, <green value>, <blue value>);
fisheye.draw(<image>);
```

### api

```javascript
var fisheye = new Fisheye(<canvas>);
```

[`<canvas>` is an `HTMLCanvasElement`](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) where the distorted image should be displayed.

```javascript
fisheye.setDistortion(<red value>, <green value>, <blue value>);
```

Each `<value>` is a number, use a positive value for barrel distortion and a negative value for pincushion distortion. If only the first argument is supplied, it is used for all colors. Use different amounts of distortion for each color channel to simulate [chromatic aberration](https://en.wikipedia.org/wiki/Chromatic_aberration).

```javascript
fisheye.draw(<image>);
```

`<image>` is either an [`HTMLCanvasElement`](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) or an [`HTMLImageElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement). It is the undistorted image.


```javascript
fisheye.setViewport(<width>, <height>);
```

If the canvas size is changed, update the viewport size with this method.

```javascript
fisheye.clear();
```

When drawing a new image, you may need to call `clear()` to clear the existing canvas.
