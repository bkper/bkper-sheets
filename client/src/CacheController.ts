
namespace CacheController {

  var cache: any = new Object();
  
	export function put(key, valueObject) {
		if (valueObject != null) {
			var valueJson = JSON.stringify(valueObject);
			cache[key] = valueJson;
		}
  }
  
	export function get(key) {
		var valueJson = cache[key];
		if (valueJson != null) {
			return JSON.parse(valueJson);
		} else {
			return null;
		}
  }
  
	export function clear() {
		cache = new Object();
	}
};