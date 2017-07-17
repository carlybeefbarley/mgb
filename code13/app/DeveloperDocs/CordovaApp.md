Pros:
 -----
 - Development, testing and debugging of direct (on site) features
 are exactly same as it would be with web app - 
 as you can simply connect to local server on the local network from mobile device.
 

Cons:
 -----
 - it's very hard to debug native application:
   - meteor / cordova build caching is huge issue
     very often you will need to 
     delete app manually from the device 
     and delete .meteor/local/cordova-build folder - to get new version of the app
   
   - build times are high 1-5 minutes - 
     doing app (native) specific changes are super annoying
     and meteor's hot reload doesn't help at all due caching issues.
     This leads to incredibly slow development process
  
 - Performance is below average 
   - getMeteorData seems to be main issue here - need to find way to somehow cache 
     getMeteorData response (most noticeable when opening/closing: *More -> Profile*)
   
   - swiping works,
     but feels slow (cheap-ish). I also tried crosswalk - 
     feels a little bit quicker, but this probably depends on android version


 - builds tends to break from update to update without any reason - 
   this is frustrating as usually dev needs to spend extra hours searching net for solutions


 
Status so far:
----
  - Some components has been detached from app and used directly (as standalone) (e.g. fpAsset, Chat)
    this allows to use them directly in the swipeable view 
    
  - added extra navigation overlay - rest of the links in the page works
  
  - added special option to Qlink - that allows to switching tabs instead of navigating: 
    e.g. button: Misc->Help - leads to Chat->Help channel
    
  - added seamless fullscreen for code games
  
  - fixed screen controller related issues (Portal ftw) 
    Particulary position: static and swipeable views don't work together nicely 
    
  - added native Push notifications as a proof of concept - as this is native feature
    and can't be tested directly from mobile chrome - new apk needs to be build on every
    small change - this is time consuming 
