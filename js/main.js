window.addEventListener("load",function(){function e(e){for(var t=e.getAttribute("data-lazy-tag"),n=document.createElement(t),o=e.attributes.length-1;o>=0;o--){var a=e.attributes[o];/data-lazy-(?!tag)/.test(a.name)&&n.setAttribute(a.name.replace("data-lazy-",""),a.value)}return n.classList.add("mgb-lazy-media"),n instanceof HTMLVideoElement&&"function"==typeof n.play&&"function"==typeof n.pause&&"boolean"==typeof n.paused&&(n.setAttribute("controls",!0),n.setAttribute("loop",!0),n.setAttribute("autoplay",!0),n.style.cursor="pointer",n.style.background="#000",n.addEventListener("click",function(e){n.paused?n.play():n.pause()})),n instanceof HTMLIFrameElement&&(n.style.width="0",n.style.minWidth="100%",n.style.maxWidth="100%",n.style.height="100%",n.style.border="none"),n}function t(){!function(e,t,n,o,a,i){e.hj=e.hj||function(){(e.hj.q=e.hj.q||[]).push(arguments)},e._hjSettings={hjid:446876,hjsv:5},a=t.getElementsByTagName("head")[0],i=t.createElement("script"),i.async=1,i.src="//static.hotjar.com/c/hotjar-"+e._hjSettings.hjid+".js?sv="+e._hjSettings.hjsv,a.appendChild(i)}(window,document)}document.querySelectorAll(".mgb-lazy").forEach(function(t){t.querySelector("img").addEventListener("click",function(){var n=e(t);t.appendChild(n);var o=document.createElement("div");o.setAttribute("class","ui inverted active loader"),t.appendChild(o),setTimeout(function(){t.classList.add("mgb-lazy-initialized"),n.play&&n.play()},100)},{once:!0})}),"localhost"!==location.hostname&&(!function(e,t,n,o,a,i,s){e.GoogleAnalyticsObject=a,e[a]=e[a]||function(){(e[a].q=e[a].q||[]).push(arguments)},e[a].l=1*new Date,i=t.createElement(n),s=t.getElementsByTagName(n)[0],i.async=1,i.src="https://www.google-analytics.com/analytics.js",s.parentNode.insertBefore(i,s)}(window,document,"script",0,"ga"),ga("create","UA-82379171-2","auto"),ga("send","pageview"),setTimeout(t,200));var n=document.querySelectorAll(".mgb-for-everyone-menu"),o=document.querySelector(".mgb-for-everyone-main"),a=document.querySelector(".mgb-for-everyone-secondary"),i=document.querySelector(".mgb-for-everyone-divider"),s={Students:{main:o.innerText,secondary:a.innerText},Parents:{main:"We turn game <em>players</em> into game <em>builders</em>",secondary:"We provide all-in-one tools and training that let kids develop real skills and confidence within a safe and encouraging community."},GameJammers:{main:"Focus on gameplay",secondary:"Integrated editors and importers for graphics, maps, sounds, and music. Frictionless workflows, but <strong>not</strong> a toy. Use ES6 with modules, code with an IDE, multi-frame and multi-layer graphic editor, TMX map editor, JSFXR synths, and more."},Artists:{main:"You draw, paint, compose, write... but coding sound like hell?",secondary:"Great! Come find some crazy coder-types to work with. Combine your talents and make games in a team."},Teachers:{main:"MGB is for enrichment",secondary:"We support a progressive and self-supporting learning model for ages 13+.  Our core team and extended community will explain and debug problems, live, within the system. We foster a pay-it-forward learning culture."},Trolls:{main:"HAHA we lied... <strong>NO TROLLS ALLOWED</strong>",secondary:"Seriously, we have <strong>ZERO</strong> tolerance for <strong>any</strong> kind of negativity, abuse, disrespect or discrimination. We are eagle-eyed and quick to ban."}},r=function(e){var t=s[e.target.innerText];t&&(o.innerHTML=t.main,a.innerHTML=t.secondary,n.forEach(function(e){e.querySelectorAll(".item").forEach(function(e){e.classList.remove("active")}),e.addEventListener("click",r)}),e.target.classList.add("active"))};n.forEach(function(e){e.addEventListener("click",r)});var l=function(e){window.outerWidth>=768?(n.forEach(function(e){e.classList.remove("three","item")}),i.classList.add("hidden")):(n.forEach(function(e){e.classList.add("three","item")}),i.classList.remove("hidden"))};l();var c=document.querySelector(".mgb-main-menu");c.style.background="";var d=window.getComputedStyle(c).backgroundColor,u=function(e){var t=!1;return function(){t||(e(),t=!0,requestAnimationFrame(function(){t=!1}))}}(function(e){var t=Math.min(100,Math.max(0,1.5*window.scrollY))/100;c.style.background=d.replace(/rgb\((.*)\)/,"rgba($1, "+t+")"),c.style.boxShadow=["0 ",5*t,"px ",10*t,"px rgba(0, 0, 0, ",.25*t,")"].join("")});u(),document.addEventListener("scroll",u);var m=function(e){u(e),l()};window.addEventListener("resize",m),window.particlesJS("particles-container",{retina_detect:!0,particles:{number:{value:100,density:{enable:!0,value_area:800}},color:{value:"#e6ffff"},shape:{type:"circle",stroke:{width:0,color:"#000000"}},opacity:{value:.7,random:!0,anim:{enable:!0,speed:1,opacity_min:0}},size:{value:3,random:!0,anim:{enable:!0,speed:1,size_min:1}},line_linked:{enable:!0,distance:15,color:"#ffffff",opacity:.7,width:1},move:{enable:!0,speed:1,direction:"top",random:!0,out_mode:"out"}},interactivity:{detect_on:"canvas",events:{onhover:{enable:!0,mode:"grab"},onclick:{enable:!0,mode:"repulse"},resize:!0},modes:{grab:{distance:150,line_linked:{opacity:.4}},repulse:{distance:200,duration:.4}}}}),console.log('%cHello Curious hacker-type people who like to look under the hood!\nHow r u?\n\nSince we are here, and you seem to know your way around, here\'s the deal...\n1. This site is primarily designed as a great + _frictionless_ environment for people to learn to code _substantial_ projects.. Learning by Doing!\n2. We strive to create a system that allows complex multi-module games to be built (see "Project Cube" and "City3D" for example)\n3. ...Yet we also provide learning-support for complete newbies to develop their skills in JavaScript, Art and other areas. They may also make pretty substantial games without code using "Actors" and "ActorMap" assets.\n4. We have optimized the experience for middle-school/high-school aged kids, but this is NOT A TOY (scratch etc) and advanced users CAN do serious work in it.\n   Even JavaScript ninjas can appreciate the collaborative tools and ability to experiment quickly (we do!)\n\nAlso, this site is in BETA, so expect...\na. Bugs!\nb. Lots of TODO perf optimizations (css-size, shouldComponentUpdate, etc..)\nc. Some incomplete experience paths (the analytics/biz/legal/design skills tutorials etc)\nd. This site works well on Chrome, but other browsers usually have some issues.. please use Chrome for now\ne. We do not handle phone-width screens well (yet... but we have a team working on mobile...)\n\nQuick FAQ:\nQ: Do we intend to support git?\nA: Yes, but not initially... we are initially pushing a google-docs + semver-packages model for small groups, and will add git workflows later. We also believe that kids will appreciate truly version control mostly once they have mangled some files first, so it is a semi-intentional part of the learning experience...\n\nQ: Why are projects so weird?\nA: Because we want to create a frictionless free-flowing system as a priority, so for now projects are tags.\n   This makes it easy to use parts of one game in another.\n   We will support strict projects (an asset can only be in one project) in future.\n\nQ: Do you have 2048 example?\nA: yes! Hi HN folks!  We also have a whack-a-mole example of course\n\nQ: Why just JavaScript?\nA: Focus, and simplicity. There are lots of other great languages, but JavaScript (ES6) can be presented simply for learning, and now has pretty fancy features including async capabilities. JS is nearly always going to be encountered in browser scenarios, and is good-enough on the server for the most common needs. Sorry Rust/Haskell fans, we love your cool stuff though...\n\nQ: Oooh. server?\nA: Oh yes!!! Server multiplayer stuff is on the horizon. Our design goal is to enable users to easily implement .io style games for example. Should be fun!\n\nQ: Are you going to Open Source this?\nA: Most of it..and in a super-cool way! The MGB core system is designed to actually have the Asset editors, flexPanels and game runtime systems to be run as *plugins*, and we intend to expose these (and also subtools within editors) as plugins that can be forked/extended/shared within MGB itself! We have disabled that for launch since it adds a LOT of surface area, but it is a very explicit goal for the team to have the majority of the site be open sourced WITHIN ITSELF: plugins written in MGB extending the MGB core platform. so our GameBuilder users can become GameBuilderBuilders! and yes, maybe they can sell the plugin tools as assets somehow...\n\nQ: I want to know more!\nA: Come chat with us in-system, or tweet to @dgolds\n ^^^ GLHF ^^^\n',"color: #5c2197")});