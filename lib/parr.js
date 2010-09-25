importPackage(Packages.biz.naderer);

var client = require('ringo/httpclient');
var log = require('ringo/logging').getLogger(module.id);

export('FlickrClient');

function FlickrClient(apiKey, apiEndpoint, cacheSize, cacheLease) {
	var apiKey = apiKey;
	var apiEndpoint = apiEndpoint || "http://api.flickr.com/services/rest/";
	
	var cache = new SimpleCache(cacheSize || 100, cacheLease || 10000);
	
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
     		log.debug("cache miss");
		} else {
			log.debug("cache hit");
		}
		return result;
	};
	
	/**
	 * Converts the given ID into a base58 encoded string.
	 * @author Xenocryst - Antares Scorpii
	 * @see http://www.flickr.com/groups/api/discuss/72157616713786392/
	 */
	var base58 = function (num) {
	   if (typeof num !== 'number') {
	      num = parseInt(num, 10);
	   }
	   var enc = '', alpha='123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
	   var div = num, mod;
	   while (num >= 58) {
	      div = num / 58;
	      mod = num - (58 * Math.floor(div));
	      enc = '' + alpha.substr(mod,1) + enc;
	      num = Math.floor(div);
	   }
	   return (div) ? '' + alpha.substr(div, 1) + enc : enc;
	}
	
	/**
	 * Calls the Flickr-API
	 */
	this.call = function (apiMethod, params, useCache) {
		if (!apiKey) {
			throw "Flickr API key missing!";
		}
		
		if (!apiMethod) {
			throw "API method missing!";
		}
		
		return callApi(apiMethod, params, useCache || true);
	};
	
	/**
	 * Return the absolute URL to the Flickr farm.
	 */
	this.photoSourceURL = function(photo, format) {
		var fmString = format ? "_" + format : "";
		return ["http://farm", photo["farm"], ".static.flickr.com/",
				photo["server"], "/", photo["id"], "_", photo["secret"],
				fmString, ".jpg"].join("");
	}
	
	/**
	 * Returns the short url to the given photo
	 */
	this.photoShortUrl = function(photo) {
		return "http://flic.kr/p/" + base58(photo["id"]);
	}
};