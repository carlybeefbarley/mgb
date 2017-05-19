window.addEventListener( 'load', function () {
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
  // For Everyone Tabs
  // ----------------------------------------
  var $forEveryoneMenus = document.querySelectorAll( '.mgb-for-everyone-menu' )
  var $forEveryoneMain = document.querySelector( '.mgb-for-everyone-main' )
  var $forEveryoneSecondary = document.querySelector( '.mgb-for-everyone-secondary' )
  var $forEveryoneDivider = document.querySelector( '.mgb-for-everyone-divider' )
  var tabs = {
    Students:    {
      main:      $forEveryoneMain.innerText,
      secondary: $forEveryoneSecondary.innerText
    },
    Parents:     {
      main:      "We love helping game <em>players</em> become game <em>builders</em> - and we have helped many so far.",
      secondary: "We provide all-in-one tools & training that let kids develop real skills & confidence within a safe, encouraging community.",
    },
    GameJammers: {
      main:      "Integrated editors/importers for graphic/map/sound/music so you can focus on gameplay. No toolchain+git side-quests!",
      secondary: "Frictionless workflows, but <strong>not</strong> a toy. ES6+modules code/IDE; Multi-frame/layer graphic editor; TMX Map editor; JSFXR synths; and more."
    },
    Artists:     {
      main:      "You can draw/paint/compose/write?... but coding sounds like hell to you?",
      secondary: "Great! Come find some crazy coder-types to work with. Combine your talents and make games in a team."
    },
    Teachers:    {
      main:      "MGB is ideal for enrichment. It supports a progressive and self-supporting learning model for age 13+",
      // Point your students to our tutorials, then go get a nice cup of tea & have a break. You deserve it!
      secondary: "Our core team and extended community will explain and debug problems, live, within the system. We foster a pay-it-forward learning culture."
    },
    Trolls:      {
      main:      "HAHA we lied... <strong>NO TROLLS ALLOWED</strong>",
      secondary: "Seriously, we have <strong>ZERO</strong> tolerance for <strong>any</strong> kind of negativity, abuse, disrespect or discrimination. We are eagle-eyed and quick to ban."
    }
  }

  var handleForEveryoneMenuClick = function handleClick (e) {
    var activeTab = tabs[e.target.innerText]

    if (!activeTab) {
      return
    }

    // set tabs
    $forEveryoneMain.innerHTML = activeTab.main
    $forEveryoneSecondary.innerHTML = activeTab.secondary

    // set active item
    $forEveryoneMenus.forEach( function ($menu) {
      var $items = $menu.querySelectorAll( '.item' )
      $items.forEach( function ($item) {
        $item.classList.remove( 'active' )
      } )
      $menu.addEventListener( 'click', handleForEveryoneMenuClick )
    } )

    e.target.classList.add( 'active' )
  }

  $forEveryoneMenus.forEach( function (menu) {
    menu.addEventListener( 'click', handleForEveryoneMenuClick )
  } )

  var updateForEveryoneResponsiveMenu = function updateForEveryoneResponsiveMenu (e) {
    if (window.outerWidth >= 768) {
      $forEveryoneMenus.forEach( function (elm) {
        elm.classList.remove( 'three', 'item' )
      } )
      $forEveryoneDivider.classList.add( 'hidden' )
    } else {
      $forEveryoneMenus.forEach( function (elm) {
        elm.classList.add( 'three', 'item' )
      } )
      $forEveryoneDivider.classList.remove( 'hidden' )
    }
  }

  // set initial state
  updateForEveryoneResponsiveMenu()

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
    $heroCaption.style.opacity = (heroCaptionRect.bottom / heroCaptionRect.height)
  } )

  // set initial transparency
  setMenuTransparency()

  // update on scroll/resize
  document.addEventListener( 'scroll', setMenuTransparency )

  // ----------------------------------------
  // Handle Resize
  // ----------------------------------------

  var handleWindowResize = function handleWindowResize (e) {
    setMenuTransparency( e )
    updateForEveryoneResponsiveMenu( e )
  }

  window.addEventListener( 'resize', handleWindowResize )

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
} )
