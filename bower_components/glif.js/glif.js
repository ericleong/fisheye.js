// (c) Eric Leong <me@ericleong.me>, 2015.
//
// https://github.com/ericleong/glif.js
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.
//
// glif.js is a Javascript gif decoder using WebGL. It uses omggif.
//

'use strict';

//
// init
//
var GLIF = function(canvas) {
	this.canvas = canvas;
	
	var gl = this.initWebGL(canvas);      // Initialize the GL context
	
	// Only continue if WebGL is available and working
	
	if (gl) {
		this.gl = gl;

		this.gl.enable(this.gl.BLEND);
		this.gl.disable(this.gl.DEPTH_TEST);
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
		
		// Initialize the shaders; this is where all the lighting for the
		// vertices and so forth is established.
		
		this.initShaders(canvas);
		
		// Here's where we call the routine that builds all the objects
		// we'll be drawing.
		
		this.initBuffers();

		// Load and set up the textures we'll be using.

		this.initTextures(canvas);
	}
}

//
// initWebGL
//
// Initialize WebGL, returning the GL context or null if
// WebGL isn't available or could not be initialized.
//
GLIF.prototype.initWebGL = function(canvas) {
	var gl = null;
	
	try {
		gl = canvas.getContext('experimental-webgl', {
			depth: false,
			preserveDrawingBuffer: true
		});
	} catch(e) {
		gl = null;
	}

	return gl;
}

GLIF.prototype.createProgram = function(gl) {

	var vertexShader = GLIF.prototype.getShader(gl, this.getVertexShader(), gl.VERTEX_SHADER);
	var fragmentShader = GLIF.prototype.getShader(gl, this.getFragmentShader(), gl.FRAGMENT_SHADER);
	
	// Create the shader programs
	
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	
	// If creating the shader program failed, alert
	
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		alert('Unable to initialize the shader program.');
	}

	return program;
}

GLIF.prototype.getVertexShader = function() {
	return 'attribute vec3 aVertexPosition;\
			attribute vec2 aTextureCoord;\
\
			varying highp vec2 vTextureCoord;\
\
			void main(void) {\
				gl_Position = vec4(aVertexPosition, 1.0);\
\
				vTextureCoord = aTextureCoord;\
			}';
}

GLIF.prototype.getFragmentShader = function() {
	return 'varying highp vec2 vTextureCoord;\
\
			uniform sampler2D uIndexStream;\
			uniform sampler2D uPalette;\
\
			uniform bool uTransparency;\
			uniform mediump float uTransparent;\
\
			void main(void) {\
				mediump float uIndex = texture2D(uIndexStream, vTextureCoord).r;\
\
				if (uTransparency && uIndex == uTransparent) {\
					gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);\
				} else {\
					gl_FragColor = texture2D(uPalette, vec2(uIndex, 0.5));\
				}\
			}';
}

//
// getShader
//
GLIF.prototype.getShader = function(gl, source, type) {
	// Now figure out what type of shader script we have,
	// based on its MIME type.
	
	var shader = gl.createShader(type);
	
	// Send the source to the shader object
	
	gl.shaderSource(shader, source);
	
	// Compile the shader program
	
	gl.compileShader(shader);
	
	// See if it compiled successfully
	
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
		return null;
	}
	
	return shader;
}

//
// initShaders
//
GLIF.prototype.initShaders = function(canvas) {

	// create program
	this.program = this.createProgram(this.gl);

	// fragment shader uniforms
	this.uTransparency = this.gl.getUniformLocation(this.program, 'uTransparency');
	this.uTransparent = this.gl.getUniformLocation(this.program, 'uTransparent');

	// textures
	this.uIndexStream = this.gl.getUniformLocation(this.program, 'uIndexStream');
	this.uPalette = this.gl.getUniformLocation(this.program, 'uPalette');

	// vertex attributes
	this.aVertexPosition = this.gl.getAttribLocation(this.program, 'aVertexPosition');
	this.gl.enableVertexAttribArray(this.aVertexPosition);

	this.aTextureCoord = this.gl.getAttribLocation(this.program, 'aTextureCoord');
	this.gl.enableVertexAttribArray(this.aTextureCoord);
}

//
// initBuffers
//
// Initialize the buffers we'll need. We just have
// one object -- a simple two-dimensional rect.
//
GLIF.prototype.initBuffers = function() {

	// Map the texture onto the rect's face.
	this.rectVerticesTextureCoordBuffer = this.gl.createBuffer();
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.rectVerticesTextureCoordBuffer);
	
	var textureCoordinates = [
		// Front
		0.0, 1.0,
		1.0, 1.0,
		0.0, 0.0,
		1.0, 0.0
	];

	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), this.gl.STATIC_DRAW);
	
	// Create a buffer for the rect's vertices.
	
	this.rectVerticesBuffer = this.gl.createBuffer();
	
	// Select the this.rectVerticesBuffer as the one to apply vertex
	// operations to from here out.
	
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.rectVerticesBuffer);
	
	// Now create an array of vertices for the rect. Note that the Z
	// coordinate is always 0 here.
	
	var vertices = [
		-1.0, -1.0,  0.0,
		1.0, -1.0,  0.0,
		-1.0, 1.0, 0.0,
		1.0, 1.0, 0.0
	];
	
	// Now pass the list of vertices into WebGL to build the shape. We
	// do this by creating a Float32Array from the JavaScript array,
	// then use it to fill the current vertex buffer.
	
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
}

GLIF.prototype.initTexture = function(gl, image, width, height, format) {
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, format, gl.UNSIGNED_BYTE, image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	return texture;
}

GLIF.prototype.initTextures = function(canvas) {
	this.paletteTexture = this.initTexture(this.gl, null, 256, 1, this.gl.RGB);
	this.indexTexture = this.initTexture(this.gl, null, canvas.width, canvas.height, this.gl.LUMINANCE);

	this.gl.bindTexture(this.gl.TEXTURE_2D, null);
}

GLIF.prototype.updateIndex = function(gl, texture, image, x, y, width, height) {
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
	gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
	gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, width, height, gl.LUMINANCE, gl.UNSIGNED_BYTE, image);
}

GLIF.prototype.updatePalette = function(palette) {
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.paletteTexture);
	this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 4);
	this.gl.pixelStorei(this.gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, this.gl.BROWSER_DEFAULT_WEBGL);
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB, 256, 1, 0, this.gl.RGB, this.gl.UNSIGNED_BYTE, palette);
}

GLIF.prototype.updateTransparency = function(transparent) {
	this.transparent = transparent;

	this.gl.useProgram(this.program);

	if (transparent === null) {
		this.gl.uniform1i(this.uTransparency, false);
	} else {
		this.gl.uniform1i(this.uTransparency, true);
		this.gl.uniform1f(this.uTransparent, transparent / 255.0);
	}
}

//
// clearTexture
//
// Clears the texture to the current transparent color.
//
GLIF.prototype.clearTexture = function() {
	
	var transparent = new Uint8Array(this.canvas.width * this.canvas.height);
	for (var i = 0; i < transparent.length; i++){
		transparent[i] = this.transparent;
	}
	
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.indexTexture);
	this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 1);
	this.gl.pixelStorei(this.gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, this.gl.NONE);
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.LUMINANCE, this.canvas.width, this.canvas.height, 0, this.gl.LUMINANCE, this.gl.UNSIGNED_BYTE, transparent);
}

//
// clear
//
// Clears the framebuffer.
//
GLIF.prototype.clear = function() {
	this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
	this.gl.clear(this.gl.COLOR_BUFFER_BIT);
}

//
// next
//
// Advance the gif.
//
GLIF.prototype.next = function(index, x, y, width, height, disposal) {
	
	if (disposal == 1) { // clear but draw over
		this.clearTexture();
	} else if (disposal == 2) { // clear to transparent
		this.clear();
		this.clearTexture();
	}

	this.updateIndex(this.gl, this.indexTexture, index, x, y, width, height);

	this.gl.useProgram(this.program);

	// Draw the rect by binding the array buffer to the rect's vertices
	// array, setting attributes, and pushing it to this.GL.

	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.rectVerticesBuffer);
	this.gl.vertexAttribPointer(this.aVertexPosition, 3, this.gl.FLOAT, false, 0, 0);

	// Set the texture coordinates attribute for the vertices.
	
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.rectVerticesTextureCoordBuffer);
	this.gl.vertexAttribPointer(this.aTextureCoord, 2, this.gl.FLOAT, false, 0, 0);
	
	// Specify the texture to map onto the face.
	this.gl.uniform1i(this.uPalette, 0);
	
	this.gl.activeTexture(this.gl.TEXTURE0);
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.paletteTexture);
	
	// Pass index texture
	this.gl.uniform1i(this.uIndexStream, 1);
	
	this.gl.activeTexture(this.gl.TEXTURE1);
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.indexTexture);
	
	this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
}