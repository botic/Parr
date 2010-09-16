var client = require('ringo/httpclient');
var log = require('ringo/logging').getLogger(module.id);

export('FlickrClient');

function FlickrClient(apiKey, apiEndpoint) {
	var apiKey = apiKey;
	var apiEndpoint = apiEndpoint || "http://api.flickr.com/services/rest/";
	
	var callApi = function(method, params) {
		var values = {};
		var restUrl = [
				apiEndpoint,
				"?method=",
				method,
				"&api_key=",
				apiKey,
				"&format=json&nojsoncallback=1"
			];
			
		for (var param in params) {
			restUrl.push("&", param, "=", params[param]);
		}
			
		client.get(restUrl.join(""), function(data) {
			values = JSON.parse(data)
		});
		return values;
	};
	
	this.call = function (apiMethod, params) {
		if (!apiKey) {
			throw "Flickr API key missing!";
		}
		
		if (!apiMethod) {
			throw "API method missing!";
		}
		
		return callApi(apiMethod, params);
	};
};