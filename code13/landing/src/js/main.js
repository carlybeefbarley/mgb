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
