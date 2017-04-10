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
'Hello Curious hacker-type people!\n' + 
'how r u?\n\n' + 
'Since we are here, and you seem to know your way around a bit, here\'s the deal...\n'+
'1. This is primarily designed as a great frictionless place for people to learn to code real projects\n'+
'2. We have tried to create a system that allows quite significant games to built (see "Project Cube" for example\n'+
'3. Yet we also provide support for complete n00bs to learn JavaScript, Art, etc\n'+
'4. We have optimized for middle-school aged kids, but this is NOT A TOY and you can do serious work in it.\n   Even js nnjas will find thing liek the easy module bundling and the CodeMentor useful we think (we do!)\n\n'+
'Also it is in Beta, so expect...\n'+
'a. Bugs!\n'+
'b. Lots of TODO perf optimizations (css-size, shouldComponentUpdate, etc..)\n'+
'c. Some incomplete experience paths (the analytics/biz/legal/design skills tutorials etc)\n\n'+
'd. Works best on Chrome. Kind of iffy even then on phones and tablets.. for now...\n'+
'Quick FAQ:\n'+
'Q: Do we intend to support git?\nA: Yes, but not initially... we are pushing a google-docs+semver-packages model for small groups, and will add git workflows later\n'+
'\nQ: Why are projects so weird?\nA: Because we want to create a frictionless free-flowing system as a priority, so for now projects are tags.\n   This makes it easy to use parts of one game in another.\n   We will support strict projects (an asset can only be in one project) in future.\n'+
'\nQ: Do you have 2048 example?\nA: yes! also whack-a-mole of course\n'+
'\nQ: Why just javascript?\nA: Focus, and simplicity. There are lots of other great languages, but javascript (ES6) is plenty good for learning and also can be used on server and client\n'+
'\nQ: Oooh. server?\nA: Oh yes. Server multiplayer stuff is on the horizon. Design goal is to be able to easily implement .io style games for example\n'+
'\nQ: I want to know more!\nA: Come chat with us in-system, or tweet to @dgolds\nGLHF/'
)