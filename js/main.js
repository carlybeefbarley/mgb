function throttle(e){var n=!1;return function(){n||(e(),n=!0,requestAnimationFrame(function(){n=!1}))}}var $menu=document.querySelector(".mgb-main-menu"),$heroCaption=document.querySelector(".mgb-hero-caption"),$menuSignupButton=$menu.querySelector(".mgb-menu-signup-button"),setMenuTransparency=throttle(function(e){var n=$menu.getBoundingClientRect(),t=$heroCaption.getBoundingClientRect();const o=Math.min(100,Math.max(0,100-(t.bottom-n.bottom)))/100;$menu.style.background="rgba(20, 150, 160, "+o+")",$menu.style.boxShadow="0 "+5*o+"px "+10*o+"px rgba(0, 0, 0, "+.25*o+")",$heroCaption.style.opacity=t.bottom/t.height,o>=1?$menuSignupButton.classList.remove("basic"):$menuSignupButton.classList.add("basic")});setMenuTransparency(),document.addEventListener("scroll",setMenuTransparency),window.addEventListener("resize",setMenuTransparency),console.log('Hello Curious hacker-type people!\nhow r u?\n\nSince we are here, and you seem to know your way around a bit, here\'s the deal...\n1. This is primarily designed as a great frictionless place for people to learn to code real projects\n2. We have tried to create a system that allows quite significant games to built (see "Project Cube" for example\n3. But also provide support for complete n00bs to learn JavaScript, Art, etc\n4. We have optimized for middle-school aged kids, but this is NOT A TOY and you can do serious work in it.\n   Even js nnjas will find thing liek the easy module bundling and the CodeMentor useful we think (we do!)\n\nAlso it is in Beta, so expect...\na. Bugs!\nb. Lots of TODO perf optimizations (css-size, shouldComponentUpdate, etc..)\nc. Some incomplete experience paths (the analytics/biz/legal/design skills tutorials etc)\n\nQuick FAQ:\nQ: Do we intend to support git?\nA: Yes, but not initially... we are pushing a google-docs+semver-packages model for small groups, and will add git workflows later\n\nQ: Why are projects so weird?\nA: Because we want to create a frictionless free-flowing system as a priority, so for now projects are tags.\n   This makes it easy to use parts of one game in another.\n   We will support strict projects (an asset can only be in one project) in future.\n\nQ: Do you have 2048 example?\nA: yes! also whack-a-mole of course\n\nQ: Why just javascript?\nA: Focus, and simplicity. There are lots of other great languages, but javascript (ES6) is plenty good for learning and also can be used on server and client\n\nQ: Oooh. server?\nA: Oh yes. Server multiplayer stuff is on the horizon. Design goal is to be able to easily implement .io style games for example\n\nQ: I want to know more!\nA: Come chat with us in-system, or tweet to @dgolds\nGLHF/');