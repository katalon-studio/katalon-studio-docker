var CONNECTING_ERROR_MESSAGE = "Cannot connect to Katalon Server. Make sure you have started Object Spy on Katalon application."

var registeredRequest = false;
var requestId = 0;
var katalonServer;
var clientId = -1;
var REQUEST_SEPARATOR = "_|_";
	
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
		xhttp.send(request.data);
	} catch (exception) {
		console.log(JSON.stringify(exception))
	}
	return true; // prevents the callback from being called too early on return
}

function findElementInTab(xpathExpression, callbackWhenSuccess) {
	var found = false;
	
	chrome.tabs.query({}, function (tabs) {
		for (i = 0; i < tabs.length && found == false; ++i) {
			var tabUrl = tabs[i].url;
			if (tabUrl == null || (tabUrl.indexOf('http') != 0 && tabUrl.indexOf('file') != 0)) {
				continue;
			}
			var tabId = tabs[i].id;
			chrome.tabs.sendMessage(tabId, {srcTabId: tabId, request: 'KATALON_FIND_OBJECT', xpath: xpathExpression}, function(response) {
				if (response != undefined && response.found) {
					callbackWhenSuccess(response.tabId);
				}
			});
		}
	});
}

function activeBrowserAndFlashElement(tabResult, xpathExpression) {
	chrome.tabs.update(tabResult, {highlighted: true}, function(tab) {
		chrome.tabs.get(tabResult, function(tab) {
			chrome.windows.update(tab.windowId, {focused: true}, function() {
				chrome.tabs.sendMessage(tabResult, {request: 'KATALON_FLASH_OBJECT', xpath: xpathExpression});
			});
		});
	});	
}

function highlightObject(xpathExpression) {
	findElementInTab(xpathExpression, function(tabResult) {
		activeBrowserAndFlashElement(tabResult, xpathExpression);
	});
}

function findObject(xpathExpression) {
	findElementInTab(xpathExpression, function(tabId) {
		sendRequest("FOUND", true);
	});
	
}

function startSendRequest(request) {
	if (registeredRequest) {
		return;
	}
	registeredRequest = true;
	katalonServer = request.url;
	setInterval(function() {
		sendRequest("GET_REQUEST", true);
	}, 200);
}

function sendRequest(request, waitAnswer) {
	try {
		var xhttp = new XMLHttpRequest();
		
		if (waitAnswer) {
			xhttp.onerror = function() {
				clientId = -1;
				requestId = -1;
			}
			xhttp.onreadystatechange = function() {
				if (xhttp.readyState == 4 && xhttp.status == 200 && xhttp.responseText != "NO_REQUEST") {
					var requestParts = xhttp.responseText.split(REQUEST_SEPARATOR)
					
					if (clientId == -1 || isNaN(clientId)) {
						clientId = parseInt(xhttp.responseText);
						return;
					}
					if (requestParts.lenngth < 3) {
						return;
					}
					requestId = parseInt(requestParts[0]); 
					var requestType = requestParts[1];
					var requestData = (requestParts[2]);
					processRequest(requestType, requestData);
				}
			};
		}
		
		if (clientId == -1 || isNaN(clientId)) {
			clientId = -1;
			request = "GET_CLIENT_ID";
		}
		if (isNaN(requestId)) {
			requestId = -1;
		}
		
		xhttp.open("POST", katalonServer, true);
		xhttp.send(request + "=" + clientId + REQUEST_SEPARATOR + requestId);
	} catch (ex) {
		console.log(ex);
	}
}

function processRequest(requestType, requestData) {
	if (requestType == "FIND_TEST_OBJECT") {
		findObject(requestData);
	}
	else if (requestType == "HIGHLIGHT_TEST_OBJECT") {
		highlightObject(requestData);
	}
}


chrome.runtime.onMessage.addListener(function(request, sender, callback) {
	if (request.action == XHTTP_ACTION) {
        return processXHTTPAction(request, callback);
    }
    else if (request.action == "GET_REQUEST") {
    	startSendRequest(request); 	
    }
});