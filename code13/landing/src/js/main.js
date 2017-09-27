window.addEventListener('load', function() {
  // ----------------------------------------
  // Utils
  // ----------------------------------------
  function throttle(func) {
    var isThrottled = false

    return function throttledFunc() {
      if (isThrottled) return

      func()
      isThrottled = true
      requestAnimationFrame(function() { isThrottled = false })
    }
  }

  // ----------------------------------------
  // Lazy
  // ----------------------------------------
  function createLazyMedia($lazy) {
    var tag = $lazy.getAttribute('data-lazy-tag')
    var $media = document.createElement(tag)

    // copy all data-lazy-* attrs to lazy loaded element
    for (var i = $lazy.attributes.length - 1; i >= 0; i--) {
      var attr = $lazy.attributes[i]
      if (/data-lazy-(?!tag)/.test(attr.name)) {
        $media.setAttribute(attr.name.replace('data-lazy-', ''), attr.value)
      }
    }

    $media.classList.add('mgb-lazy-media')

    //
    // Lazy Videos
    //
    var isVideo = $media instanceof HTMLVideoElement
      && typeof $media.play === 'function'
      && typeof $media.pause === 'function'
      && typeof $media.paused === 'boolean'

    if (isVideo) {
      $media.setAttribute('controls', true)
      $media.setAttribute('loop', true)
      $media.setAttribute('autoplay', true)
      $media.style.cursor = 'pointer'
      $media.style.background = '#000'
      $media.addEventListener('click', function(e) {
        $media.paused ? $media.play() : $media.pause()
      })
    }

    //
    // Lazy Iframes
    //
    var isIframe = $media instanceof HTMLIFrameElement

    if (isIframe) {
      // fill parent container mobile/desktop chrome/safari compatible
      $media.style.width = '0'
      $media.style.minWidth = '100%'
      $media.style.maxWidth = '100%'
      $media.style.height = '100%'
      // remove iframe borders
      $media.style.border = 'none'
    }
    return $media
  }

  // lazy loads and auto -loop-play videos on click
  document.querySelectorAll('.mgb-lazy').forEach(function($lazy) {
    var $cover = $lazy.querySelector('img')

    $cover.addEventListener('click', function() {
      var $media = createLazyMedia($lazy)
      $lazy.appendChild($media)

      // the lazy media may take a moment to appear
      // add a loader in the zIndex layer beneath the media
      var $loader = document.createElement('div')
      $loader.setAttribute('class', 'ui inverted active loader')
      $lazy.appendChild($loader)

      // let the browser settle before invoking css transitions
      setTimeout(function() {
        $lazy.classList.add('mgb-lazy-initialized')

        // autoplay doesn't work on mobile devices
        if ($media.play) $media.play()
      }, 100)
    }, {
      once: true,
    })
  })

  // ----------------------------------------
  // Analytics
  // ----------------------------------------
  if (location.hostname !== 'localhost') {
    //
    // Google
    //
    (function(i, s, o, g, r, a, m) {
      i['GoogleAnalyticsObject'] = r
      i[r] = i[r] || function() {
        (i[r].q = i[r].q || []).push(arguments)
      }, i[r].l = 1 * new Date()
      a = s.createElement(o),
        m = s.getElementsByTagName(o)[0]
      a.async = 1
      a.src = g
      m.parentNode.insertBefore(a, m)
    })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga')

    ga('create', 'UA-82379171-2', 'auto')
    ga('send', 'pageview')

    //
    // Hotjar
    //
    function initHotjar() {
      (function(h, o, t, j, a, r) {
        h.hj = h.hj || function() {(h.hj.q = h.hj.q || []).push(arguments)}
        h._hjSettings = { hjid: 446876, hjsv: 5 }
        a = o.getElementsByTagName('head')[0]
        r = o.createElement('script')
        r.async = 1
        r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv
        a.appendChild(r)
      })(window, document, '//static.hotjar.com/c/hotjar-', '.js?sv=')
    }

    setTimeout(initHotjar, 200)
  }

  // ----------------------------------------
  // For Everyone Tabs
  // ----------------------------------------
  var $forEveryoneMenus = document.querySelectorAll('.mgb-for-everyone-menu')
  var $forEveryoneMain = document.querySelector('.mgb-for-everyone-main')
  var $forEveryoneSecondary = document.querySelector('.mgb-for-everyone-secondary')
  var $forEveryoneDivider = document.querySelector('.mgb-for-everyone-divider')
  var tabs = {
    Students: {
      main: $forEveryoneMain.innerText,
      secondary: $forEveryoneSecondary.innerText,
    },
    Parents: {
      main: 'We turn game <em>players</em> into game <em>builders</em>',
      secondary: 'We provide all-in-one tools and training that let kids develop real skills and confidence within a safe and encouraging community.',
    },
    GameJammers: {
      main: 'Focus on gameplay',
      secondary: 'Integrated editors and importers for graphics, maps, sounds, and music. Frictionless workflows, but <strong>not</strong> a toy. Use ES6 with modules, code with an IDE, multi-frame and multi-layer graphic editor, TMX map editor, JSFXR synths, and more.',
    },
    Artists: {
      main: 'You draw, paint, compose, write... but coding sound like hell?',
      secondary: 'Great! Come find some crazy coder-types to work with. Combine your talents and make games in a team.',
    },
    Teachers: {
      main: 'MGB is for enrichment',
      // Point your students to our tutorials, then go get a nice cup of tea & have a break. You deserve it!
      secondary: 'We support a progressive and self-supporting learning model for ages 13+.  Our core team and extended community will explain and debug problems, live, within the system. We foster a pay-it-forward learning culture.',
    },
    Trolls: {
      main: 'HAHA we lied... <strong>NO TROLLS ALLOWED</strong>',
      secondary: 'Seriously, we have <strong>ZERO</strong> tolerance for <strong>any</strong> kind of negativity, abuse, disrespect or discrimination. We are eagle-eyed and quick to ban.',
    },
  }

  var handleForEveryoneMenuClick = function handleClick(e) {
    var activeTab = tabs[e.target.innerText]

    if (!activeTab) {
      return
    }

    // set tabs
    $forEveryoneMain.innerHTML = activeTab.main
    $forEveryoneSecondary.innerHTML = activeTab.secondary

    // set active item
    $forEveryoneMenus.forEach(function($menu) {
      var $items = $menu.querySelectorAll('.item')
      $items.forEach(function($item) {
        $item.classList.remove('active')
      })
      $menu.addEventListener('click', handleForEveryoneMenuClick)
    })

    e.target.classList.add('active')
  }

  $forEveryoneMenus.forEach(function(menu) {
    menu.addEventListener('click', handleForEveryoneMenuClick)
  })

  var updateForEveryoneResponsiveMenu = function updateForEveryoneResponsiveMenu(e) {
    if (window.outerWidth >= 768) {
      $forEveryoneMenus.forEach(function(elm) {
        elm.classList.remove('three', 'item')
      })
      $forEveryoneDivider.classList.add('hidden')
    } else {
      $forEveryoneMenus.forEach(function(elm) {
        elm.classList.add('three', 'item')
      })
      $forEveryoneDivider.classList.remove('hidden')
    }
  }

  // set initial state
  updateForEveryoneResponsiveMenu()

  // ----------------------------------------
  // Main Menu
  // ----------------------------------------

  var $menu = document.querySelector('.mgb-main-menu')
  // clear the initial transparent inline style, then extract the initial background color
  // this allows the menu to load initially transparent and prevents flickering
  $menu.style.background = ''
  var menuBackgroundColor = window.getComputedStyle($menu).backgroundColor

  var setMenuTransparency = throttle(function(e) {
    // how far faded in the menu is, according to its scroll position
    var menuFadeInRatio = Math.min(100, Math.max(0, window.scrollY * 1.5)) / 100

    $menu.style.background = menuBackgroundColor.replace(/rgb\((.*)\)/, 'rgba($1, ' + menuFadeInRatio + ')')
    $menu.style.boxShadow = [
      '0 ', menuFadeInRatio * 5, 'px ', menuFadeInRatio * 10, 'px rgba(0, 0, 0, ', menuFadeInRatio * 0.25, ')',
    ].join('')
  })

  // set initial transparency
  setMenuTransparency()

  // update on scroll/resize
  document.addEventListener('scroll', setMenuTransparency)

  // ----------------------------------------
  // Handle Resize
  // ----------------------------------------

  var handleWindowResize = function handleWindowResize(e) {
    setMenuTransparency(e)
    updateForEveryoneResponsiveMenu(e)
  }

  window.addEventListener('resize', handleWindowResize)

  // ----------------------------------------
  // Particles
  // ----------------------------------------
  var particlesId = 'particles-container'

  // Heads Up!
  //
  // Keep in sync with code13/app/client/imports/particlesjs-config.js
  window.particlesJS(particlesId, {
    retina_detect: true,
    particles: {
      number: {
        value: 100,
        density: { enable: true, value_area: 800 },
      },
      color: { value: '#e6ffff' },
      shape: {
        type: 'circle',
        stroke: { width: 0, color: '#000000' },
      },
      opacity: {
        value: 0.7,
        random: true,
        anim: { enable: true, speed: 1, opacity_min: 0 },
      },
      size: {
        value: 3,
        random: true,
        anim: { enable: true, speed: 1, size_min: 1 },
      },
      line_linked: { enable: true, distance: 15, color: '#ffffff', opacity: 0.7, width: 1 },
      move: { enable: true, speed: 1, direction: 'top', random: true, out_mode: 'out' },
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onhover: { enable: true, mode: 'grab' },
        onclick: { enable: true, mode: 'repulse' },
        resize: true,
      },
      modes: {
        grab: {
          distance: 150,
          line_linked: { opacity: 0.4 },
        },
        repulse: { distance: 200, duration: 0.4 },
      },
    },
  })

  var $particlesContainer = document.querySelector('#' + particlesId)
  $particlesContainer.classList.add('initialized')

  // ----------------------------------------
  // Message to console peekers
  // ----------------------------------------

  console.log(
    '%cHello Curious hacker-type people who like to look under the hood!\n' +
    'How r u?\n\n' +
    'Since we are here, and you seem to know your way around, here\'s the deal...\n' +
    '1. This site is primarily designed as a great + _frictionless_ environment for people to learn to code _substantial_ projects.. Learning by Doing!\n' +
    '2. We strive to create a system that allows complex multi-module games to be built (see "Project Cube" and "City3D" for example)\n' +
    '3. ...Yet we also provide learning-support for complete newbies to develop their skills in JavaScript, Art and other areas. They may also make pretty substantial games without code using "Actors" and "ActorMap" assets.\n' +
    '4. We have optimized the experience for middle-school/high-school aged kids, but this is NOT A TOY (scratch etc) and advanced users CAN do serious work in it.\n' +
    '   Even JavaScript ninjas can appreciate the collaborative tools and ability to experiment quickly (we do!)\n\n' +
    'Also, this site is in BETA, so expect...\n' +
    'a. Bugs!\n' +
    'b. Lots of TODO perf optimizations (css-size, shouldComponentUpdate, etc..)\n' +
    'c. Some incomplete experience paths (the analytics/biz/legal/design skills tutorials etc)\n' +
    'd. This site works well on Chrome, but other browsers usually have some issues.. please use Chrome for now\n' +
    'e. We do not handle phone-width screens well (yet... but we have a team working on mobile...)\n\n' +
    'Quick FAQ:\n' +
    'Q: Do we intend to support git?\nA: Yes, but not initially... we are initially pushing a google-docs + semver-packages model for small groups, and will add git workflows later. We also believe that kids will appreciate truly version control mostly once they have mangled some files first, so it is a semi-intentional part of the learning experience...\n' +
    '\nQ: Why are projects so weird?\nA: Because we want to create a frictionless free-flowing system as a priority, so for now projects are tags.\n   This makes it easy to use parts of one game in another.\n   We will support strict projects (an asset can only be in one project) in future.\n' +
    '\nQ: Do you have 2048 example?\nA: yes! Hi HN folks!  We also have a whack-a-mole example of course\n' +
    '\nQ: Why just JavaScript?\nA: Focus, and simplicity. There are lots of other great languages, but JavaScript (ES6) can be presented simply for learning, and now has pretty fancy features including async capabilities. JS is nearly always going to be encountered in browser scenarios, and is good-enough on the server for the most common needs. Sorry Rust/Haskell fans, we love your cool stuff though...\n' +
    '\nQ: Oooh. server?\nA: Oh yes!!! Server multiplayer stuff is on the horizon. Our design goal is to enable users to easily implement .io style games for example. Should be fun!\n' +
    '\nQ: Are you going to Open Source this?\nA: Most of it..and in a super-cool way! The MGB core system is designed to actually have the Asset editors, flexPanels and game runtime systems to be run as *plugins*, and we intend to expose these (and also subtools within editors) as plugins that can be forked/extended/shared within MGB itself! We have disabled that for launch since it adds a LOT of surface area, but it is a very explicit goal for the team to have the majority of the site be open sourced WITHIN ITSELF: plugins written in MGB extending the MGB core platform. so our GameBuilder users can become GameBuilderBuilders! and yes, maybe they can sell the plugin tools as assets somehow...\n' +
    '\nQ: I want to know more!\nA: Come chat with us in-system, or tweet to @dgolds\n ^^^ GLHF ^^^\n',
    'color: #5c2197' // http://bada55.io ftw
  )
})
