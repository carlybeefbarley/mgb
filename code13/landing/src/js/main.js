// ----------------------------------------
// Utils
// ----------------------------------------
function throttle (func) {
  var isThrottled = false

  return function throttledFunc () {
    if (isThrottled) return

    func()
    isThrottled = true
    requestAnimationFrame( function () { isThrottled = false } )
  }
}

// ----------------------------------------
// Main Menu
// ----------------------------------------

var $menu = document.querySelector( '.mgb-main-menu' )
var $heroCaption = document.querySelector( '.mgb-hero-caption' )
var $menuSignupButton = $menu.querySelector( '.mgb-menu-signup-button' )

var setMenuTransparency = throttle( function (e) {
  var menuRect = $menu.getBoundingClientRect()
  var heroCaptionRect = $heroCaption.getBoundingClientRect()

  // how far faded in the menu is, according to its scroll position
  const inRatio = Math.min( 100, Math.max( 0, 100 - (heroCaptionRect.bottom - menuRect.bottom) ) ) / 100

  $menu.style.background = 'rgba(20, 150, 160, ' + inRatio + ')'
  $menu.style.boxShadow = '0 ' + inRatio * 5 + 'px ' + inRatio * 10 + 'px rgba(0, 0, 0, ' + inRatio * 0.25 + ')'
  $heroCaption.style.opacity=(heroCaptionRect.bottom / heroCaptionRect.height)
  if (inRatio >= 1) {
    $menuSignupButton.classList.remove('basic')
  } else {
    $menuSignupButton.classList.add('basic')
  }
} )

// set initial transparency
setMenuTransparency()

// update on scroll/resize
document.addEventListener( 'scroll', setMenuTransparency )
window.addEventListener( 'resize', setMenuTransparency )


console.log(
'Hello Curious hacker-type people who like to look under the hood!\n' + 
'How r u?\n\n' + 
'Since we are here, and you seem to know your way around a bit, here\'s the deal...\n'+
'1. This site is primarily designed as a great + _frictionless_ environment for people to learn to code _substantial_ projects.. Learning by Doing!\n'+
'2. We strive to create a system that allows complex multi-module games to built (see "Project Cube" for example)\n'+
'3. ...Yet we also provide learning-support for complete newbies to develop their skills in JavaScript, Art and other areas\n'+
'4. We have optimized the experience for middle-school/high-school aged kids, but this is NOT A TOY (scratch etc) and advanced users CAN do serious work in it.\n'+
'   Even JavaScript ninjas can appreciate the collaborative tools and ability to experiment quickly (we do!)\n\n'+
'Also, this site is in BETA, so expect...\n'+
'a. Bugs!\n'+
'b. Lots of TODO perf optimizations (css-size, shouldComponentUpdate, etc..)\n'+
'c. Some incomplete experience paths (the analytics/biz/legal/design skills tutorials etc)\n'+
'd. This site works well on Chrome, but other browsers usually have some issues.. please use Chrome for now\n' + 
'e. We do not handle phone-width screens well (yet... but we have a team working on mobile...)\n\n'+
'Quick FAQ:\n'+
'Q: Do we intend to support git?\nA: Yes, but not initially... we are initially pushing a google-docs + semver-packages model for small groups, and will add git workflows later. We also believe that kids will appreciate truly version control mostly once they have mangled some files first, so it is a semi-intentional part of the learning experience...\n'+
'\nQ: Why are projects so weird?\nA: Because we want to create a frictionless free-flowing system as a priority, so for now projects are tags.\n   This makes it easy to use parts of one game in another.\n   We will support strict projects (an asset can only be in one project) in future.\n'+
'\nQ: Do you have 2048 example?\nA: yes! Hi HN folks!  We also have a whack-a-mole example of course\n'+
'\nQ: Why just JavaScript?\nA: Focus, and simplicity. There are lots of other great languages, but JavaScript (ES6) can be presented simply for learning, but now has pretty fancy features including async capabilities. JS is nearly always going to be encountered in browser scenarios, and is good-enough on the server for the most common needs. Sorry Rust/Haskell fans, we love your cool stuff though...\n'+
'\nQ: Oooh. server?\nA: Oh yes!!! Server multiplayer stuff is on the horizon. Our design goal is to enable users to easily implement .io style games for example. Should be fun!\n'+
'\nQ: I want to know more!\nA: Come chat with us in-system, or tweet to @dgolds\n ^^^ GLHF ^^^\n'
)