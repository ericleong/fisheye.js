var grab = function(items, callback) {
	if (items && items.length > 0) {
		var item = items[0];
	
		if (item instanceof ArrayBuffer || item instanceof HTMLImageElement) {
	
			callback(item);
	
		} else if (item instanceof File) {
	
			var imageType = /^image\//;
	
			if (!imageType.test(item.type)) {
				callback();
			}
	
			var gifType = /^image\/gif/;
	
			if (gifType.test(item.type)) {
				var reader = new FileReader();
				reader.onload = (function(cb) { return function(e) { cb(e.target.result); }; })(callback);
				reader.readAsArrayBuffer(item);
			} else {
				// not a gif but still an image
				var img = document.createElement('img');
				img.onload = function() {
					window.URL.revokeObjectURL(this.src);
	
					callback(this);
				};
				img.src = window.URL.createObjectURL(item);
			}
		} else {
			if (item.length && item.lastIndexOf && (item.lastIndexOf('.jpg') == item.length - 4 || item.lastIndexOf('.png') == item.length - 4)) {
	
				// if it seems like a static image, load it like an image.
				var img = document.createElement('img');
				img.onload = function() {
					callback(this);
				};
				img.src = item;
			} else {
				download(item, callback);
			}
		}
	} else {
		callback();
	}
}

function download(url, callback) {
	var oReq = new XMLHttpRequest();

	oReq.onload = function(e) {
		var arrayBuffer = oReq.response; // not responseText

		if (arrayBuffer) {
			callback(arrayBuffer);
		} else {
			callback();
		}
	};

	oReq.onerror = function() {
		callback();
	};

	oReq.open('GET', url, true);
	oReq.responseType = 'arraybuffer';
	oReq.send();
}