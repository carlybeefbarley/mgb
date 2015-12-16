# i18n

We are using the [universe:i18n](https://atmospherejs.com/universe/i18n) Meteor package for internationalization support

* The code to initialize the client/server is in \_startup-i18n.js and currently just works based on the browser language
* The i18n files are in the .yml files in this folder
* The universe:i18n library supports progressive fallback from xx-XX to xx to en-US on a per-string basis
* The universe:i18n package downloads the i18n files asynchronously, so there is some chance the UI may start in en_US and then 

