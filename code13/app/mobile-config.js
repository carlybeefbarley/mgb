App.info({
  id: 'com.mygamebuilder.mobile.app',
  version: '0.0.9',
  name: 'MGB',
})

App.configurePlugin('phonegap-plugin-push', {
  SENDER_ID: '418128596047',
})

App.accessRule('http://*')
App.accessRule('https://*')
// fix connection to the server was unsuccessful
App.setPreference('LoadUrlTimeoutValue', 60000, 'android')

App.setPreference('StatusBarOverlaysWebView', 'false')
App.setPreference('StatusBarBackgroundColor', '#000000')
App.setPreference('FullScreen', 'true')

/*
 iphone (60x60)
 iphone_2x (120x120)
 iphone_3x (180x180)
 ipad (76x76)
 ipad_2x (152x152)
 ipad_pro (167x167)
 ios_settings (29x29)
 ios_settings_2x (58x58)
 ios_settings_3x (87x87)
 ios_spotlight (40x40)
 ios_spotlight_2x (80x80)
 android_mdpi (48x48)
 android_hdpi (72x72)
 android_xhdpi (96x96)
 android_xxhdpi (144x144)
 android_xxxhdpi (192x192)
 */
App.icons({
  // iphone: 'public/images/favicons/favicon-60.png', - deprecated
  iphone_2x: 'public/images/favicons/favicon-120.png',
  iphone_3x: 'public/images/favicons/favicon-180.png',
  ipad: 'public/images/favicons/favicon-76.png',
  ipad_2x: 'public/images/favicons/favicon-152.png',
  ipad_pro: 'public/images/favicons/favicon-160.png', // missing actual size: 167
  ios_settings: 'public/images/favicons/favicon-32.png', // missing 29
  ios_settings_2x: 'public/images/favicons/favicon-57.png', // missing 58
  ios_settings_3x: 'public/images/favicons/favicon-96.png', // missing 87
  ios_spotlight: 'public/images/favicons/favicon-57.png', // missing 40
  ios_spotlight_2x: 'public/images/favicons/favicon-57.png', // missing 57
  android_mdpi: 'public/images/favicons/favicon-57.png', // missing 48
  android_hdpi: 'public/images/favicons/favicon-72.png',
  android_xhdpi: 'public/images/favicons/favicon-96.png',
  android_xxhdpi: 'public/images/favicons/favicon-144.png',
  android_xxxhdpi: 'public/images/favicons/favicon-192.png',
})
