/* global GLIF */
/* global GifReader */
var viewer = function(canvas, data, callback) {
	
	var gr;
	
	if (data instanceof ArrayBuffer) {
		gr = new GifReader(new Uint8Array(data));
	} else if (data instanceof Uint8Array) {
		gr = new GifReader(data);
	} else if (data instanceof GifReader) {
		gr = data;
	}
	
	var info = gr.frameInfo(0);
	canvas.width = info.width;
	canvas.height = info.height;

	// uses glif.js
	function gliffer(canvas, gr, callback) {
	
		var glif = new GLIF(canvas);
		
		var frame_num = 0;
		var frame_info;
	
		return function draw(once) {
	
			frame_num = frame_num % gr.numFrames();
			frame_info = gr.frameInfo(frame_num);
			
			if (frame_num == 0) {
				glif.clear();
			}
	
			gr.decodeAndGLIF(frame_num, glif);
			frame_num++;
			
			if (!once) {
				var timeout = setTimeout(draw, frame_info.delay * 10);
	
				if (typeof callback === 'function') {
					callback(timeout);
				}
				
				return timeout;
			}
		}
	}
	
	// uses omggif.js
	function canvasser(canvas, gr, callback) {
		var context = canvas.getContext('2d');
	
		var imagedata = context.createImageData(canvas.width, canvas.height);
	
		var frame_num = 0;
		var frame_info;
	
		return function draw(once) {
	
			frame_num = frame_num % gr.numFrames();
			frame_info = gr.frameInfo(frame_num);
			
			if (frame_info.disposal == 2) {
				for (var i = 0; i < imagedata.data.length; i++) {
					imagedata.data[i] = 0;
				}
			} 
	
			gr.decodeAndBlitFrameRGBA(frame_num, imagedata.data);
	
			context.putImageData(imagedata, 0, 0);
	
			frame_num++;
	
			if (!once) {
				var timeout = setTimeout(draw, frame_info.delay * 10);
			
				if (typeof callback === 'function') {
					callback(timeout);
				}
				
				return timeout;
			}
		}
	}
	
	if (!info.interlaced) { // gpu is not suited for interlaced gifs
		return gliffer(canvas, gr, callback);
	} else {
		return canvasser(canvas, gr, callback);
	}
}