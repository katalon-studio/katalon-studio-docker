var CONNECTING_ERROR_MESSAGE = "Cannot connect to Katalon Server. Make sure you have started Recorder on Katalon application."

function processXHTTPAction(request, callback) {
	var xhttp = new XMLHttpRequest();
	var method = request.method ? request.method.toUpperCase() : XHTTP_GET_METHOD;
	xhttp.onload = function() {
		callback();
	};
	xhttp.onerror = function() {
		callback(CONNECTING_ERROR_MESSAGE);
	}
	try {
		xhttp.open(method, request.url, true);
		if (method == XHTTP_POST_METHOD) {
			xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		}
		console.log(request)
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			var object = request.data;
			object['action']['windowId'] = tabs[0].id;
			xhttp.send('element=' + encodeURIComponent(JSON.stringify(object)));
		});
	} catch (exception) {
		console.log(JSON.stringify(exception))
	}
	return true; // prevents the callback from being called too early on return
}

chrome.runtime.onMessage.addListener(function(request, sender, callback) {
    if (request.action == XHTTP_ACTION) {
        return processXHTTPAction(request, callback);
    }
});