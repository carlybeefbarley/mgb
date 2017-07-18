/*

This is basic setup for server push notifications - proof of concept (works on android only). More work needs to be done before use it in the production. see TODOs

Basic usage:
  from terminal:

[code13/misc]$ . ./setupAndroid.sh
# make sure you have connected devices and adb is running
[code13/misc]$ adb devices
# start meteor on localhost and device
[code13/app]$ ./go-android.sh
# wait approx 1-5 minutes ........

[code13/app]$ xdg-open http://locahost:3000
# open dev tools
# in the console execute:
# Meteor.call("serverNotification", "Hello", "world")


more info here:
  * https://github.com/raix/push
  * https://medium.com/@acarabott/meteor-native-ios-push-notifications-heroku-raix-push-cordova-213f486c4e6d

To send notification open console (either dev tools or meteor)
`Meteor.call("serverNotification", "Hello", "world")`


TODO:
  * certs for ios: https://github.com/raix/push/wiki/raix:push-Newbie-Manual
  * icons/badges for notifications
  * clear notification - e.g. slack removes (hides) notification if message has been read from another device
 */

if (!Meteor.isServer) {
  Push.Configure({
    android: {
      senderID: 418128596047,
      alert: true,
      badge: true,
      sound: true,
      vibrate: true,
      clearNotifications: true,
      // icon: '',
      // iconColor: ''
    },
    ios: {
      alert: true,
      badge: true,
      sound: true,
    },
  })
} else {
  Push.Configure({
    //ios stuff
    /*
    apn: {
      certData: Assets.getText('certs/cert.pem'),
      keyData: Assets.getText('certs/key.pem'),
      passphrase: '',
      production: false,
      //gateway: 'gateway.push.apple.com',
    },
    */
    // google stuff
    gcm: {
      apiKey:
        'AAAAYVpoDE8:APA91bGqKMh6x9DFX61-Q9okdQCvWb0Si_44vy-wmkJalzRFA4aMHYs6CO0MwJzG_kK39IrRrKjHG6QR4iiuGfNRDOfxY9ejoUhi8hE1qyqlxfitncrw47HwhsEdedFiJ-uS6iBKs7D_',
      projectNumber: 418128596047,
    },
    production: false,
    sound: true,
    // 'badge' true,
    // alert: true,
    // vibrate: true,
    // sendInterval: 15000, Configurable interval between sending
    // sendBatchSize: 1, Configurable number of notifications to send per batch
    // keepNotifications: false,
  })
}

Push.debug = true
Meteor.startup(() => {
  Push.addListener('error', err => console.log('Push error:', err))
  Push.addListener('token', token => console.log('token received: ' + JSON.stringify(token)))
})

Meteor.methods({
  serverNotification: (title, text) => {
    console.log('Pushing to clients:', title, text)
    Push.send({
      title,
      text,
      from: 'server',
      badge: 1,
      query: {},
    })
  },
})
