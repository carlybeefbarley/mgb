App.info({
  "id": "com.mygamebuilder.mobile.app",
  "version": "0.0.5",
  "name": "MGB"
});
App.accessRule('http://*');
App.accessRule('https://*');
// fix connection to the server was unsuccessful
App.setPreference('LoadUrlTimeoutValue', 60000, 'android');

App.setPreference('StatusBarOverlaysWebView', 'false');
App.setPreference('StatusBarBackgroundColor', '#000000');
App.setPreference('FullScreen', 'true');
