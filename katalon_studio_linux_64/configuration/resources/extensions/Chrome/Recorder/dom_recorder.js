var lastEvent;
var gHoverElement; // whatever element the mouse is over

var infoDiv; // parent div to contains information
var elementInfoDiv; // informational div to show xpath of current hovered element
var elementInfoDivText; // xpath text to show in elementInfoDiv

function setupDOMSelection() {
	setupEventListeners();
	createInfoDiv();
}

function setupEventListeners() {
	document.onchange = change;
	document.onmouseup = mouseUp;
	document.onmouseover = mouseOver;
	document.onmouseout = mouseOut;
	document.ondblclick = dblClick;
	document.onkeydown = keyDown;
	window.onmousemove = mouseMoveWindow;
	window.onmouseout = mouseOutWindow;
	var forms = document.getElementsByTagName('form');
	for (i = 0; i < forms.length; i++) {
		forms[i].onsubmit = submit;
	}

	var selects = document.getElementsByTagName('select');
	for (i = 0; i < selects.length; i++) {
		selects[i].onfocus = focus;
	}
}

function addNavigationAction() {
	if (window.location !== window.parent.location) {
		return;
	}
	var action = {};
	action["actionName"] = "navigate";
	action["actionData"] = window.document.URL;
	sendData(action, document);
}

function addElementToElement(tag, text, element) {
	var childElement = document.createElement(tag);
	childElement.appendChild(document.createTextNode(text));
	element.appendChild(childElement);
}

function addKbdElementToElement(text, element) {
	addElementToElement('kbd', text, element);
}

function addSpanElementToElement(text, element) {
	addElementToElement('span', text, element);
}

// setup informational div to show which element the mouse is over.
function createInfoDiv() {
	addCustomStyle();
	infoDiv = document.createElement('div');
	infoDiv.id = 'katalon';
	createXpathDiv();
	document.body.appendChild(infoDiv);
}

function addCustomStyle() {
	var kbdstyle = document.createElement('style');
	kbdstyle.type = 'text/css';
	var styleText = document
			.createTextNode('#katalon{font-family:monospace;font-size:13px;background-color:rgba(0,0,0,.7);position:fixed;top:0;left:0;right:0;display:block;z-index:999999999;line-height: normal} #katalon div{padding:0;margin:0;color:#fff;} #katalon kbd{display:inline-block;padding:3px 5px;font:13px Consolas,"Liberation Mono",Menlo,Courier,monospace;line-height:10px;color:#555;vertical-align:middle;background-color:#fcfcfc;border:1px solid #ccc;border-bottom-color:#bbb;border-radius:3px;box-shadow:inset 0 -1px 0 #bbb;font-weight: bold} div#katalon-elementInfoDiv {color: lightblue; padding: 5px}');
	kbdstyle.appendChild(styleText);
	document.head.appendChild(kbdstyle);
}

function createXpathDiv() {
	elementInfoDiv = document.createElement('div');
	elementInfoDiv.id = 'katalon-elementInfoDiv';
	elementInfoDiv.style.display = 'none'; 
	infoDiv.appendChild(elementInfoDiv);
}

// Get info from for hovered element
function getElementInfo(element) {
	if (!element) {
		return '';
	}
	return createXPathFromElement(element);
}

function updateInfoDiv(text) {
	if (elementInfoDivText == null) {
		elementInfoDivText = document.createTextNode('');
		elementInfoDiv.appendChild(elementInfoDivText);
	}
	elementInfoDivText.nodeValue = (text);
}

function mouseMoveWindow(e) {
	var y = 0;
	var windowHeight = $(window).height();
	if (e.clientY - infoDiv.offsetHeight - 20 < 0) {
		y = windowHeight - infoDiv.offsetHeight;
	}
	infoDiv.style.top = y + 'px';
}

function mouseOutWindow(e) {
	mouseMoveWindow(e);
}

function mouseOver(e) {
	var selectedElement = e ? e.target : window.event.srcElement;
	if (selectedElement.nodeName.toLowerCase() == 'iframe' || selectedElement.nodeName.toLowerCase() == 'frame') {
		var iframeContentWindow = selectedElement.contentWindow;
		if (iframeContentWindow) {
			iframeContentWindow.focus();
		}
	} else {
		var doc = selectedElement.ownerDocument;
		var win = doc.defaultView || doc.parentWindow;
		win.focus();
	}

	if (selectedElement == gHoverElement) {
		return;
	}
	gHoverElement = selectedElement;
	gHoverElement.style.outline = ELEMENT_HOVER_OUTLINE_STYLE;
	elementInfoDiv.style.display = 'block'; 
	updateInfoDiv(getElementInfo(gHoverElement));
}

function mouseOut(e) {
	var selectedElement = e ? e.target : window.event.srcElement;
	if (gHoverElement != selectedElement) {
		return;
	}
	gHoverElement.style.outline = '';
	elementInfoDiv.style.display = 'none';
	updateInfoDiv("");
	gHoverElement = null;
}

function getSelectValues(select) {
	var result = [];
	var options = select && select.options;
	var opt;

	for (var i = 0, iLen = options.length; i < iLen; i++) {
		opt = options[i];
		if (opt.selected) {
			result.push(opt.value || opt.text);
		}
	}
	return result;
}

function focus(e) {
	var selectedElement = e ? e.target : window.event.srcElement;
	if (selectedElement.tagName.toLowerCase() == 'select') {
		selectedElement.oldValue = getSelectValues(selectedElement);
		selectedElement.onfocus = null;
	}
}

function change(e) {
	var selectedElement = e ? e.target : window.event.srcElement;
	if (!selectedElement) {
		return;
	}
	var elementTagName = selectedElement.tagName.toLowerCase();
	var elementTypeName = selectedElement.type.toLowerCase();
	var isRecorded = ((elementTagName != 'input') || (elementTagName == 'input' && elementTypeName != 'radio' && elementTypeName != 'checkbox'));
	if (!isRecorded) {
		return;
	}
	var action = {};
	action["actionName"] = 'inputChange';
	if (elementTagName == 'select') {
		action["actionData"] = {};
		action["actionData"]["oldValue"] = selectedElement.oldValue
		action["actionData"]["newValue"] = getSelectValues(selectedElement);
		selectedElement.oldValue = action["actionData"]["newValue"];
	} else {
		action["actionData"] = selectedElement.value;
	}
	sendData(action, selectedElement);
}

function getMouseButton(e) {
	if (!e) {
		return;
	}
	if (e.which) {
		if (e.which == 3) {
			return 'right';
		}
		if (e.which == 2) {
			return 'middle';
		}
		return 'left';
	}
	if (e.button) {
		if (e.button == 2) {
			return 'right';
		}
		if (e.button == 4) {
			return 'middle';
		}
		return 'left';
	}
}

function isElementMouseUpEventRecordable(selectedElement, clickType) {
	if (clickType != 'left') {
		return true;
	}
	var elementTag = selectedElement.tagName.toLowerCase();
	if (elementTag == 'input') {
		var elementInputType = selectedElement.type.toLowerCase();
		if (elementInputType == 'button' || elementInputType == 'submit' || elementInputType == 'radio'
				|| elementInputType == 'image' || elementInputType == 'checkbox') {
			return true;
		}
		return false;
	}
	return elementTag != 'select' && elementTag != 'option' && elementTag != 'textarea';
}

function mouseUp(e) {
	lastEvent = 'click';
	var selectedElement = e ? e.target : window.event.srcElement;
	var clickType = getMouseButton(e);
	if (!isElementMouseUpEventRecordable(selectedElement, clickType)) {
		return;
	}
	console.log("click recorded")
	var action = {};
	action["actionName"] = 'click';
	action["actionData"] = clickType;
	sendData(action, selectedElement);
	console.log("click sent")
}

function dblClick(e) {
	var selectedElement = e ? e.target : window.event.srcElement;
	var action = {};
	action["actionName"] = 'doubleClick';
	action["actionData"] = '';
	sendData(action, selectedElement);
}

function keyDown(e) {
	var keycode = (e) ? e.which : window.event.keyCode;
	if (keycode == 13) {
		lastEvent = 'enter';
	}
}

function submit() {
	if (lastEvent != 'enter') {
		return;
	}
	var selectedElement = this;
	var action = {};
	action["actionName"] = 'submit';
	action["actionData"] = '';
	sendData(action, selectedElement);
}

function sendData(action, element) {
	if (!element) {
		return;
	}
	var jsonObject = mapDOMForRecord(action, element, window);
	processObject(jsonObject);
}

function setParentJson(object, parentJson) {
	if ('parent' in object) {
		setParentJson(object['parent'], parentJson);
	} else {
		object['parent'] = parentJson;
	}
}

function postData(url, object) {
	if (!object) {
		return;
	}
	if (detectChrome()) {
		chromePostData(url, object, function(response) {
			if (response) {
				console.log(response)
				// error happenened
				alert(response);
				setTimeout(function() {
					window.focus();
				}, 1);
				return;
			}
			console.log("POST success");
		});
		return;
	}
	if (detectIE() && window.httpRequestExtension) {
		var data = 'element=' + encodeURIComponent(JSON.stringify(object));
		var response = window.httpRequestExtension.postRequest(data, url);
		if (response === '200') {
			console.log("POST success");
		} else {
			console.log(response);
		}
		return;
	}
	self.port.emit("postData", {
		url : url,
		data : object
	});
}

function processObject(object) {
	if (window.location !== window.parent.location) {
		window.parent.postMessage(JSON.stringify(object), "*");
	} else {
		postData(qAutomate_server_url, object);
	}
}

function receiveMessage(event) {
	// Check if sender is from any child frame belong to this window
	var childFrame = null;
	var arrFrames = document.getElementsByTagName("IFRAME");
	for (var i = 0; i < arrFrames.length; i++) {
		if (arrFrames[i].contentWindow === event.source) {
			childFrame = arrFrames[i];
			break;
		}
	}
	arrFrames = document.getElementsByTagName("FRAME");
	for (var i = 0; i < arrFrames.length; i++) {
		if (arrFrames[i].contentWindow === event.source) {
			childFrame = arrFrames[i];
			break;
		}
	}
	if (!childFrame) {
		return;
	}
	var object = JSON.parse(event.data);
	var action = {};
	action["actionName"] = "goIntoFrame";
	action["actionData"] = "";
	var json = mapDOMForRecord(action, childFrame, window);
	if (json) {
		setParentJson(object, json);
	}
	processObject(object);
}

function startRecord() {
	if (!window.console) {
		console = {
			log : function() {
			}
		};
	}
	// START
	setupDOMSelection();
	addNavigationAction();

	// for Firefox
	if (!detectChrome() && !detectIE() && !(typeof self === 'undefined')) {
		self.on('message', function(message) {
			if (message.kind == "postSuccess") {
				console.log("POST recorded element successful")
			} else if (message.kind == "postFail") {
				alert(message.text);
			}
		});
	}

	if (window.addEventListener) {
		window.addEventListener("message", receiveMessage, false);
	} else {
		window.attachEvent("onmessage", receiveMessage);
	}
};