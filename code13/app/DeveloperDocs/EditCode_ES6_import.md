How it works:

1. Babel parses main (active) file and we extract imports from babel response
	* we are using babel on local scripts only - as libs should be (and usually are) already in ES5 standalone format for browser compatibility
2. There are several types of imports:
	* import [X [as Y] from] '/asset_name' (import asset's owners script by name)
	* import [X [as Y] from] '/user_name/asset_name' (import user_name script by name) - recommended if creating libs for sharing
	* import [X [as Y] from] 'lib':
		* if defined in knownLibs - retrieves file from known libs - check /public/lib/knownLibs.js and /public/lib/iframe_sandbox.js
		* else import file from wzrd.in service (browserified npm packages)
	* it's also possible to include custom version
	(by default we will include latest version for the lib):
	import [X [as Y] from] 'lib@version' (e.g. 'react@15.0.0')
	* it's also possible to include full url (usually works - I have tested with React / jQuery and jquery-validate plugin):
	import [X [as Y] from] '//some.cdn.com/hosted/lib/on/cdn/lib.min.js'
3. Caching:
	* before loading external source script is checking cache - we are using 2 ways to cache sources:
		1) we store imported variables in the separate object (as lib_name:exported_object map)
		and if lib is defined we will immediately return defined object
		2) if lib is not defined - we will check parent window for cached source -
		in the similar manner as exported objects (as lib_name:lib_source_string map)
			* if source has been found on the map - then we will load it from cache
			* else we will request source from external resource (usually CDN)
	* local user scripts are not cached -
		as user(s) may work on multiple files at the same time (space for improvements?)
4. in the knownLibs it's possible to define different source or way how lib is loaded:
```javascript
...
custom_lib: {
  // set to true if lib imports global variables only:
  // usually same effect as appending source in the html: <head><script src="..."></script></head>
  useGlobal: true,
  src: function(version){ // custom function to retrieve lib by version
    return '//another.cdn.com/lib_location/' + lib_version + '/lib_source.js'
  }
}
```

Notes:
* wzrd.in service (browserify) bundles extra packages and is not suitable in many cases..
but it can be used as fallback for some common packages e.g. jQuery,
in general it's still better to load package from CDN
e.g.:
```javascript
import React from 'react'
import reactDOM from 'react-dom'
// when requested from wzrd.in,
// react-dom will include extra version of React - but won't expose (export) that react version to other modules
// and in finaly React will complain about 2 separate versions:
// "You might be adding a ref to a component that was not created inside a component's `render` method, or you have multiple copies of React loaded"
```

