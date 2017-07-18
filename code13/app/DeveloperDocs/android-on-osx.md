1.JDK:
---
  - 1.1. Java developement kit is required to buil apk - 
  you can skip this test if you already have installed java otherwise
  [download and install JDK](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)


2.ANDROID STUDIO:
---
  - 2.1 [Download and install Android Studio](https://developer.android.com/studio/install.html)
  - 2.2 Launch Android Studio

Prior installing it's worth to check out 
[meteor's guide](https://guide.meteor.com/mobile.html#installing-prerequisites-android)
for updates and news


3.INSTALLING SDK:
---
  - 3.1. In the android studio main screen click: Configure -> SDK Manager

  - 3.2. SDK Platforms: install Android 6.0 - API23

  - 3.3. SDK tools -> check: "Show all packages" (at the bottom of the window):
    - 3.3.1. Expand: Android SDK Build Tools -> select 23.0.3 and 25.0.2
    - 3.3.2. Click OK


4.WORKAROUND for Meteor bug: [#8464](https://github.com/meteor/meteor/issues/8464)
---
  - 4.1. Make sure bug is still in unresolved (open) state
  - 4.2. Download stand alone Android tools from: https://dl.google.com/android/repository/tools_r25.2.5-macosx.zip
  - 4.3. Replace tools in the $ANDROID_HOME (/Users/{YourUsername}/Library/Android/sdk with downloaded tools


5.CONNECTING
---
  - 5.1. Make sure that USB debugging is enabled on the device
  - 5.2. run: `adb devices` - this should list connected device


6.RUNNING:
---
  - 6.1. Open in the terminal: mgb/code13/app
  - 6.2. `./go-android.sh` - this should install latest app on the phone


7.DEBUGGING:
---
  - 7.1. Open chrome -> Developer tools (alt + cmd + i)
  - 7.2. Follow steps in the: https://github.com/devlapse/mgb/issues/239#issuecomment-276039886


8.SHARING:
---
  - 8.1. debug apk is located: mgb/code13/app/.meteor/local/cordova-build/platforms/android/build/outputs/apk/android-armv7-debug.apk


9.TROUBLESHOOTING:
---
  - 9.1. Cannot connect to device:
        execute: `adb devices` - this will start adb daemon
  - 9.2. signatures do not match the previously installed version
        manually delete app from phone or execute: `adb uninstall com.mygamebuilder.mobile.app`
  - 9.3. !!! Be aware that meteor has very strange behaviour: and it can load "last known good app"
        if current app will fail - and you will end up debugging some old version
