//GLOBALS
var gHoverElement; // whatever element the mouse is over
var infoDiv; // parent div to contains information
var instructionDiv; // instruction div to guide user how to capture object
var elementInfoDiv; // informational div to show xpath of current hovered
// element
var elementInfoDivText; // xpath text to show in elementInfoDiv
var currentEventOrigin; // store event origin for posting message

// HTML Constants
var space = '\u00A0';
var dot = '\u25CF';

// setup
function setupEventListeners() {
    document.onkeyup = keyUp;
    document.onmouseover = mouseOver;
    document.onmouseout = mouseOut;
    window.onmousemove = mouseMoveWindow;
    window.onmouseout = mouseOutWindow;
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
    if (isInTopWindow()) {
        createInstructionDiv();
    }
    createXpathDiv();
    document.body.appendChild(infoDiv);
}

function addCustomStyle() {
    var kbdstyle = document.createElement('style');
    kbdstyle.type = 'text/css';
    var styleText = document
            .createTextNode('#katalon{font-family:monospace;font-size:13px;background-color:rgba(0,0,0,.7);position:fixed;top:0;left:0;right:0;display:block;z-index:999999999;line-height: normal} #katalon div{padding:0;margin:0;color:#fff;} #katalon kbd{display:inline-block;padding:3px 5px;font:13px Consolas,"Liberation Mono",Menlo,Courier,monospace;line-height:10px;color:#555;vertical-align:middle;background-color:#fcfcfc;border:1px solid #ccc;border-bottom-color:#bbb;border-radius:3px;box-shadow:inset 0 -1px 0 #bbb;font-weight: bold} div#katalon-elementInfoDiv {color: lightblue; padding: 0px 5px 5px} div#katalon-instructionDiv {padding: 5px 5px 2.5px}');
    kbdstyle.appendChild(styleText);
    document.head.appendChild(kbdstyle);
}

function createInstructionDiv() {
    instructionDiv = document.createElement('div');
    instructionDiv.id = 'katalon-instructionDiv';

    addSpanElementToElement('Capture object: ', instructionDiv)
    createElementForHotKey(spy_captureObjectHotKey, instructionDiv)

    addSpanElementToElement(dot + ' Load DOM Map: ', instructionDiv)
    createElementForHotKey(spy_loadDomMapHotKey, instructionDiv)
    infoDiv.appendChild(instructionDiv);

    infoDiv.appendChild(instructionDiv);
}

function createElementForHotKey(hotKeyObject, parentDiv) {
    if (!hotKeyObject) {
        return;
    }
    if (hotKeyObject.useCtrlKey) {
        addKbdElementToElement('Ctrl', parentDiv);
        parentDiv.appendChild(document.createTextNode(space));
    }
    if (hotKeyObject.useAltKey) {
        addKbdElementToElement('Alt', parentDiv);
        parentDiv.appendChild(document.createTextNode(space));
    }
    if (hotKeyObject.useShiftKey) {
        addKbdElementToElement('Shift', parentDiv);
        parentDiv.appendChild(document.createTextNode(space));
    }
    if (hotKeyObject.useMetaKey) {
        addKbdElementToElement('⌘', parentDiv);
        parentDiv.appendChild(document.createTextNode(space));
    }
    if (hotKeyObject.keyCode) {
        var keyCode = hotKeyObject.keyCode;
        var keyCodeChar = keyCode === 192 ? '`' : String.fromCharCode(hotKeyObject.keyCode);
        addKbdElementToElement(keyCodeChar, parentDiv);
        parentDiv.appendChild(document.createTextNode(space));
    }
}

function createXpathDiv() {
    elementInfoDiv = document.createElement('div');
    elementInfoDiv.id = 'katalon-elementInfoDiv';
    elementInfoDiv.style.display = 'none';
    infoDiv.appendChild(elementInfoDiv);
}

function setupDOMSelection() {
    setupEventListeners();
    createInfoDiv();
}

function getElementInfo(element) {
    if (!element) {
        return '';
    }
    return createXPathFromElement(element);
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
    if (gHoverElement != null) {
        gHoverElement.style.outline = '';
    }
    gHoverElement = selectedElement;
    gHoverElement.style.outline = ELEMENT_HOVER_OUTLINE_STYLE;
    elementInfoDiv.style.display = 'block';
    updateInfoDiv(getElementInfo(gHoverElement));
}

function updateInfoDiv(text) {
    if (elementInfoDivText == null) {
        elementInfoDivText = document.createTextNode('');
        elementInfoDiv.appendChild(elementInfoDivText);
    }
    elementInfoDivText.nodeValue = (text);
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

function flashElement() {
    if (!gHoverElement) {
        return;
    }
    $(gHoverElement)
            .css({
                outline : ELEMENT_FLASHING_OUTLINE_STYLE
            })
            .animate({
                outlineColor : ELEMENT_FLASHING_OUTLINE_COLOR_1
            }, 100)
            .animate({
                outlineColor : ELEMENT_FLASHING_OUTLINE_COLOR_2
            }, 100)
            .animate({
                outlineColor : ELEMENT_FLASHING_OUTLINE_COLOR_1
            }, 100)
            .animate({
                outlineColor : ELEMENT_FLASHING_OUTLINE_COLOR_2
            }, 100)
            .animate(
                    {
                        outlineColor : ELEMENT_FLASHING_OUTLINE_COLOR_3
                    },
                    100,
                    function() {
                        if (gHoverElement
                                && (gHoverElement.nodeName.toLowerCase() == 'iframe' || gHoverElement.nodeName.toLowerCase() == 'frame')) {
                            var iframeContentWindow = gHoverElement.contentWindow;
                            if (iframeContentWindow && currentEventOrigin) {
                                iframeContentWindow.postMessage("responseSuccess", currentEventOrigin);
                            }
                        }
                    });
}

function sendData() {
    if (!gHoverElement) {
        return;
    }
    if (gHoverElement.nodeName.toLowerCase() == 'iframe') {
        gHoverElement.contentWindow.postMessage("keyboardTriggerEvent", "*");
    } else {
        var jsonObject = mapDOM(gHoverElement, window);
        processObject(jsonObject);
    }
}

function keyUp(e) {
    if (isHotKeyPressed(spy_captureObjectHotKey, e)) {
        sendData();
        return;
    }
    if (isHotKeyPressed(spy_loadDomMapHotKey, e)) {
        forwardPostDomMapEvent();
    }
}

function isHotKeyPressed(hotkeyObject, event) {
    var keyCode = document.all ? window.event.keyCode : event.keyCode;
    var isAltKeyPressed = event ? event.altKey : window.event.altKey;
    var isCtrlKeyPressed = event ? event.ctrlKey : window.event.ctrlKey;
    var isShiftKeyPressed = event ? event.shiftKey : window.event.shiftKey;
    var isMetaKeyPressed = event ? event.metaKey : window.event.metaKey;
    return (keyCode === hotkeyObject.keyCode && isAltKeyPressed === hotkeyObject.useAltKey
            && isCtrlKeyPressed === hotkeyObject.useCtrlKey && isShiftKeyPressed === hotkeyObject.useShiftKey && isMetaKeyPressed === hotkeyObject.useMetaKey);
}

function postData(url, object) {
    if (!object) {
        return;
    }
    var data = 'element=' + encodeURIComponent(JSON.stringify(object));
    if (detectChrome()) {
        chromePostData(url, data, function(response) {
            if (response) {
                console.log(response)
                // error happenened
                alert(response);
                setTimeout(function() {
                    window.focus();
                }, 1);
                return;
            }
            flashElement();
        });
        return;
    }
    if (detectIE() && window.httpRequestExtension) {
        var response = window.httpRequestExtension.postRequest(data, url);
        if (response === '200') {
            flashElement();
        } else {
            alert(response);
        }
        return;
    }
    self.port.emit("postData", {
        url : url,
        data : data
    });
}

function setParentJson(object, parentJson) {
    if ('parent' in object) {
        setParentJson(object['parent'], parentJson);
        return;
    }
    object['parent'] = parentJson;
}

function isInTopWindow() {
    return window.location === window.parent.location;
}

function processObject(object) {
    if (!isInTopWindow()) {
        var event = {};
        event['name'] = 'forwardObject';
        event['data'] = object;
        window.parent.postMessage(JSON.stringify(event), "*");
        return;
    }
    postData(qAutomate_server_url, object);
}

function receiveMessage(event) {
    // Check if sender is from parent frame
    if (event.source === window.parent) {
        if (event.data == "responseSuccess" && gHoverElement) {
            flashElement();
        } else if (event.data == "keyboardTriggerEvent") {
            sendData();
        } else if (event.data == "parentLoadCompleted") {
            isParentReady = true;
        }
        return;
    }
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
    currentEventOrigin = event.origin;
    var eventObject = JSON.parse(event.data);
    switch (eventObject['name']) {
    case 'forwardObject':
        var object = eventObject['data'];
        var json = mapDOM(childFrame, window);
        if (json) {
            setParentJson(object, json);
        }
        processObject(object);
        break;
    case 'loadCompleted':
        var object = eventObject['data'];
        childFrame.domData = object;
        sendDomMap();
        break;
    case 'postDomMap':
        var object = eventObject['data'];
        childFrame.domData = object;
        forwardPostDomMapEvent();
        break;
    }
}

function startInspection() {
    if (!window.console) {
        console = {
            log : function() {
            }
        };
    }
    // START
    setupDOMSelection();

    // for Firefox
    if (!detectChrome() && !detectIE() && !(typeof self === 'undefined')) {
        self.on('message', function(message) {
            console.log(message.kind)
            console.log(message.text)
            if (message.kind == "postSuccess") {
                flashElement();
            } else if (message.kind == "postFail" || message.kind == "postDomMapSuccess") {
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