var qAutomate_server_url = KATALON_SERVER_URL_PREFIX + katalonServerPort + KATALON_SERVER_URL_SUFFIX;
function initKatalonServerUrl(port) {
	qAutomate_server_url = KATALON_SERVER_URL_PREFIX + port + KATALON_SERVER_URL_SUFFIX;
}
getKatalonServerPort(initKatalonServerUrl);