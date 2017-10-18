var katalonServerPortStorage = "katalonServerPortStorage";
var katalonOnOffStatusStorage = "katalonOnOffStatusStorage";

function setKatalonOnOffStatus(isOn) {
	chrome.storage.local.set({ katalonOnOffStatusStorage : isOn.toString() },  
	function() {
		if (chrome.runtime.error) {
			console.log("Runtime error setting on off status.");
			return;
		}
		console.log("Katalon object spy on/off status is set to " + isOn);
	});
}

function getKatalonOnOffStatus(callback) {
	chrome.storage.local.get(katalonOnOffStatusStorage, function(result) {
		var isOn = result[katalonOnOffStatusStorage] === 'true';
		if (!(katalonOnOffStatusStorage in result)) {
			isOn = katalonOnOffStatus;
			setKatalonOnOffStatus(isOn);
		}
		callback(isOn);
	});
}

function setKatalonServerPort(port) {
	chrome.storage.local.set({ katalonServerPortStorage : port },  
	function() {
		if (chrome.runtime.error) {
			console.log("Runtime error setting server port to storage.");
			return;
		}
		console.log("Katalon server port set to " + port);
	});
}

function getKatalonServerPort(callback) {
	chrome.storage.local.get(katalonServerPortStorage, function(result) {
		var port;
		if (!(katalonServerPortStorage in result)) {
			port = katalonServerPort;
			setKatalonServerPort(port);
		} else {
			port = result[katalonServerPortStorage];
		}
		callback(port);
	})
}

function chromePostData(url, data, callback) {
	chrome.runtime.sendMessage({
		method: XHTTP_POST_METHOD,
		action: XHTTP_ACTION,
		url: url,
		data: data
	}, callback);
}