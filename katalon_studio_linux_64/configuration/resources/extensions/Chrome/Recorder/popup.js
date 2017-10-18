initOnOffButton();
initPortText();
addEventHandler();

function initOnOffButton() {
	getKatalonOnOffStatus( function(isOn) {
		console.log(isOn)
		document.getElementById("katalon_onoffswitch").checked = isOn;
		$('#katalon_onoffswitch').data('clicks', isOn);
		$("#katalon_onoffswitch_label").addClass("onoffswitch-label");
	});
}

function initPortText() {
	getKatalonServerPort( function(port) {
		document.getElementById("port").value = port;
	});
}

function addEventHandler() {
	$('#katalon_onoffswitch').click(function() {
		var clicks = $(this).data('clicks');
		setKatalonOnOffStatus(!clicks)
		$(this).data("clicks", !clicks);
	});
	$('#port').on('input', function() {
		setKatalonServerPort($(this).val())
	});
}