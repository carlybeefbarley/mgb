const deepClone = (obj) =>
	Array.isArray(obj)
	? obj.map(deepClone)
	: Object.keys(obj)
	    .reduce((newObject, objKey, i) => {
	        const value = obj[objKey];
	        const newValue = (typeof value === 'object' && !Array.isArray(value))
	                    ? deepClone(value)
	                    : (Array.isArray(value))
	                      ? value.map(deepClone)
	                      : value;

	        return {
	            ...newObject,
	            [objKey]: newValue
	        }
	    }, {})

export default deepClone