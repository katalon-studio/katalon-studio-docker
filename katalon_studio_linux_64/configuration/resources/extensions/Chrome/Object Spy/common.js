//Recursively loop through DOM elements and assign properties to object
function treeHTML(element, object, currentWindow) {
	if (!element) {
		return;
	}
	object["type"] = element.nodeName.toLowerCase();
	object["attributes"] = {};
	if (element.attributes != null && element.attributes.length) {
		for (var i = 0; i < element.attributes.length; i++) {
			if ((element.attributes[i].value !== '') && (element.attributes[i].value != null) && (element.attributes[i].value !== 'null')) {
				object["attributes"][element.attributes[i].nodeName] = element.attributes[i].value;
			}
		}
	}
	var text = getTextFromNode(element, true);
	if (text !== '') {
		object["attributes"]["text"] = text;
	}
	
	var xpath = createXPathFromElement(element);
	if (xpath) {
		object['xpath'] = xpath;
	} else {
		object['xpath'] = '';
	}
	
	if (window.location === window.parent.location) {
		object["page"] = {};
		object["page"]['url'] = currentWindow.document.URL;
		object["page"]['title'] = currentWindow.document.title;
	}
}

function getTextFromNode(node, addSpaces) {
    var i, result, text, child;
    result = '';
    for (i = 0; i < node.childNodes.length; i++) {
        child = node.childNodes[i];
        text = null;
        if (child.nodeType === 3) {
            text = child.nodeValue;
        }
        if (text) {
            if (addSpaces && /\S$/.test(result) && /^\S/.test(text)) text = ' ' + text;
            result += text;
        }
    }
    return result;
}

function mapDOM(element, currentWindow) {
	var treeObject = {};

	// If string convert to document Node
	if (typeof element === "string") {
		if (window.DOMParser) {
			  parser = new DOMParser();
			  docNode = parser.parseFromString(element,"text/xml");
		} else { // Microsoft strikes again
			  docNode = new ActiveXObject("Microsoft.XMLDOM");
			  docNode.async = false;
			  docNode.loadXML(element); 
		} 
		element = docNode.firstChild;
	}

	treeHTML(element, treeObject, currentWindow);
	return treeObject;
}

function createDomMap() {
	var bodyJsonObject = mapDOM(document.documentElement , window);
	var childJsonArrayObjects = getChilds(document.documentElement);
	if (childJsonArrayObjects != null) {
		bodyJsonObject['children'] = childJsonArrayObjects;
	}
	return bodyJsonObject;
}

function getChilds(element) {
	if ((element.nodeName.toLowerCase() == 'iframe' || element.nodeName.toLowerCase() == 'frame') && element.domData) {
		return [element.domData]
	}
	if (element.childNodes.length <= 0) {
		return null;
	}
	var childElementJsonArray = [];
	for (var i = 0; i < element.childNodes.length; i++) {
		var childElement = element.childNodes[i];
		if (childElement.nodeType == 3) {
			continue;
		}
		var childJsonObject = mapDOM(childElement, window);
		var childJsonArrayObjects = getChilds(childElement);
		if (childJsonArrayObjects != null) {
			childJsonObject['children'] = childJsonArrayObjects;
		}
		childElementJsonArray.push(childJsonObject);
	}
	return childElementJsonArray;
}

if (!String.prototype.trim) {
    (function() {
        // Make sure we trim BOM and NBSP
        var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
        String.prototype.trim = function() {
            return this.replace(rtrim, '');
        };
    })();
}

function createXPathFromElement(element) { 
	var allNodes = document.getElementsByTagName('*'); 
	for (var segs = []; element && element.nodeType == 1; element = element.parentNode)  { 
		if ((element.getAttribute('id') != null) && (element.getAttribute('id') !== '')) {
			var uniqueIdCount = 0; 
			for (var n=0;n < allNodes.length;n++) { 
				if (((allNodes[n].getAttribute('id') != null) || (allNodes[n].getAttribute('id') !== '')) && allNodes[n].id == element.id) uniqueIdCount++; 
				if (uniqueIdCount > 1) break; 
			}; 
			if ( uniqueIdCount == 1) { 
				segs.unshift('id("' + element.getAttribute('id') + '")'); 
				return segs.join('/'); 
			}
			if (element.nodeName) { 
				segs.unshift(element.nodeName.toLowerCase() + '[@id="' + element.getAttribute('id') + '"]'); 
			} 
		} else if ((element.getAttribute('class') != null) && (element.getAttribute('class') !== '')) {
			segs.unshift(element.nodeName.toLowerCase() + '[@class="' + element.getAttribute('class').trim() + '"]'); 
		} else { 
			for (i = 1, sib = element.previousSibling; sib; sib = sib.previousSibling) { 
				if (sib.nodeName == element.nodeName)  i++; 
			}
			segs.unshift(element.nodeName.toLowerCase() + '[' + i + ']');
		}; 
	}; 
	return segs.length ? '/' + segs.join('/') : null; 
};

function detectIE() {
	var ua = window.navigator.userAgent;
	var msie = ua.indexOf('MSIE ');
	if (msie > 0) {
		// IE 10 or older => return version number
		return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
	}

	var trident = ua.indexOf('Trident/');
	if (trident > 0) {
		// IE 11 => return version number
		var rv = ua.indexOf('rv:');
		return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
	}

	var edge = ua.indexOf('Edge/');
	if (edge > 0) {
	   // IE 12 => return version number
	   return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
	}

	// other browser
	return false;
}

function detectChrome() {
	return (typeof chrome !== 'undefined') && (typeof chrome.extension !== 'undefined');
}