function droppick(dropper, picker, callback) {
	
	var stopPropagation = function(e) {
		e.stopPropagation();
		e.preventDefault();
	};
	
	var drop = function(e, callback) {
		stopPropagation(e);
		
		var dt = e.dataTransfer;
	
		if (dt) {
			if (dt.files && dt.files.length > 0) {
				callback(dt.files);
			} else {
	
				// split by 'http' because '\n' is not always there
				var links = dt.getData('text/uri-list').split('http');
	
				if (links && links.length > 0) {
	
					var validLinks = [];
	
					for (var i = 0; i < links.length; i++) {
						var link = links[i];
	
						if (link && link.length > 0 && link.indexOf('#') < 0) {
							
							// add the http back to the link
							validLinks.push('http' + link);
						}
					}
	
					if (validLinks.length > 0) {
						callback(validLinks);
					}
				}
			}
		}
	};
	
	if (dropper) {
		dropper.addEventListener('dragenter', stopPropagation, false);
		dropper.addEventListener('dragover', stopPropagation, false);
		dropper.addEventListener('drop', function(e) {			
			drop(e, callback);
		}, false);
	}
	
	if (picker) {
		picker.addEventListener('change', function(e) {
			if (this && this.files && this.files.length > 0) {
				callback(this.files);
			}
		}, false);
	}
}