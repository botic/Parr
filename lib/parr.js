importPackage(Packages.biz.naderer);

var client = require('ringo/httpclient');
var log = require('ringo/logging').getLogger(module.id);

export('FlickrClient');

function FlickrClient(apiKey, apiEndpoint, cacheSize, cacheLease) {
	var apiKey = apiKey;
	var apiEndpoint = apiEndpoint || "http://api.flickr.com/services/rest/";
	
	var cache = new SimpleCache(cacheSize || 100, cacheLease || 5000);
	
	var callApi = function(method, params, useCache) {
		var values = {};
		var restUrl = [
				apiEndpoint,
				"?method=",
				encodeURI(method),
				"&api_key=",
				encodeURI(apiKey),
				"&format=json&nojsoncallback=1"
			];
			
		for (var param in params) {
			restUrl.push("&", encodeURI(param), "=", encodeURI(params[param]));
		}
		
		var toCall = restUrl.join("");
		var result;
		if (!useCache || (result = cache.get(toCall)) == null) {
			client.get(toCall, function(data) {
				result = JSON.parse(data);
				cache.put(toCall, result);
			});
     		log.info("cache miss");
		} else {
			log.info("cache hit");
		}
		return result;
	};
	
	this.call = function (apiMethod, params, useCache) {
		if (!apiKey) {
			throw "Flickr API key missing!";
		}
		
		if (!apiMethod) {
			throw "API method missing!";
		}
		
		return callApi(apiMethod, params, useCache || true);
	};
};