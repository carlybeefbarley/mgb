// This is the data structure that drives the WhatsNew.js control for MGB2

// Note on some values:
//    mgbReleaseInfo.releases[].changes[].type
//            feature:      New Feature
//            improvement:  Enhanced existing feature
//            bugfix:       Fix a bug
//            removed:      Feature Removed

// For iteration, I just simply use the number of commits (including this) at https://github.com/devlapse/mgb

const mgbReleaseInfo = {


  'releases': [

/* Pending changes -- accumulate here in comment until time to deploy

      'changes': [
      ]
Fri Dec 09 2016 12:41:00 GMT-0800 (PST)

*/


    {
      'timestamp': 'Wed Dec 21 2016 11:00:00 GMT-0800 (PST)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '2360'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'asset.tutorials',
          'type': 'improvement',
          'changeName': 'Tutorial Editor - macros and helpers',
          'changeSummary': 'The Tutorial Editor now provides error information on Tutorials while they are being edited. It also supports various macros for steps or step properties. A new DropDown UI lists the built-in stepMacro names and can also insert them in your code. Tutorial steps also now have an optional TODO: property which is helpful for Tutorial authors while they are developing and testing their tutorials. There is also special support for a login tutorial at !vault:tutorials._special.signup, and for badge awards',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'flexpanel.goals',
          'type': 'improvement',
          'changeName': 'Goals FlexPanel - Start next tutorial',
          'changeSummary': "The 'goals' FlexPanel now has a 'Start next tutorial' button",
          'otherUrls': [ ]
        },
        {
          'featureTag': 'learn.skills',
          'type': 'improvement',
          'changeName': 'Skills cleanup',
          'changeSummary': 'The skills taxonomy has been cleaned up and the sequence now matches the learn sequence. The Skills FlexPanel now is toolbar-less which is cleaner and prevents some confusion. There is now click-to-expand on skill area headings',
          'otherUrls': [ { txt: 'Get Started',   href: '/learn/getStarted' } ]
        }
      ]
    },

    {
      'timestamp': 'Fri Dec 16 2016 00:10:00 GMT-0800 (PST)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '2316'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'learn.skills',
          'type': 'feature',
          'changeName': 'Tutorial progression for Get Started',
          'changeSummary': 'Tutorials initiated from core skills paths (the /learn pages) now register as skills upon completion and enable the next tutorial to be started. To test this, try the "Get Started" pages.. the first two profile tutorials work this way',
          'otherUrls': [ { txt: 'Get Started',   href: '/learn/getStarted' } ]
        },
        {
          'featureTag': 'asset.tutorials',
          'type': 'improvement',
          'changeName': 'Tutorial Editor improvements',
          'changeSummary': 'If a Tutorial JSON file has parsing errors, the Tutorial Editor now moves the cursor near to the area with the failure. Also, the Goals FlexPanel has an easy "Edit Tutorial" for tutorials being tested from the Tutorial Editor. There is also now a "Beautify Code" button (a leaf icon, because nature is beautiful).',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'nav.features',
          'type': 'feature',
          'changeName': 'Options Flex Panel (Feature Levels)',
          'changeSummary': 'Various UI tweaks for Feature Levels. Also added a "reset" button to reset featureLevels to default. Useful for tutorial testing...',
          'otherUrls': [ ]
        }
      ]
    },

    {
      'timestamp': 'Wed Dec 14 2016 17:00:00 GMT-0800 (PST)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '2310'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'tutorials.defaults',
          'type': 'improvement',
          'changeName': 'Tutorial defaults',
          'changeSummary': 'Changed default settings for some tutorial fields (selector, position) so tutorials will typcially be less verbose to write.',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'asset.code',
          'type': 'feature',
          'changeName': 'Edit code font size',
          'changeSummary': 'Slightly reduced default font size; changed icons for font size change.',
          'otherUrls': [ ]
        }
      ]
    },

    {
      'timestamp': 'Wed Dec 14 2016 00:34:23 GMT-0800 (PST)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '2305'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'flexpanel.skills',
          'type': 'feature',
          'changeName': 'Skills flexPanel',
          'changeSummary': 'There is a new FlexPanel that shows a summary skill map for the logged in user. It is hidden for new users but can be enabled using the feature levels (options) flex panel.',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'skills.code',
          'type': 'improvement',
          'changeName': 'Coding Skills Maps',
          'changeSummary': 'Coding skills have been significantly extended and the CodeMentor (purple box part) in EditCode now is linked to the skills system. Hiding help for a javscript token you understand (e.g. \'function\') now implies and registers you as having self-certified that you have that skill. More sophisticated kinds of skills certification will come later, but this now shows the end-to-end of tutorials, skills and help. Yay! Now we just need to build out the next 500 tutorials :)',
          'otherUrls': [ ]
        }
      ]
    },

    {
      'timestamp': 'Sat Dec 10 2016 20:30:00 GMT-0800 (PST)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '2296'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'flexpanel.network',
          'type': 'feature',
          'changeName': 'Network/Server outage indicator',
          'changeSummary': 'If the client loses connection to the network/servers then a \'Network\' FlexPanel is shown with red highlighting to alert the user to the issue.',
          'otherUrls': [ ]
        },            
        {
          'featureTag': 'nav.chat',
          'type': 'improvement',
          'changeName': 'Public chat noted on Activity feed',
          'changeSummary': 'Activity on Public Chat channels is noted in the Activity feed.',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'flexpanel.projects',
          'type': 'feature',
          'changeName': 'Projects FlexPanel',
          'changeSummary': 'Added a FlexPanel for Projects - very similar to the NavPanel one for now, but it may get smarter soon...',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'flexpanel.activity',
          'type': 'feature',
          'changeName': 'Activity indicator',
          'changeSummary': 'The Activity FlexPanel indicator flickers green when there is new activity.',
          'otherUrls': [ ]
        },            
      ]
    },

    {
      'timestamp': 'Fri Dec 09 2016 14:50:00 GMT-0800 (PST)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '2284'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'nav.tutorials',
          'type': 'improvement',
          'changeName': 'GetStarted / Tutorials / Skills',
          'changeSummary': 'We are nearly finished with the database and ui flows to support the upcoming skills/tutorials/help systems. There are still some in-progress pages, but you can see at least one of the end-to-end flows from getStarted with the profilePage tutorial. Also added templates to the Tutorial editor. Lots more coming very soon.',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'asset.graphic',
          'type': 'bugfix',
          'changeName': 'Fixed api bug for graphics',
          'changeSummary': 'Fixed a bug that prevented some older graphics files from being loaded via the api. This was affecting the sample "clean sheet" code examples.',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'asset.actorMap',
          'type': 'bugfix',
          'changeName': 'Fixed more bugs related to actorMaps',
          'changeSummary': 'Fixed bugs caused by having multiple kinds of assets with the same name. Also fixed playcounter',
          'otherUrls': [ ]
        }
      ]
    },


    {
      'timestamp': 'Fri Dec 02 2016 20:00:00 GMT-0800 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '2205'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'asset.code',
          'type': 'improvement',
          'changeName': 'Code Asset Bundler speed',
          'changeSummary': 'We do a lot of magic to gather all the imports for your code, transpile your code into earlier versions of javascript, and bundle it so it can run quickly on a variety of browsers. But now we do it faster and using much less network bandwidth :)',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'asset.graphic',
          'type': 'bugfix',
          'changeName': 'Fixed api bug for graphics',
          'changeSummary': 'Fixed a bug that prevented some older graphics files from being loaded via the api. This was affecting the sample "clean sheet" code examples.',
          'otherUrls': [ ]
        }
      ]
    },


    {
      'timestamp': 'Thu Dec 01 2016 01:20:00 GMT-0800 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '2205'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'asset.code',
          'type': 'improvement',
          'changeName': 'Hide Info Pane buttons for unexpanded sections',
          'changeSummary': 'We now only show the buttons when the sections (run code, codeflower etc) are expanded.' ,
          'otherUrls': [ ]
        },
        {
          'featureTag': 'nav.learn',
          'type': 'improvement',
          'changeName': 'Updated structure, UI and URLs for Learn',
          'changeSummary': 'We changed the learn pages to be on the /learn/ path instead of /getstarted.. and there\'s now a learn/getstarted/ page for basic site navigation and action. There is also now a breadcrumb navigator for the learn/skill pages. We also tweaked various parts of the home and learn page text and icons' ,
          'otherUrls': [ ]
        },
        {
          'featureTag': 'asset.code',
          'type': 'bugfix',
          'changeName': 'Bugfix for incomplete bundling',
          'changeSummary': 'Fixed a bug where changing asset while background-bundling some code would cause the data in the subsequently loaded asset to get nuked (recoverable with ctrl-z). Fixed it. phew!',
          'otherUrls': [ ]
        }
      ]
    },


    {
      'timestamp': 'Wed Nov 30 2016 14:00:00 GMT-0800 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '2194'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'asset.tutorials',
          'type': 'improvement',
          'changeName': 'Additional ids and completion tags for tutorials',
          'changeSummary': 'We added some ids and completion tags that can be used in tutorials',
          'otherUrls': [ ]
        }
      ]
    },

    {
      'timestamp': 'Tue Nov 29 2016 17:20:00 GMT-0800 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '2188'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'asset.actorMap',
          'type': 'improvement',
          'changeName': 'ActorMap-based games now also support WASD',
          'changeSummary': 'Now supporting multitouch gestures on the map edit surface',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'game.actorMap',
          'type': 'improvement',
          'changeName': 'ActorMap-based games now also support touch devices',
          'changeSummary': 'There is a new option to show/hide a touch controller overlay for playing actorMap games',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'asset.fork',
          'type': 'improvement',
          'changeName': 'Asset forking progress indicator',
          'changeSummary': 'The UI now indicates when an asset fork is pending (icon shown orange, action clarified as pending)',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'asset.code',
          'type': 'improvement',
          'changeName': 'Improved code editor compatibility on Tablets',
          'changeSummary': 'The code-editing UI (and also the tutorial maker) now have improved support for editing on tablet devices',
          'otherUrls': [ ]
        }
      ]
    },



    {
      'timestamp': 'Mon Nov 28 2016 17:30:00 GMT-0800 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '2174'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'asset.map',
          'type': 'bugfix',
          'changeName': 'Improved touch support for map and actorMap editing',
          'changeSummary': 'Now supporting multitouch gestures on the map edit surface',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'nav.layout',
          'type': 'improvement',
          'changeName': 'New art',
          'changeSummary': 'We have updated the art for mascots and the loading page "hero" image',
          'otherUrls': [ ]
        }        
      ]
    },

    {
      'timestamp': 'Sat Nov 26 2016 02:30:00 GMT-0800 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '2161'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'asset.actorMap',
          'type': 'improvement',
          'changeName': 'Improved touch support for map and actorMap editing',
          'changeSummary': 'Now supporting multitouch gestures on the map edit surface',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'asset.fork',
          'type': 'feature',
          'changeName': 'Assets can now be cloned (forked)',
          'changeSummary': 'When editing an asset, there is now a fork icon in the edit header area. Click this to clone (fork) the existing asset to your account',
          'otherUrls': [ ]
        }
      ]
    },


    {
      'timestamp': 'Thu Nov 24 2016 00:30:00 GMT-0800 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '2151'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'asset.actorMap',
          'type': 'improvement',
          'changeName': 'Better Actor/Tileset picker',
          'changeSummary': 'There is now also a popup button which allows a more graphical way to select which actor to place on the map',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'asset.actor',
          'type': 'bugfix',
          'changeName': 'Bugfix for drag-graphic-to-actor',
          'changeSummary': '@Jaketor reported bug: "When it asks you to drag a graphic to use for the actor, you automatically end up in the editor for that graphic.".. this is now fixed',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'asset.graphic',
          'type': 'bugfix',
          'changeName': 'Added name-based urls to urlMaker control',
          'changeSummary': 'The cloud/download icon in asset editors now includs the url formats for name-based URLs for images',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'play.game',
          'type': 'bugfix',
          'changeName': 'Fixed shooting bug in actorMap games',
          'changeSummary': 'Fixed actorMap bug where shots could collide with items below or to right of shooter.  Thanks (again) to @Jaketor for testing and reporting the bug',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'play.game',
          'type': 'bugfix',
          'changeName': 'Fixed play counter for Code Game',
          'changeSummary': 'The play count for code Games now increments only once per play',
          'otherUrls': [ ]
        },
        {
          'featureTag': '',
          'type': 'bugfix',
          'changeName': 'Various bugfixes',
          'changeSummary': 'Various bugfixes for Code Bundler, analytics, and tutorials. Fixed delays with featureLevel sliders.',
          'otherUrls': [ ]
        }
      ]
    },


    {
      'timestamp': 'Wed Nov 16 2016 15:30:00 GMT-0800 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '2097'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          // Also fix for JSON in tutorials editor and @stauzs' map bufixes
          'featureTag': 'nav.touch',
          'type': 'improvement',
          'changeName': 'Touch support for Map Editors',
          'changeSummary': 'Added Touch support to enable Map/ActorMap editing with touch-only devices - touch-drag etc',
          'otherUrls': [ ]
        }
      ]
    },

    {
      'timestamp': 'Wed Nov 16 2016 01:30:00 GMT-0800 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '2079'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        // also added the joyride support for nav - mgbjr-CT-app-router-path-... and mgbjr-CT-app-location-path-...
        {
          'featureTag': 'nav.games',
          'type': 'improvement',
          'changeName': 'Game links in Nav Panel and profile',
          'changeSummary': 'Added links to NavPanel menus and User profile. Added sorters for games, user\'s games, top games, etc to games browser. Improved home page games list',
          'otherUrls': [ ]
        }
      ]
    },


    {
      'timestamp': 'Tue Nov 15 2016 13:30:00 GMT-0800 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '2068'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        // also fixed code and maps/actor maps api that was broken (kinds, ids)
        {
          'featureTag': 'game.actorMap',
          'type': 'bugfix',
          'changeName': 'Bugfixed animation cycles for actorMap game',
          'changeSummary': 'Fixes for stationary animation cycles (16 cycle animations) and to fix the blinking issues',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'asset.code',
          'type': 'improvement',
          'changeName': 'Code Edit now has a popout mode for the run-preview area',
          'changeSummary': 'When running code in the Code Editor, you can now toggle the new Popout button to allow the run preview area to be moved around. This is helpfull for debug+run on smaller screens',
          'otherUrls': [ ]
        },
      ]
    },

    {
      'timestamp': 'Tue Nov 15 2016 01:40:00 GMT-0800 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '2062'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        // also fixed code and maps/actor maps api that was broken (kinds, ids)
        {
          'featureTag': 'game.actorMap',
          'type': 'improvement',
          'changeName': 'Improved + bugfixed ActorMap Game player',
          'changeSummary': 'Lots of fixes for ActorMap game compatibility with MGBv1 - spawnrate, touch damage, text crawl, overlayUI, Music Playback+stop. Also new UI to explain any gameStart exceptions (e.g. no players on map). Thanks @jaketor for finding the bugs in the player code. There are a few more fixes still to come (pause is weird, etc).',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'nav.roadmap',
          'type': 'improvement',
          'changeName': 'Updated Roadmap',
          'changeSummary': 'Updated roadmap page with intended work for November 2016 and beyond',
          'otherUrls': [ { txt: 'Roadmap page',   href: '/roadmap' } ]
        },
      ]
    },
        
    {
      'timestamp': 'Mon Nov 14 2016 12:50:00 GMT-0800 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '2042'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'asset.actorMap',
          'type': 'bugfix',
          'changeName': 'Fixed some actorMap bugs',
          'changeSummary': 'Fixed initial load of freshly-imported ActorMaps; fix bug preventing change to map size properties box on stamp outside of maps-size; fixed bug causing unexpected cell deletes when erasing outside of map bounds; add ability to select built-in music events. Thanks @jaketor and @Supergirl for finding some good bugs!',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'game.actorMap',
          'type': 'bugfix',
          'changeName': 'Fixed slider/pusher bugs when playing actorMap games',
          'changeSummary': 'Fixed slider/pusher bugs when playing actorMap games. Thanks @jaketor for reporting this bug!',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'asset.code',
          'type': 'bugfix',
          'changeName': 'Fixed code bundling bugs',
          'changeSummary': 'Fixed bugs with code bundler that was preventing some browse -> play game cases',
          'otherUrls': [ ]
        }
      ]
    },

    {
      'timestamp': 'Sun Nov 13 2016 23:50:00 GMT-0800 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '2022'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'asset.actorMap',
          'type': 'improvement',
          'changeName': 'Full-width actorMap play preview',
          'changeSummary': 'The ActorMap editor now allows full-width previews when playing the game/map in the level editor',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'asset.actorMap',
          'type': 'bugfix',
          'changeName': 'Better compat with MGBv1 maps',
          'changeSummary': 'Fixed bug which prevented maps imported from MGBv1 from working',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'game.statistics',
          'type': 'feature',
          'changeName': 'GamePlays counter enabled',
          'changeSummary': 'The Game Asset now counts plays when the game is played in the game browser (not in the actorMap/Code editors)',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'asset.tutorials',
          'type': 'feature',
          'changeName': 'Tutorials Asset + Editor + DebugTracer',
          'changeSummary': 'The new tutorials system is getting very close now! We have added the new Asset type for defining a tutorial, and also a special debug mode for running tutorials with lots of event tracking (see the browser js console for this)',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'asset.code',
          'type': 'improvement',
          'changeName': 'Code Editor Toolbar',
          'changeSummary': 'Code editor now has a toolbar which allows the Info panel to be resized or hidden, and also allow text size to be changed, and comments to be faded',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'nav.skills',
          'type': 'improvement',
          'changeName': 'More skills',
          'changeSummary': 'More of the skills areas are now shown.. take a look!',
          'otherUrls': [ 
            { txt: 'Full skills list', href: '/learn/skills' },
            { txt: 'Example skills area - legal stuff', href: '/learn/skills/legal' }
          ]
        }
      ]
    },


    {
      'timestamp': 'Mon Nov 7 2016 21:30:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '1984'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'asset.actorMap',
          'type': 'bugfix',
          'changeName': 'ActorMap Mega-bugfixing',
          'changeSummary': 'We spent a few days squashing bugs in the ActorMap editor. It seems to be behaving well now. If you have any problems with it, let us know',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'nav.joyride',
          'type': 'improvement',
          'changeName': 'Tutorial/step/tour system improvements',
          'changeSummary': "There is still just one 'tour' / 'tutorial' (Click 'show me' on the options FlexPanel to see it), but the tour system itself now handles more complicated navigation and waiting for user actions. This should be enough now for us to implement a lot of the initial site tutorials. Yay",
          'otherUrls': [ ]
        },
        {
          'featureTag': 'nav.skills',
          'type': 'improvement',
          'changeName': 'Skills system, next menu level',
          'changeSummary': "The full list of skills areas is now shown, and there is the beginning of the skills explorer for each area. More soon. SKills, tutorials, tours and help will become cunningly connected soon!",
          'otherUrls': [ 
            { txt: 'Full skills list', href: '/learn/skills' },
            { txt: 'Example skills area - legal stuff', href: '/getstarted/skills/legal' }
          ]
        },
        {
          'featureTag': 'nav.activitysnapshots',
          'type': 'improvement',
          'changeName': 'Activity snapshot throttling',
          'changeSummary': "The activity snaphots now fire after 1.5 seconds of inactivity, and at least every five seconds. Previously they could fire multiple times per second, impacting performance.",
          'otherUrls': [ ]
        }
      ]
    },

    {
      'timestamp': 'Thu Nov 3 2016 06:10:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '1932'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'nav.layout',
          'type': 'improvement',
          'changeName': 'Navigation cleanup',
          'changeSummary': 'We now show fewer NavPanels and FlexPanels for new users. Extra ones can be enabled using a feature slider in the OPTIONS flexPanel. Also, icons and menus have been improved, and some of the "v2" text replaced.',
          'otherUrls': [ ]
        }
      ]
    },

    {
      'timestamp': 'Tue Nov 1 2016 02:10:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '1908'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'nav.navpanel',
          'type': 'improvement',
          'changeName': 'NavPanel restructuring - Play/Learn/Create',
          'changeSummary': 'We have restructured the NavPanel on the left of the window to support the upcoming deeper learning and play experiences. Prior to this change, the hierarchy was more focused on just creation workflows. This sets us up for the Deeper playback and learning/skills systems that are coming NEXT',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'asset.game',
          'type': 'feature',
          'changeName': 'New \'Game\' Asset',
          'changeSummary': 'To make it easier to find how to start games, we have created a new kind of Asset - the \'Game Asset\'. This currently holds just some key data - name, cover image and starting Asset (which can be either Code or ActorMap). Game Assets are now shown also in the Project overview so you can quickly find the starting points for a game in a large project.  There is currently a rudimentary Game Player for ActorMap and Code games, but a fuller play experience will be implemented soon. The Game Asset will also be used in future as an anchor for data like high scores, lobbies, game analytics, etc',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'asset.edit',
          'type': 'bugfix',
          'changeName': 'Fixed occasional change loss when saving an asset',
          'changeSummary': 'There was a timing condition that meant a thumbnail change could prevent an assets main data from being saved. This is now fixed. Also, the Activity Log will update every five minutes even if you are just doing the same activity (e.g edit a graphic). Previously the Activity Log would not update until you worked on a different activity/asset. Also, we did soem UI cleanup of the header -  using more consistent outlined buttons for the various Asset settings',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'asset.actor',
          'type': 'improvement',
          'changeName': 'Actor Editor improvements',
          'changeSummary': 'Enabled Actor sounds to be edited more reliably, clarified some help text',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'asset.graphic',
          'type': 'improvement',
          'changeName': 'Thumbnail size',
          'changeSummary': 'Thumbnails are smaller for small graphics assets (less then 290 px wide)',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'nav.ui',
          'type': 'improvement',
          'changeName': 'UI improvements',
          'changeSummary': 'Added some animations for spinners, assets, project cards, user cards, game items etc. Also cleaned up the Asset Edit metadata buttons (license, workstate etc)',
          'otherUrls': [ ]
        },
        
      ]
    },

    {
      'timestamp': 'Wed Oct 26 2016 13:40:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '1854'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'asset.import',
          'type': 'improvement',
          'changeName': 'Added 1MB limit for imported Assets',
          'changeSummary': 'An imported Asset must be less than 1MB now. If you have music files that are larger than this we suggest you resample them to a lower bitrate.',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'nav.deployment',
          'type': 'feature',
          'changeName': 'Deployment indicator',
          'changeSummary': 'When a new update to MGB is being deployed, we show a spinning \'refresh\' icon to show that the page will be refreshed soon',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'ui',
          'type': 'improvement',
          'changeName': 'Various UI improvements',
          'changeSummary': 'Improved UI for License Selection, ActorMap Editor',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'asset.actorMap',
          'type': 'improvement',
          'changeName': 'Improvements for Actors and ActorMaps',
          'changeSummary': 'Events tool has been separated from Actors tool. Various fixes, notably Actor Movement speed can be > 0 now :).',
          'otherUrls': [ ]
        },

      ]
    },


    {
      'timestamp': 'Sat Oct 22 2016 20:30:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '1825'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'asset.actorMap',
          'type': 'feature',
          'changeName': 'Show Layer rules for Actors and ActorMaps',
          'changeSummary': 'ActorMaps have specific layers for stationary objects - the background and foreground layers. In this release we have added hints that show the constraints for the selected Actor and ActorMap while editing.',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'asset.graphic',
          'type': 'bugfix',
          'changeName': 'Fixed broken color picker bug',
          'changeSummary': 'Fixed bug where Right-clicking the mouse while the color picker was visible causes the color picker to no longer pick. Thanks to Supergirl for finding the bug',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'user.signin',
          'type': 'feature',
          'changeName': 'Cleanup of other login pages',
          'changeSummary': 'All pages related to login/signup/password-reset have been cleaned up, and the terminology is now consistent',
          'otherUrls': [ ]
        }
        
      ]
    },

    {
      'timestamp': 'Thu Oct 20 2016 23:20:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '1818'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'user.signin',
          'type': 'feature',
          'changeName': 'Create account UI and Login UI improvements',
          'changeSummary': 'The Login and Signup UI has been simplified and is now more robust on mobile devices. In addition, usernames are correctly checked for conflicts and invalid characters',
          'otherUrls': [ ]
        }
      ]
    },

    {
      'timestamp': 'Wed Oct 19 2016 16:40:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '1808'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'asset.actor',
          'type': 'feature',
          'changeName': 'Code-Free Games - Actors for code-free game logic',
          'changeSummary': 'Enable code-free games - Make games without coding.  Actors are a new Asset kind that allow common types of game logic to be easily attached to graphics in order to make a wide variety of games. Actors provide sets of rules you can modify in order to make the behaviors you want - player, NPC, item, bullet, trap, healthpack, etc. You define them using the Actor Editor, then place them on a special kind of map called an ActorMap (using the ActorMap Editor) in order to create complete games. The Actor semantics in this system are 100% compatible with games from http://mygamebuilder.com',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'asset.actorMap',
          'type': 'feature',
          'changeName': 'Code-Free Games - ActorMaps for Games and GameLevels',
          'changeSummary': 'This is the second part of the \'Enable code-free games\' feature set - You can place Actors on background, middle and foreground layers of an ActorMap, and instantly play the game you are designing without needing to write any code. You can also link maps using the Effects layer of the ActorMap in order to make large multi-level games. The ActorMap semantics in this system are 100% compatible with games from http://mygamebuilder.com',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'import.MGBv1',
          'type': 'feature',
          'changeName': 'Code Free Games - Import MGBv1 games',          
          'changeSummary': 'There is now a way to import games from MGBv1 (http://mygamebuilder.com) into this new MGBv2 system. The import tool imports the MGBv1 Tiles as MGBv2 graphics, imports MGBv1 Actors as MGBv2 Actors, and imports MGBv1 maps as MGBv2 ActorMaps.  For now, the import-from-mgbv1 UI is *NOT* enabled on normal user accounts, so you will have to ask an Admin to import an MGBv1 project for you if you want to try this. The self-service import UI will be available once we\'ve tested some more imported games with this import process',
          'otherUrls': [ ]
        }
      ]
    },

    {
      'timestamp': 'Thu Oct 6 2016 12:25:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '1686'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'nav.learn',
          'type': 'improvement',
          'changeName': 'Get Started now has two paths - games and skills',
          'changeSummary': 'Get Started now has two paths - games and skills. Also we now make it clear that these tutorials haven\'t actually been implemented yet.. instead of just linking to the create-asset pages :)',
          'otherUrls': [ ]
        }
      ]
    },

    {
      'timestamp': 'Wed Oct 5 2016 21:30:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '1673'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'nav.asset',
          'type': 'improvement',
          'changeName': 'Assets list include no-image XS option',
          'changeSummary': 'Extra Small (XS) Asset views are now just text; no graphic',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'asset.graphic',
          'type': 'improvement',
          'changeName': 'Graphic Editor Improvements',
          'changeSummary': `Graphic Editor Improvements: Smarter scaling; correctly sized thumbnails; single-frame import is much simpler`,
          'otherUrls': [ ]
        },
        {
          'featureTag': 'asset.code',
          'type': 'improvement',
          'changeName': 'Code Editor improvements',
          'changeSummary': `Edit Code gets some little tweaks. You can drag assets from the FlexPanel to the code area and we generate some probably useful code and links to help you load that asset. Also, the buttons have been cleaned up some more, and you can also clear the console if it has become spammy.`,
          'otherUrls': [ ]
        }
      ]
    },

    {
      'timestamp': 'Sun Oct 2 2016 09:20:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '1647'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'nav.assets.license',
          'type': 'feature',
          'changeName': 'Asset License',
          'changeSummary': 'The Asset Edit view now shows the license of the asset, and also allows the Asset owner (or a member of a Project containing the asset) to change the license. License changes are tracked in the activity log',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'nav.profile.badges',
          'type': 'improvement',
          'changeName': 'Updated Profile badges',
          'changeSummary': 'Profile badges are being updated to the newer art style. The first few have been enabled in this release',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'nav.asset.project',
          'type': 'improvement',
          'changeName': 'Link to get from Asset Edit to Project',
          'changeSummary': 'The Project labels in the Asset Editor are now clickable - they link to that projects\' Asset link. Also alt-click will go to the list of projects for the project owner ',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'asset.music',
          'type': 'bugfix',
          'changeName': 'iOS fixes for Music',
          'changeSummary': ` Music generation is more reliable on Safari and Chrome browsers on iOS. There are a lot of weird issues with WebAudio on iOS, please let us know of any issues you find.`,
          'otherUrls': [ ]
        },
        {
          'featureTag': 'asset.graphic',
          'type': 'bugfix',
          'changeName': 'iOS fixes for Graphic Editor',
          'changeSummary': `Fixed various popup/keyboard issues on iPad/iPhone.`,
          'otherUrls': [ ]
        }
      ]
    },

    {
      'timestamp': 'Thu Sep 29 2016 10:00:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '1617'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'nav.assets',
          'type': 'feature',
          'changeName': 'Asset Card View sizes',
          'changeSummary': 'Asset views can now have variable levels of detail. Extra Small (XS) shows just the thumbnail. Medium (M) shows metadata. Extra Large (XL) shows the most information and provides action buttons. These can be selected using a dropdown in the main Assets List.',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'nav.flexpanel.assets',
          'type': 'feature',
          'changeName': 'Assets FlexPanel - select Asset Kinds & View sizes',
          'changeSummary': 'The Assets Flex Panel now also allows you to select which Asset kinds to show, and which view sizes to show them as.',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'asset.code',
          'type': 'feature',
          'changeName': 'CodeFlowers',
          'changeSummary': `Edit Code can now display 'CodeFlowers' - a visual way to see the complexity of your source code, and also it's imports. These can be viewed/explored, and also can be saved as a thumbnail for the Asset`,
          'otherUrls': [ { txt: 'CodeFlower was developed by Francois Zaninotto', href: 'https://github.com/fzaninotto/CodeFlower' } ]
        }
      ]
    },

    {
      'timestamp': 'Mon Sep 26 2016 16:00:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '1584'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'nav.tours',
          'type': 'feature',
          'changeName': 'Tours capability',
          'changeSummary': 'We are using a component called react-joyride to provide a way to explain features of MGB. In future, we intend to allow you to use this in games/apps created within MGB...',
          'otherUrls': [ { txt: 'react-joyride on github', href: 'https://github.com/gilbarbara/react-joyride' } ]
        },
        {
          'featureTag': 'nav.flexpanel.featurelevels',
          'type': 'improvement',
          'changeName': 'Feature Levels FlexPanel has a tour',
          'changeSummary': 'The Feature Levels FlexPanel has a new feature - using the new "tours" capability: if you click the (show) link, it will start a brief tour to explain how those work',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.edit',
          'type': 'improvement',
          'changeName': 'Control Deleted and Done status while editing Asset',
          'changeSummary': 'There are two new buttons in the Asset Edit Header. A blue/grey checkmark icon sets/shows the Done status; A red/grey trashcan sets/show the Deleted status',
          'otherUrls': []
        },
        {
          'featureTag': 'projects.delete',
          'type': 'feature',
          'changeName': 'Projects may now be deleted',
          'changeSummary': 'Empty projects may now be deleted by the project owner. They must have no members and no assets (including deleted assets)',
          'otherUrls': []
        },
        {
          'featureTag': 'nav.infra.stardust',
          'type': 'improvement',
          'changeName': '(internals) Stardust UI library',
          'changeSummary': 'We have been using a CSS framework called "Semantic UI" for several months now for building the overall MGB UI. In this release we have started using a ReactJS wrapper for that library called "stardust". You should not notice much difference, but inside our own source code, MGB is much nicer for us to use and enhance because of Stardust. This will also help with our intent to allow you to extend MGB *yourself* in future - we intend to allow you to add extra MGB features & tools that you develop (or the community has developed) inside MGB to extend MGB. Woah!',
          'otherUrls': [ 
            { txt: 'Stardust simple example', href: '/u/dgolds/asset/vEF8o5yrrb9in2NsA' },
            { txt: 'Stardust ', href: 'http://technologyadvice.github.io/stardust/' },
            { txt: 'Semantic UI', href: 'http://semantic-ui.com/' }
          ]
        },
        {
          'featureTag': 'asset.code',
          'type': 'improvement',
          'changeName': 'Code Edit - quality improvements',
          'changeSummary': 'This release includes more stability, performance and compatibility improvements for Code Edit/import/build. There are still some ways the MGB Code Edit is causing browser to crash when editing/building complex projects, and we are working through fixing all these cases. Also fixed bug where autocomplete happens in comments',
          'otherUrls': []
        },
        {
          'featureTag': 'nav.navPanel',
          'type': 'improvement',
          'changeName': 'Improved NavPanel auto-hide',
          'changeSummary': 'NavPanel auto-hide is also triggered now by a click in the central area of the window. Also shift-click of a NavPanel selection icon will disable auto-hide, \'shifting\' the content area to the right.',
          'otherUrls': []
        },
        {
          'featureTag': 'nav.navPanel.projects',
          'type': 'improvement',
          'changeName': 'Projects NavPanel shows owner link',
          'changeSummary': 'There is now a clickable @owner link in the Projects navPanel (and also in the Profile Page projets list actually)',
          'otherUrls': []
        },
        {
          'featureTag': 'nav.layout',
          'type': 'improvement',
          'changeName': 'No page flicker when changing user contexts',
          'changeSummary': 'The App page is drawn more intelligently so switching /u/username contexts no longer causes screen flickers',
          'otherUrls': []
        }        
      ]
    },

    {
      'timestamp': 'Fri Sep 22 2016 13:00:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '1520'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'nav.navpanel.projects',
          'type': 'feature',
          'changeName': 'Alt-click for Project NavPanel links',
          'changeSummary': 'The Projects NavPanel has a new feature: if you hold the alt key while mouse-clicking a Project link, it will open the Assets list for that Project. A normal mouse-click still just opens the Project overview page, as it did before this change.',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.code',
          'type': 'improvement',
          'changeName': 'ES6 import code improvements',
          'changeSummary': 'Support more ES6 module/CSS import scenarios and special cases.',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.mgbui',
          'type': 'removed',
          'changeName': 'Removed the hidden MGBUI Asset type',
          'changeSummary': 'This was initially used for UI prototyping for MGB itself. This is no longer needed since it can be done using the Stardust library as normal Javascript code',
          'otherUrls': [ 
            { txt: 'Stardust simple example', href: '/u/dgolds/asset/vEF8o5yrrb9in2NsA' }
          ]
        },
        {
          'featureTag': 'asset.doc',
          'type': 'removed',
          'changeName': 'Removed the Docs type for now',
          'changeSummary': 'This needs more work, but isn\'t urgent so removing this for now. it will come back in a few weeks',
          'otherUrls': []
        }
      ]
    },

    {
      'timestamp': 'Thu Sep 22 2016 15:45:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '1508'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'nav.roadmap',
          'type': 'improvement',
          'changeName': 'Updated Roadmap page',
          'changeSummary': 'Updated Roadmap page with September progress and post-September work list. Updated notes on stability of asset types.',
          'otherUrls': []
        },
        {
          'featureTag': 'nav.gettingStarted',
          'type': 'improvement',
          'changeName': 'New Home and Get Started pages',
          'changeSummary': 'The \`Getting Started\` page now has text that matches the skills areas.',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.music',
          'type': 'improvement',
          'changeName': 'Music Editor Tools on feature-level toolbar',
          'changeSummary': 'The Music Editor Tools are now on a feature-level dependent toolbar. For new users, we just show the main tools initially. Users can use the feature slider to enable more tools over time as they learn to use MGB',
          'otherUrls': []
        }        
      ]
    },

    {
      'timestamp': 'Wed Sep 21 2016 18:30:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '1501'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'nav.roadmap',
          'type': 'improvement',
          'changeName': 'Updated Roadmap page',
          'changeSummary': 'Updated Roadmap page with September progress and post-September work list. Updated notes on stability of asset types.',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.music',
          'type': 'bugfix',
          'changeName': "More Bugfixes for Music editor",
          'changeSummary': 'Further improved stability and UI for Music editor',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.code',
          'type': 'bugfix',
          'changeName': "More Bugfixes for Code editor",
          'changeSummary': 'Further improved stability and compatibility for various kinds of imports and evil test cases',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.doc',
          'type': 'bugfix',
          'changeName': "Remove Doc Asset type",
          'changeSummary': 'Removed Doc Asset type for now.',
          'otherUrls': []
        }
      ]
    },
        
    {
      'timestamp': 'Tue Sep 20 2016 15:00:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '1489'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'nav.navpanel',
          'type': 'improvement',
          'changeName': 'NavPanel auto-hides by default',
          'changeSummary': 'The NavPanel is the dark menu column of navigation options to the left of the MGB page. The NavPanel now auto-hides by default when one of it\'s link is clicked. This auto-hide can be disabled by clicking the lock/unlock icon at the bottom of the expanded NavPanel',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.code',
          'type': 'feature',
          'changeName': "Code Asset thumbnails based on source code",
          'changeSummary': 'Not all source code files actually render anything which could be a thumbnail, so the assets preview looks pretty dull for source code. To improve that. we have added a new way to create a thumbnail based on the source code.. For now this is very simple (just the source file name and names of any imports). However, it will have some fancier variants in the near future. For now, click \'AST Thumbnail\' to update the simple source-base code asset thumbnail',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.music',
          'type': 'feature',
          'changeName': "Cut/Copy/Paste time segments in Music Channels",
          'changeSummary': 'It is now possible to select a time range in a music channel, then delete/cut/copy/paste that segment into another sound channel. Woah',
          'otherUrls': []
        },        
        {
          'featureTag': 'nav.flexpanel.network',
          'type': 'feature',
          'changeName': 'New \'network status\' FlexPanel',
          'changeSummary': 'There is new Network Status FlexPanel on the right-hand side of the page. This provides basic connectivity status information, and a \'receonnect now\' button',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.music',
          'type': 'bugfix',
          'changeName': "Bugfixes for Music editor",
          'changeSummary': 'Improved stability and ui for Music editor',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.sound',
          'type': 'bugfix',
          'changeName': "Bugfixes for Sound editor",
          'changeSummary': 'Improved stability and ui for Sound editor',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.graphic',
          'type': 'bugfix',
          'changeName': "Bugfixes for Graphic editor",
          'changeSummary': 'Added more zoom sizes and enabled a grid at zooms of 8x and above. Fixed some drawing bugs with layers',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.code',
          'type': 'bugfix',
          'changeName': "Bugfixes for Code editor",
          'changeSummary': 'Improved stability and compatibility for various kinds of imports',
          'otherUrls': []
        }
      ]
    }, 

    {
      'timestamp': 'Sun Sep 18 2016 12:00:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '1451'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'nav.layout',
          'type': 'improvement',
          'changeName': 'New Home and Get Started pages',
          'changeSummary': 'These are incomplete, but show the design direction for \`Getting Started\` leading into the (coming soon) tutorials UI.',
          'otherUrls': []
        },
        {
          'featureTag': 'nav.flexpanel.keys',
          'type': 'feature',
          'changeName': 'Keyboard shortcuts FlexPanel',
          'changeSummary': 'There is new Keyboard shortcuts FlexPanel on the right of the window. This is only partially functional so far but will be context sensitive soon',
          'otherUrls': []
        },
        {
          'featureTag': 'nav.whatsnew',
          'type': 'improvement',
          'changeName': "Change summary in left column",
          'changeSummary': 'The WhatsNew page now has change summaries in the left column',
          'otherUrls': []
        },
        {
          'featureTag': 'nav.projects',
          'type': 'improvement',
          'changeName': 'Change Asset\'s Project list from Asset Editor',
          'changeSummary': 'Asset owners can change the Projects for an Asset while editing the Asset (click the top right projects label)',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.graphics',
          'type': 'bugfix',
          'changeName': 'Color Picker bugfix',
          'changeSummary': 'There was a bug where the Color Picker would not work if the UI slider was at a minimum setting whern the page loaded. This is now fixed. ',
          'otherUrls': []
        }
      ]
    }, 

    {
      'timestamp': 'Thu Sep 15 2016 14:20:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '1411'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'nav.assets',
          'type': 'improvement',
          'changeName': 'Assets now have a workState',
          'changeSummary': 'You can set and see the work status of an Asset:  "broken" / "experiment" / "unknown" / "working" / "polished" / "showcase"',
          'otherUrls': []
        },
        {
          'featureTag': 'nav.projects',
          'type': 'improvement',
          'changeName': 'Projects now have a workState',
          'changeSummary': 'You can set and see the work status of a Project:  "broken" / "experiment" / "unknown" / "working" / "polished" / "showcase"',
          'otherUrls': []
        }
      ]
    },

    {
      'timestamp': 'Wed Sep 14 2016 09:30:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '1383'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'asset.code',
          'type': 'improvement',
          'changeName': 'Code Editor - Perf & Visuals',
          'changeSummary': 'Improved auto-build caching; implemented more javascript language help; javascript language help can be hidden (click \'?\')',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.music',
          'type': 'improvement',
          'changeName': 'Music Editor - Fixes, Perf & Visuals',
          'changeSummary': 'Improved previews and timeline handling',
          'otherUrls': []
        }
      ]
    },

    {
      'timestamp': 'Mon Sep 12 2016 17:00:09 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '1357'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'asset.graphics',
          'type': 'improvement',
          'changeName': 'Small bugfixes for Graphics',
          'changeSummary': 'Fixed bug with Color Picker not showing, and esc key triigering unwanted actions',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.code',
          'type': 'improvement',
          'changeName': 'Code analysis perf improvements',
          'changeSummary': 'Improved caching of code analysis hints',
          'otherUrls': [ ]
        }
      ]
    },

    {
      'timestamp': 'Sun Sep 11 2016 17:00:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '1345'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'nav.layout',
          'type': 'improvement',
          'changeName': 'Revised NavPanel and FlexPanel style',
          'changeSummary': 'NavPanel bar on left is now dark grey; Both FlexPanel and NavPanel have been widened slightly, and text has been added for initial navigation. There will be an option later to remove the text for users who don\'t want it',
          'otherUrls': []
        },
        {
          'featureTag': 'security.projects',
          'type': 'improvement',
          'changeName': 'Create Asset as Project Member',
          'changeSummary': 'Users can now create asset in Projects they are a MEMBER of. Prior to this change they had to be project owners.',
          'otherUrls': [ ]
        }
      ]
    },

    {
      'timestamp': 'Fri Sep 09 2016 18:00:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '1335'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'security.projects',
          'type': 'improvement',
          'changeName': 'Create New Asset in Project',
          'changeSummary': 'Project OWNERS can now create new Assets in a chosen project',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.code',
          'type': 'improvement',
          'changeName': 'Code: ES6 Module Imports Code Analysis',
          'changeSummary': 'The dynamic code analysis now automatically parses and infers docs/types from imported dependencies',
          'otherUrls': [
            { txt: 'Phaser/ES6 example', href: '/u/stauzs/assets?_fp=assets&_np=people&project=Phaser+ES6' },
            { txt: 'React/ES6/JSX example', href: '/u/stauzs/assets?_fp=assets&_np=people&project=Code+Import+Test' },
            { txt: 'NPM respository', href: 'https://npmjs.com' },
            { txt: 'Mozilla documents for ES6 import', href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import' }
          ]
        },
        {
          'featureTag': 'asset.code',
          'type': 'improvement',
          'changeName': 'Code: Dynamic JSDoc parsing',
          'changeSummary': 'The dynamic code analysis now can read jsdoc comments and uses that information to supplement type inference for code completion and other code help',
          'otherUrls': [
            { txt: 'JsDoc', href: 'http://usejsdoc.org/' }
          ]
        }
      ]
    },

    {
      'timestamp': 'Thu Sep 08 2016 10:30:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '1313'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'security.projects',
          'type': 'feature',
          'changeName': 'Project member access now enabled',
          'changeSummary': 'Project MEMBERS can now edit (but not create) existing assets in projects they are Members of',
          'otherUrls': []
        }
      ]
    },

    {
      'timestamp': 'Tue Sep 06 2016 13:15:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '1282'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'asset',
          'type': 'improvement',
          'changeName': 'Background save improvements',
          'changeSummary': "Asset saves to the server now happen on a timer interval (currently set to 5 seconds, but can vary). Also, we now show the state of the asset in the Asset Edit Header area: Red label means read-only. Purple label means offline, can't save.  Orange label means changes waiting to be sent to cloud.  Green label with orange icon means changes sent to cloud but not confirmed as saved yet. Green label with white icon means all changes sent to cloud and confirmed received.",
          'otherUrls': []
        },
        {
          'featureTag': 'nav.user.avatar',
          'type': 'improvement',
          'changeName': 'Choose User Avatar',
          'changeSummary': "To set a User avatar, go to your profile, then drag a Graphic asset to your User's avatar iamge preview. The easiest way to do this is by using the (right hand) flexPanel for Assets (the Pencil icon). This can be tricky on mobile devices.. sorry. You can also drag an asset from a different MGB2 browser window - for example from the List Assets page. To edit your avatar, you just edit the graphic it uses. If you forget what this is, MGB can find it for you: click your avatar area when on your own profile page, it will take you to the editor for that graphic asset. Avatars currently only use the first frame of the graphic, animations are not yet supported.  Note that MGB will instantly update your User Avatar previews if you change which asset it uses, but changes to the graphic (i.e. changing some pixels) will only be shown for other users/windows when the page reloads/refreshes - ie.. User Avatar images are NOT fully reactive in the way other assets are",
          'otherUrls': []
        },
        {
          'featureTag': 'nav.project.avatar',
          'type': 'improvement',
          'changeName': 'Choose Project Avatar',
          'changeSummary': "This is simlar to the new User avatars. TO set these, go to your Project Overview page, then drag a Graphic asset to your User's avatar iamge preview. The easiest way to do this is by using the (right hand) flexPanel for Assets (the Pencil icon). This can be tricky on mobile devices.. sorry. You can also drag an asset from a different MGB2 browser window - for example from the List Assets page. To edit your avatar, you just edit the graphic it uses. If you forget what this is, MGB can find it for you: click your avatar area when on your own Project Overview page: it will take you to the editor for that graphic asset. Project Avatars currently only use the first frame of the graphic, animations are not yet supported.",
          'otherUrls': []
        },
        {
          'featureTag': 'render.image.pixelated',
          'type': 'improvement',
          'changeName': 'Pixelated Image rendering',
          'changeSummary': "Image smoothing is now disabled for all images shown in MGBv2 - i.e. smaller images will show as 'pixelated' when zoomed to a larger size, for example in an Avatar image, or Graphic Asset preview card.",
          'otherUrls': []
        },
        {
          'featureTag': 'asset.music',
          'type': 'improvement',
          'changeName': 'Multi-channel music',
          'changeSummary': "In preparation for some fancy new stuff, music files are now multi-channel so they can combine multiple 'tracks' mixed at different volume levels. This was a major data format change, and since there's no significant Music content in the system so far, we decided to simplify this change by deleting all existing MGB2 Music assets (instead of dynamically modifying the old format). These deleted music assets are actually just *marked* as deleted, so if you really want to get one back, there's a way...",
          'otherUrls': []
        },
        {
          'featureTag': 'asset.code',
          'type': 'improvement',
          'changeName': 'Helpers to load MGB assets in Phaser games',
          'changeSummary': 'There are multiple new internal APIs and new importable scripts that help load graphics, tiles, tilesets, music, sounds etc into a Phaser Game. We will publish some examples to show how this can be done easily now',
          'otherUrls': []
        },
        {
          'featureTag': 'nav.navpanel',
          'type': 'improvement',
          'changeName': 'Alt-click large NavPanel icons for quick jump',
          'changeSummary': 'The Large Black-background column of icons on the left of the MGB window are the NavPanel selectors. If you alt-click them with a amouse, they load the most common page for their sub-menu. Thus saving you a click!',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.sound',
          'type': 'improvement',
          'changeName': 'Apple/Safari compatability for Audio',
          'changeSummary': 'Music and Sound now should work OK on Safari browser and on iOS devices!',
          'otherUrls': []
        }
      ]
    },

    {
      'timestamp': 'Sat Aug 27 2016 08:07:25 GMT+0100 (BST)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '1204'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'asset.sound',
          'type': 'improvement',
          'changeName': 'Sounds & Music MP3 encoding',
          'changeSummary': 'Sound and Music are now preferentially encoded in MP3 format, for improved compatability and compression. Previously we generated .ogg and .wav',
          'otherUrls': []
        }
      ]
    },

    {
      'timestamp': 'Mon Aug 22 2016 15:50:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '1167'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'asset.sound',
          'type': 'improvement',
          'changeName': 'Load and Play Sound & music in games from code',
          'changeSummary': "For example, in a Phaser game:  game.load.audio('music', '/api/asset/music/3KvwCMbDkMQqMfsWB/music.mp3')",
          'otherUrls': [
            { txt: 'Example with music and sound effect', href: '/u/guntis/asset/WMijM7t8Waz76kz86' }
          ]
        }
      ]
    },

    {
      'timestamp': 'Sat Aug 20 2016 09:30:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '1148'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'asset.graphic',
          'type': 'improvement',
          'changeName': 'Graphic Editor: Touch/Pen support',
          'changeSummary': 'The Graphic Editor now supports Touch events, so you can use touch or stylus/iPencil to draw using supported devices. We also improved some menus and buttons in the Edit Graphic UI to work better on tablets and phones.',
          'otherUrls': []
        },
        {
          'featureTag': 'nav.flexpanel.featurelevels',
          'type': 'improvement',
          'changeName': 'Feature Levels - show/set value',
          'changeSummary': 'The Feature Levels Flex Panel (slider icon tab on right hand of page) now allows the feature levels to be changed using a numeric field. This is because some users are reporting problems with the slider control on mobile devices.',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.code',
          'type': 'improvement',
          'changeName': 'Code: ES6 Module re-Exports',
          'changeSummary': "We now support 'export {} from 'External Source'. This allows you to have a file that centralizes which versions of external libraries to use. It's a lightweight alternative to the package.json file you would use with NodeJs.",
          'otherUrls': [
            { txt: 'Phaser/ES6 example', href: '/u/stauzs/assets?_fp=assets&_np=people&project=Phaser+ES6' },
            { txt: 'React/ES6/JSX example', href: '/u/stauzs/assets?_fp=assets&_np=people&project=Code+Import+Test' },
            { txt: 'NPM respository', href: 'https://npmjs.com' },
            { txt: 'Mozilla documents for ES6 export', href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export' }
          ]
        }
      ]
    },

    {
      'timestamp': 'Wed Aug 17 2016 13:10:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '1122'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'asset.code',
          'type': 'improvement',
          'changeName': 'Code: ES6 Module Imports',
          'changeSummary': 'It is now possible to import npm and other packages/libraries dynamically using the EcmaScript 6 import command. This is definitely alpha quality at present so let us know if you find bugs and we will fix them quickly',
          'otherUrls': [
            { txt: 'Phaser/ES6 example', href: '/u/stauzs/assets?_fp=assets&_np=people&project=Phaser+ES6' },
            { txt: 'React/ES6/JSX example', href: '/u/stauzs/assets?_fp=assets&_np=people&project=Code+Import+Test' },
            { txt: 'NPM respository', href: 'https://npmjs.com' },
            { txt: 'Mozilla documents for ES6 import', href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import' }
          ]
        },
        {
          'featureTag': 'nav.flexpanel.featurelevels',
          'type': 'improvement',
          'changeName': 'Feature Levels are part of User settings',
          'changeSummary': 'The Feature Level slider values are now stored in the cloud (they were previously only in local browser storage). Also, the featureLevels Flex Panel (sliders icon on right hand side of window) is now correctly connected to the settings so the correct values are shown and can be changed also from there. They are a little bit laggy for now when dragged, but that will improved in the next few days.',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.music',
          'type': 'feature',
          'changeName': 'New Music generator: 8bit music',
          'changeSummary': 'Aded our 2nd Thematic music generator - this one creates casual/platformery 8 bit music based on various parameters',
          'otherUrls': []
        }
      ]
    },


    {
      'timestamp': 'Fri Aug 12 2016 13:30:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '1092'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [

        {
          'featureTag': 'asset.graphics',
          'type': 'bugfix',
          'changeName': 'Mouse/Trackpad scroll actions',
          'changeSummary': 'The Mousewheel/trackapd scroll actions (change frame, change zoom, paste-effects etc) were not working on some browsers. ' +
            "This has now been fixed by using a more standard 'wheel' event which is supported by more browsers",
          'otherUrls': []
        },
        {
          'featureTag': 'asset.graphics',
          'type': 'improvement',
          'changeName': 'Import and Tile sizes',
          'changeSummary': 'Improved the explanation and enforcement of Tile size and image import limits. Max graphic size is now 1024x1024, max frames per graphic is now 64',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.graphics',
          'type': 'improvement',
          'changeName': 'Improved buttons',
          'changeSummary': 'Some button sizes and hover-help text have been improved',
          'otherUrls': []
        }
      ]
    },

    {
      'timestamp': 'Wed Aug 10 2016 18:20:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '1073'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [

        {
          'featureTag': 'asset.code',
          'type': 'feature',
          'changeName': 'Code Editor: ES6 and JSX',
          'changeSummary': 'The MGB Code Editor and Code Runner now support ECMAScript 6 and JSX. ' +
            "ECMAScript 6 (ES6) is sometimes called 'Javascript 2015' and provides many significant improvements " +
            "beyond 'older' javascript versions. In order to maintain compatibility with all browsers, MGB " +
            'automatically converts ES6 code into the older style of javascript before yoru game runs.  ' +
            'React is a popular Javascript framework for UI (User Interfaces) and is actually the one that we use for MGB itself.  ' +
            "We are looking at ways to let you write your own games' UI in React, but your game-loop code in " +
            'game-oriented frameworks such as PhaserJS.. ' +
            'This will give a hybrid game+UI programming model that should make it easy to make games that also need a lot of ' +
            'Custom User Interface code',
          'otherUrls': [
            { txt: 'JSX/React MGB Code example', href: 'https://v2.mygamebuilder.com/u/stauzs/asset/3bSLWyb3jDHbDqYCQ' },
            { txt: 'ES6 New Features summary', href: 'http://es6-features.org/'},
            { txt: 'React/JS Getting started', href: 'https://facebook.github.io/react/docs/displaying-data.html'}
          ]
        },
        {
          'featureTag': 'asset.music',
          'type': 'feature',
          'changeName': 'Music Generator (Metal)',
          'changeSummary': "MGB's Thematic music generator UI is now properly UI-styled. This first music generator still only supports 'heavy metal' -themed music, but more music themes will follow. This first music generator is based on https://djen.co/",
          'otherUrls': []
        },
        {
          'featureTag': 'asset.code',
          'type': 'bugfix',
          'changeName': 'Fixed Code Edit collab loop',
          'changeSummary': 'Fixed bug where watching another person edit code would go into an infinite loop of refreshing the source analysis',
          'otherUrls': []
        }
      ]
    },

    {
      'timestamp': 'Sat Aug 06 2016 23:50:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '1032'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'nav.navPanel',
          'type': 'improvement',
          'changeName': 'NavPanel shrink and History panel tweaks',
          'changeSummary': 'The NavPanels have been shrunk a little and the History NavPanel has a much clearer presentation',
          'otherUrls': []
        },
        {
          'featureTag': 'nav.featureLevels',
          'type': 'improvement',
          'changeName': 'Feature Levels icons and hints',
          'changeSummary': "The 'Feature Levels' icon now looks like sliders. There is now a 'more tools' tool/hint in the toolbars if there are hidden features. The icon text is shown for the most recent feature level increase so it is easy to see what new tools has been enabled per feature-level",
          'otherUrls': []
        },
        {
          'featureTag': 'asset.map',
          'type': 'improvement',
          'changeName': 'Re-worked Map Editor Toolbar',
          'changeSummary': 'Map Edit tool bar has been re-arranged and has slower progression of tools as Feature Level increases',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.music',
          'type': 'feature',
          'changeName': 'Music Generator (very rough)',
          'changeSummary': "The first cut of a thematic music generator is now available in Music Editor. It's rough, but you can do some head banging if that's your thing :)",
          'otherUrls': []
        }
      ]
    },

    {
      'timestamp': 'Tue Aug 02 2016 20:50:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '998'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'asset.edit',
          'type': 'improvement',
          'changeName': 'Improved visuals and hints for Asset-Edit header',
          'changeSummary': "The Asset Edit header is the area with asset name, #viewers, #changes, project etc. It is common to all the asset editors (graphics, map, sounds etc). It was pretty ugly before, but now looks prettier and isn't so bizarre :)",
          'otherUrls': []
        },
        {
          'featureTag': 'asset.sound',
          'type': 'improvement',
          'changeName': 'Sound timeline improvements',
          'changeSummary': 'Clickable timeline for imported sounds. Thumbnail sound representation now renders all sound instead of part of it',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.map',
          'type': 'improvement',
          'changeName': 'Tiled (MapEditor.org) map Import guesses images',
          'changeSummary': "When importing a 'Tiled' map, Map Editor now guesses images from user's Assets",
          'otherUrls': []
        }
      ]
    },

    {
      'timestamp': 'Tue Aug 02 2016 09:50:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '984'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'asset.sound',
          'type': 'improvement',
          'changeName': 'Select stock sounds',
          'changeSummary': 'There are only three so far, but there will be many soon..',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.graphic',
          'type': 'improvement',
          'changeName': 'Graphic Editor Toolbar facelift',
          'changeSummary': 'Improved layout of toolbar, added more UI levels for the slider',
          'otherUrls': []
        }
      ]
    },

    {
      'timestamp': 'Sun Jul 31 2016 23:50:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '966'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'nav.users',
          'type': 'improvement',
          'changeName': 'User Lists with Badges',
          'changeSummary': 'The User Lists (find users, project members, users FlexPanel) are prettier and also show badges',
          'otherUrls': []
        },
        {
          'featureTag': 'nav.featureLevels',
          'type': 'feature',
          'changeName': 'Feature Levels',
          'changeSummary': "The 'Feature Levels' slider has moved to the top of the page. There is also a 'Feature Levels FlexPanel' at the right of the screen that shows all feature levels for the current user",
          'otherUrls': []
        },
        {
          'featureTag': 'asset.graphics',
          'type': 'improvement',
          'changeName': 'Graphic toolbars now use Feature Levels',
          'changeSummary': 'In Graphic Editor, the tools presented vary based on Feature Level',
          'otherUrls': []
        },
        {
          'featureTag': 'nav.roadmap',
          'type': 'feature',
          'changeName': 'New Roadmap page',
          'changeSummary': 'New Roadmap page - linked from Home NavPanel and from WhatsNew page',
          'otherUrls': []
        }
      ]
    },

    {
      'timestamp': 'Wed Jul 27 2016 23:50:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '899'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'nav.profile',
          'type': 'improvement',
          'changeName': 'User Profile Page content',
          'changeSummary': 'The User Profile page has been replaced. The new layout includes space for new user information including badges, skills and an activity heatmap. Skills are a placeholder currently, and activty heatmap is not enabled yet',
          'otherUrls': []
        },
        {
          'featureTag': 'nav.layout',
          'type': 'feature',
          'changeName': 'Lightened footer and NotFound page',
          'changeSummary': 'The NotFound(404) page and the Footer area of the Home page are no longer inverted, so they are less visually jarring',
          'otherUrls': []
        }
      ]
    },

    {
      'timestamp': 'Fri Jul 22 2016 17:30:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '875'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'asset.sound',
          'type': 'feature',
          'changeName': 'Sound Editor - SFX generation',
          'changeSummary': 'The Audio Editor has been replaced by two more specific assets/editors: Sound and Music. Sound editor now allows jsfxr-style sound effects to be re-edited, or for .ogg files to be imported',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.music',
          'type': 'feature',
          'changeName': 'Music Assets',
          'changeSummary': 'The Audio Editor has been replaced by two more specific assets/editors: Sound and Music. Music editor allows .ogg music files to be imported. More features coming soon!',
          'otherUrls': []
        },

        {
          'featureTag': 'asset.sound',
          'type': 'improvement',
          'changeName': 'Sound Editor - Thumbnails',
          'changeSummary': 'The Sound Editor now saves thumbnails of sounds for Asset previews',
          'otherUrls': []
        },

        {
          'featureTag': 'asset.music',
          'type': 'improvement',
          'changeName': 'Music Editor - Thumbnails',
          'changeSummary': 'The Music Editor now saves thumbnails of sounds for Asset previews',
          'otherUrls': []
        },

        {
          'featureTag': 'asset.map',
          'type': 'improvement',
          'changeName': 'Map Editor - fixes and tweaks',
          'changeSummary': 'Map editor is almost functionally complete - so this build has various UI and auto-save tweaks & fixes',
          'otherUrls': []
        }
      ]
    },

    {
      'timestamp': 'Wed Jul 20 2016 21:25:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '848'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'asset.map',
          'type': 'improvement',
          'changeName': 'Map Editor - auto save',
          'changeSummary': 'The Map Editor is now auto-saving in most cases - there are still some cases to be implemented though',
          'otherUrls': []
        },

        {
          'featureTag': 'asset.audio',
          'type': 'feature',
          'changeName': 'Audio Editor - audio waveform preview',
          'changeSummary': 'When importing or listing sounds, a waveform is displayed. A cursor shows/sets the current playback position within the sound',
          'otherUrls': []
        }
      ]
    },

    {
      'timestamp': 'Tue Jul 19 2016 19:31:23 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '837'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'asset.map',
          'type': 'improvement',
          'changeName': 'Map Editor - adaptive toolbar',
          'changeSummary': "The Map Editor is using the new Editor Toolbar system. This provides more tooltip help, and also supports a 'simplify' mode which shows fewer tools with clearer buttons. Use the slider at the bottom-left of the window to change the Toolbar complexity level",
          'otherUrls': []
        },
        {
          'featureTag': 'asset.map',
          'type': 'improvement',
          'changeName': 'Map Editor - objects',
          'changeSummary': 'The Map Editor supports more object types and object groups',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.graphics',
          'type': 'improvement',
          'changeName': 'Graphic Editor - nicer resizer',
          'changeSummary': 'You can now enter the width or height of the graphic',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.graphics',
          'type': 'improvement',
          'changeName': 'Graphic Editor - paste modifiers',
          'changeSummary': 'You can now flip/rotate the paste preview using the mousewheel',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.audio',
          'type': 'feature',
          'changeName': 'Audio Editor - preliminary',
          'changeSummary': 'The Audio asset type has been enabled. So far it can import .ogg files, play them, but not save them (yet)',
          'otherUrls': []
        }
      ]
    },
    {
      'timestamp': 'Tue Jul 12 2016 23:40:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '791'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'nav.profile',
          'type': 'improvement',
          'changeName': 'User profile has MGB1 name + avatar',
          'changeSummary': 'MGB1 users can enter their old MGB1 account name and show the icon here. There is no verification of this name (yet)',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.graphics',
          'type': 'feature',
          'changeName': 'Graphic Import from PNG/GIF',
          'changeSummary': "Use the IMPORT button to import PNGs/GIFs. PNGs with multiple frames ina 'filmstrip' can be split into individual animation frames at import time. GIFs get imported as multiple frames",
          'otherUrls': []
        },
        {
          'featureTag': 'nav.layout',
          'type': 'improvement',
          'changeName': 'ESC key preserves panel states',
          'changeSummary': 'The ESC key now preserves selected sub-panels for Flex and Nav Panels.. So pushing ESC twice no longer resets to default panels (home+activity)',
          'otherUrls': []
        }
      ]
    },

    {
      'timestamp': 'Mon Jul 11 2016 23:40:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '779'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'nav.projects.new',
          'type': 'improvement',
          'changeName': "'Create New Project' is now it's own page",
          'changeSummary': "The feature to create a new Project was previously a dropdown on the ProjectsList page, but it was cramped, had limited explanation, and was not easily linkable. Moving this to it's own page solves these issues, and gives space to add new features for Projects",
          'otherUrls': []
        },
        {
          'featureTag': 'asset.map',
          'type': 'improvement',
          'changeName': 'Map Editor ellipses',
          'changeSummary': 'Adding more MapEditor.org-compatible features - ellipses (adding functionality)',
          'otherUrls': []
        }
      ]
    },

    {
      'timestamp': 'Sat Jul 09 2016 13:50:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '761'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'nav.assets.new',
          'type': 'improvement',
          'changeName': "'Create New Asset' is now a new page",
          'changeSummary': "The feature to create a new asset was previously a dropdown on the AssetsList page, but it was cramped, had limited explanation, and was not easily linkable. Moving this to it's own page solves these issues, and gives space to add new features such as 'choose project' for asset",
          'otherUrls': []
        },
        {
          'featureTag': 'asset.map',
          'type': 'improvement',
          'changeName': 'Map Editor retangles/polylines',
          'changeSummary': 'Adding more MapEditor.org-compatible features - rectangles and polylines',
          'otherUrls': []
        }
      ]
    },

    {
      'timestamp': 'Thu Jul 07 2016 21:05:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '735'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'nav.layout',
          'type': 'improvement',
          'changeName': 'Let there be light',
          'changeSummary': 'The FlexPanel (column of stuff on the far right) and the NavBar (bar at top of central section) have been lightened up. Scrollbars also got a similar treatment and visual simplification',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.graphic',
          'type': 'feature',
          'changeName': 'Graphic area selection now animates',
          'changeSummary': 'Pretty crawling-dashed lines. Unselect and paste-elsewhere coming soon',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.map',
          'type': 'improvement',
          'changeName': 'Map Editor tweaks',
          'changeSummary': 'Selections/handles and rotation improvements',
          'otherUrls': []
        }
      ]
    },

    {
      'timestamp': 'Wed Jul 06 2016 17:35:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '722'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'nav.urls',
          'type': 'improvement',
          'changeName': 'Urls now have username instead of ID',
          'changeSummary': 'The /user/XXXXXXXXXXXXXX urls have been replaced by nicer /u/name urls',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.graphic',
          'type': 'feature',
          'changeName': 'Cut/Copy/Paste in graphics',
          'changeSummary': 'Select, Copy and Cut work as expected. Paste is going to get more work so it is easy to reposition where to paste to',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.map',
          'type': 'bugfix',
          'changeName': '3D preview fix for Internet Explorer',
          'changeSummary': 'The 3D map preview now works in Internet Explorer 10',
          'otherUrls': []
        }
      ]
    },

    {
      'timestamp': 'Tue Jul 05 2016 22:20:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '705'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'nav.flexpanel.chat',
          'type': 'improvement',
          'changeName': 'Chat can load earlier messages',
          'changeSummary': 'Chat only loads 5 most recent messages initially, and user can load more history as desired',
          'otherUrls': []
        },
        {
          'featureTag': 'nav.flexpanel.chat',
          'type': 'improvement',
          'changeName': 'Chat channels are on the url',
          'changeSummary': 'Chat channels are now part of the url (e.g ?_fp=chat.random) so back/fwd navigation and deep links work correctly',
          'otherUrls': []
        },
        {
          'featureTag': 'nav.layout',
          'type': 'improvement',
          'changeName': 'Home page and scrollbar cleanup',
          'changeSummary': "Added webkit-specific styling options to shrink the scrollbars on Windows for Webkit-based browsers (notably Google Chrome). Shrunk the Home page masthead and changed it's colorscheme to black-on-white.",
          'otherUrls': []
        },
        {
          'featureTag': 'asset.map',
          'type': 'bugfix',
          'changeName': 'Map grid bugfix',
          'changeSummary': 'The visual and log errors from moving maps when grid=off have been fixed',
          'otherUrls': []
        },
        {
          'featureTag': 'nav.flexpanel.chat',
          'type': 'improvement',
          'changeName': 'Chat channels',
          'changeSummary': 'Chat now has multiple channels.. with security!',
          'otherUrls': []
        },
        {
          'featureTag': 'nav.flexpanel',
          'type': 'improvement',
          'changeName': 'FlexPanel Select/hide column',
          'changeSummary': 'FlexPanel is now a mini menu column on the right of the window. This provides much faster navigation and will also enable notification for chat etc',
          'otherUrls': []
        },
        {
          'featureTag': 'nav.assets',
          'type': 'bugfix',
          'changeName': 'Asset List sort-by selections fixed',
          'changeSummary': 'The sort-by selections for Assets were only being applied locally. The server now honors the same orderings so the list makes sense now',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.graphic',
          'type': 'bugfix',
          'changeName': 'Fixed graphic frame select issues.',
          'changeSummary': 'The edit area now reliably matches the selected frame/layer, even after inserts, moves etc',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.graphic',
          'type': 'bugfix',
          'changeName': 'Play-animation no longer spams database',
          'changeSummary': 'Changing frame/layer can only update the viewer/activity database every five seconds now.. Not everytime the animation frame changes!',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.graphic',
          'type': 'improvement',
          'changeName': 'Graphic Pen/Erase tools more responsive',
          'changeSummary': 'The Pen and Edit tools no longer leave gaps when mouse movement is rapid',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.map',
          'type': 'improvement',
          'changeName': 'Support for maps from MGBv1',
          'changeSummary': "The import capabilities aren't exposed for users yet, but you can see some MGB1 maps starting to appear :)",
          'otherUrls': []
        },
        {
          'featureTag': 'asset.doc',
          'type': 'improvement',
          'changeName': 'Experimenting with a document edit control',
          'changeSummary': "Documents can't yet be saved.",
          'otherUrls': []
        }
      ]
    },


    {
      'timestamp': 'Fri Jun 24 2016 21:00:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '639'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'asset.graphic',
          'type': 'improvement',
          'changeName': 'Graphic editor fixes and improvements',
          'changeSummary': 'Undo now works after adding layers/frames. Hover help on preview frames. Warnings and info on tools and read-only cases. Hover help for tools. Optimized backwash for just relevant cases',
          'otherUrls': []
        },
        {
          'featureTag': 'api.mgb1',
          'type': 'feature',
          'changeName': 'Api for MGBv1 assets',
          'changeSummary': 'New REST API for obtaining MGBv1 tiles as PNGs, and actor/map assets as JSON data. For example http://v2.mygamebuilder.com/api/mgb1/map/.acey53/Club%20Penguin%20Agents%20Under%20Attack/HQ',
          'otherUrls': []
        }
      ]
    },

    {
      'timestamp': 'Mon Jun 20 2016 01:10:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '620'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'asset.graphic',
          'type': 'improvement',
          'changeName': 'Graphic editor fixes for fill and pen',
          'changeSummary': 'Fill was only filling if colors were significantly different. Tolerance has been reduced from 128 to 8. Also fixed single-click pen bug - this now renders 1 pixel change. Edits were sometimes lost with drawing after save - now fixed',
          'otherUrls': []
        },
        {
          'featureTag': 'assets',
          'type': 'improvement',
          'changeName': 'Assets have a description field',
          'changeSummary': 'Asset descriptions can be edited in the Asset Editor using the header. If there is no description and you do not have write access, then the description is not shown',
          'otherUrls': []
        },
        {
          'featureTag': 'user.profile.focus',
          'type': 'feature',
          'changeName': 'Focus Message in Profile and Nav',
          'changeSummary': "On your profile, there is now a 'Focus' field. If set, this shows in your top Nav bar. Changes are also logged in the activity tracker. It is intended to help you remember and communicate your current focus.",
          'otherUrls': []
        },
        {
          'featureTag': 'ops.scale',
          'type': 'improvement',
          'changeName': 'MGBv2 server farm',
          'changeSummary': 'The servers have been scaled up. There are three front-end server nodes plus three back-end MongoDB Database replica nodes. In addition, load profiling/alerting have been enabled for the servers.',
          'otherUrls': []
        },
        {
          'featureTag': 'nav.navbar',
          'type': 'improvement',
          'changeName': 'Breadcrumb bar on Nav Bar (top row)',
          'changeSummary': 'All pages now show a navigation context on the Navigation bar. The smaller assetEdit breadcrumb bar has shrunk to remove duplicate content',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.graphic',
          'type': 'improvement',
          'changeName': 'Raise/Lower Map Layer',
          'changeSummary': 'More tools and fixes for maps',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.map',
          'type': 'improvement',
          'changeName': 'Undo/Redo for maps',
          'changeSummary': 'Undo and Redo for maps.',
          'otherUrls': []
        },
        {
          'featureTag': 'nav.flexpanel',
          'type': 'improvement',
          'changeName': 'FlexPanels are browser height',
          'changeSummary': "FlexPanels on the right are now fixed in place and don't scroll with page",
          'otherUrls': []
        },
        {
          'featureTag': 'nav.assets',
          'type': 'improvement',
          'changeName': 'Asset card avatars and links',
          'changeSummary': 'Asset cards now show User avatars. Asset cards are also now clickable to edit/view using the thumbnail or title',
          'otherUrls': []
        },
        {
          'featureTag': 'nav.navpanel',
          'type': 'improvement',
          'changeName': 'NavPanels are browser height',
          'changeSummary': "NavPanels on the left are now fixed in place and don't scroll with page",
          'otherUrls': []
        },
        {
          'featureTag': 'nav.flexpanel.chat',
          'type': 'improvement',
          'changeName': 'Chat autoscrolls to end',
          'changeSummary': 'The Chat FlexPanel now autoscrolls to most recent message. No way to prevent this yet',
          'otherUrls': []
        }
      ]
    },

    {
      'timestamp': 'Thu Jun 16 2016 03:05:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '552'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'asset.map',
          'type': 'improvement',
          'changeName': 'Map Tile Layer Tools',
          'changeSummary': 'More tools and fixes for maps',
          'otherUrls': []
        },
        {
          'featureTag': 'nav.flexpanel.activity',
          'type': 'improvement',
          'changeName': 'Activity Flexpanel more compact, has user images',
          'changeSummary': 'Shrunk fonts/sizes and tightened text for activity feed. Added user images!',
          'otherUrls': []
        },
        {
          'featureTag': 'nav.flexpanel.chat',
          'type': 'improvement',
          'changeName': 'Chat Flexpanel has user images',
          'changeSummary': 'Added user images to Chat Flexpanel and fixed bug with empty messages and scrolling',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.graphic',
          'type': 'improvement',
          'changeName': 'Graphic animation improvements',
          'changeSummary': 'In graphic editor, it is easier now to manage animations. Also, shrunk tools slightly',
          'otherUrls': []
        }
      ]
    },

    {
      'timestamp': 'Wed Jun 15 2016 02:01:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '524'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'nav.assetedit',
          'type': 'improvement',
          'changeName': 'Navigation Breadcrumb bar',
          'changeSummary': 'Improved the left-half of the Asset Edit header. The breadcrumb bar now provides more context and also easy navigation to related material',
          'otherUrls': []
        },
        {
          'featureTag': 'nav.chat',
          'type': 'feature',
          'changeName': 'Chat!',
          'changeSummary': 'Only global chat for now. Channels and DMs are coming soon. Use the Chat FlexPanel on the right to see and send chat messages',
          'otherUrls': []
        },
        {
          'featureTag': 'nav.esc',
          'type': 'feature',
          'changeName': 'ESC key toggles Panels',
          'changeSummary': 'Press ESC to show/hide both sets of Panels',
          'otherUrls': []
        },
        {
          'featureTag': 'nav.navpanel.recent',
          'type': 'improvement',
          'changeName': 'History - Ranges and Actions',
          'changeSummary': 'Improved the NavPanel recent/history panel. It now shows history broken into three age ranges, and provides more feedback on what changed',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.graphic',
          'type': 'improvement',
          'changeName': 'Delete ops',
          'changeSummary': 'Delete frame / layer is more robust now',
          'otherUrls': []
        }
      ]
    },

    {
      'timestamp': 'Mon Jun 13 2016 23:45:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '499'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'nav.navpanel.project',
          'type': 'feature',
          'changeName': 'NavPanel for Projects',
          'changeSummary': 'Extra NavPanel showing Owned and Member-of projects',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.graphic',
          'type': 'improvement',
          'changeName': 'Frame ops',
          'changeSummary': 'Extra operations for frames - delete, move, insert',
          'otherUrls': []
        }
      ]
    },

    {
      'timestamp': 'Wed Jun 08 2016 21:10:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '456'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'asset.map',
          'type': 'improvement',
          'changeName': 'Map Grids, Layers, fixes',
          'changeSummary': 'Grids for each layer, Active Layer Highlight, other fixes',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.graphic',
          'type': 'improvement',
          'changeName': 'Graphic Animations',
          'changeSummary': 'Graphic Animations, also layer/frame features work now',
          'otherUrls': []
        },
        {
          'featureTag': 'nav.navpanel.recent',
          'type': 'improvement',
          'changeName': 'Recent asset thumbnails',
          'changeSummary': 'Show thumbnail previews for Recent assets on hover',
          'otherUrls': []
        },
        {
          'featureTag': 'nav.flexpanel.activity',
          'type': 'improvement',
          'changeName': 'Active asset thumbnails',
          'changeSummary': 'Show thumbnail previews for Active assets on hover',
          'otherUrls': []
        }
      ]
    },


    {
      'timestamp': 'Tue Jun 07 2016 14:16:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '410'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'nav.links',
          'type': 'improvement',
          'changeName': 'Nav Panel Framework',
          'changeSummary': 'All  Links are now preserving the panel states.',
          'otherUrls': []
        },
        {
          'featureTag': 'asset.graphic',
          'type': 'improvement',
          'changeName': 'Show/Lock/Preview frame/layer',
          'changeSummary': 'Show/Hide/Lock/Unlock layer (buttons, not working yet), show preview canvas, add frame',
          'otherUrls': []
        },
        {
          'featureTag': 'nav.sidebar',
          'type': 'removed',
          'changeName': 'Sidebar removed',
          'changeSummary': 'This has been replaced by the nav panel which can persist and provide a two-level navigation',
          'otherUrls': []
        }
      ]
    },


    {
      'timestamp': 'Tue Jun 07 2016 01:00:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '387'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'nav.navpanel',
          'type': 'feature',
          'changeName': 'Nav Panel Framework',
          'changeSummary': 'Added the new Nav Panel framework. This is on the left. There is a permanent 1st level nav which unlocks 2nd level nav that can be hidden/shown by clicking on the 1st level nav icon. Needs tidying up, but this is the intent for replaceing the sidebar and top nav',
          'otherUrls': []
        }
      ]
    },


    {
      'timestamp': 'Sun Jun 05 2016 13:45:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '376'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'nav.flexpanel.assets',
          'type': 'feature',
          'changeName': 'Assets Flex Panel',
          'changeSummary': "Added the 'Assets' Flex Panel including name search. Use the > button in the top-right NavBar to show this",
          'otherUrls': []
        },
        {
          'featureTag': 'nav.flexpanel.USERS',
          'type': 'feature',
          'changeName': 'USER Flex Panel',
          'changeSummary': "Added a simplistic (for now) 'Users' Flex panel. Use the > button in the top-right NavBar to show this",
          'otherUrls': []
        },
        {
          'featureTag': 'nav.flexpanel.activity',
          'type': 'feature',
          'changeName': 'Activity Flex Panel',
          'changeSummary': "Added the 'Activity' Flex panel. Use the > button in the top-right NavBar to show this",
          'otherUrls': []
        },
        {
          'featureTag': 'assets.map',
          'type': 'improvement',
          'changeName': 'Map editor',
          'changeSummary': 'Temporary way to add tilemaps by pasting in an MGB Asset URL',
          'otherUrls': []
        }
      ]
    },

    {
      'timestamp': 'Thu Jun 02 2016 23:45:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '355'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'nav.flexpanel',
          'type': 'feature',
          'changeName': 'FlexPanels',
          'changeSummary': 'Added the UI framework for Flex Panels - space for extra context on the RHS of the screen, similar to slack',
          'otherUrls': []
        }

      ]
    },


    {
      'timestamp': 'Thu Jun 02 2016 10:35:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '354'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'assets.map',
          'type': 'feature',
          'changeName': 'Map editor',
          'changeSummary': 'First parts of Map editor in place - import, render and show tileMaps',
          'otherUrls': []
        },
        {
          'featureTag': 'assets.graphics',
          'type': 'bugfix',
          'changeName': 'Tool selection fixed',
          'changeSummary': 'Fixed problems where tool selection was inconsistent',
          'otherUrls': []
        }

      ]
    },

    {
      'timestamp': 'Mon May 30 2016 23:25:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '345'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'nav.assets',
          'type': 'improvement',
          'changeName': 'Asset card cleanup',
          'changeSummary': 'Asset cards are now fixed width and have more space for the thumbnails. Some other visual cleanup also. Asset kind selector has an explicit All selector, and alt-click behavior has been reversed',
          'otherUrls': []
        },
        {
          'featureTag': 'assets.code',
          'type': 'improvement',
          'changeName': 'Code Thumbnails',
          'changeSummary': 'Code can now have thumbnails. Use the Set Thumbnail button while the script is running',
          'otherUrls': []
        }

      ]
    },


    {
      'timestamp': 'Mon May 30 2016 02:00:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '338'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'projects',
          'type': 'improvement',
          'changeName': 'Project Cards Descriptions',
          'changeSummary': 'Project Card Overview page allows Project description to be edited',
          'otherUrls': []
        }

      ]
    },


    {
      'timestamp': 'Sun May 29 2016 14:00:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '337'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'projects',
          'type': 'improvement',
          'changeName': 'Project Cards, Membership',
          'changeSummary': 'Fuller implementation of projects with membership, project cards etc',
          'otherUrls': []
        },
        {
          'featureTag': 'nav.assets',
          'type': 'improvement',
          'changeName': 'Asset queries bookmarkable',
          'changeSummary': 'Asset queries now put the query state on the URL so it can support bookmarking and deep linking',
          'otherUrls': []
        },
        {
          'featureTag': 'ui',
          'type': 'improvement',
          'changeName': 'Lots of UI tweaks everywhere',
          'changeSummary': 'Spacing, alignment and control changes in many places ',
          'otherUrls': []
        }
      ]
    },


    {
      'timestamp': 'Tue May 24 2016 20:50:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '317'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'assets.kind._mgbui',
          'type': 'improvement',
          'changeName': 'MGB UI Mockup asset',
          'changeSummary': "Multi-user editing now works with this asset type. Also tweaked 'Strip react comments' icon",
          'otherUrls': []
        },
        {
          'featureTag': 'nav.whatsnew',
          'type': 'improvement',
          'changeName': "Yellow for What's New",
          'changeSummary': 'Trying a yellow background to make this stand out from the rest of the site.. since it is meta ',
          'otherUrls': []
        }
      ]
    },


    {
      'timestamp': 'Mon May 23 2016 18:20:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '316'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'assets.kind._mgbui',
          'type': 'feature',
          'changeName': 'MGB UI Mockup asset',
          'changeSummary': 'New MGBUI asset kind (for MGB devs only) to edit/preview our SemanticUi markup. Including HTML smart editor and Semantic UI hints for icons and elements',
          'otherUrls': []
        }
      ]
    },


    {
      'timestamp': 'Sat May 21 2016 19:45:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '314'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'nav.assets',
          'type': 'improvement',
          'changeName': 'Asset Filters column',
          'changeSummary': 'Filters column is fixed size and white now',
          'otherUrls': []
        }
      ]
    },


    {
      'timestamp': 'Fri May 20 2016 23:45:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '313'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'user.profile.text',
          'type': 'improvement',
          'changeName': 'User Profile text',
          'changeSummary': 'User Profile text can now be edited and saved',
          'otherUrls': []
        },
        {
          'featureTag': 'nav.assets',
          'type': 'improvement',
          'changeName': 'Asset Filters column',
          'changeSummary': 'Moved the search selectors to a left column.',
          'otherUrls': []
        }
      ]
    },

    {
      'timestamp': 'Wed May 18 2016 21:30:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '312'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'asset.edit.history',
          'type': 'improvement',
          'changeName': 'Asset History renamed',
          'changeSummary': "Asset History is now 'Changes' and has a lightning icon. Layout was also slightly changed",
          'otherUrls': []
        },
        {
          'featureTag': 'nav.assets.create',
          'type': 'improvement',
          'changeName': 'Audio & Cutscene icons',
          'changeSummary': 'Audio & Cutscene asset types now have more relevant icons',
          'otherUrls': []
        }
      ]
    },

    {
      'timestamp': 'Wed May 18 2016 16:30:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '311'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'nav.whatsnew',
          'type': 'feature',
          'changeName': "'What's New!'",
          'changeSummary': 'New icon & popup on header describes new features of MGB - like this!',
          'otherUrls': []
        },
        {
          'featureTag': 'nav.assets.create',
          'type': 'improvement',
          'changeName': 'Create Asset',
          'changeSummary': 'Asset types that are not implemented yet are now greyed out',
          'otherUrls': []
        }
      ]
    },

    {
      'timestamp': 'Mon May 16 2016 22:30:00 GMT-0700 (PDT)',

      'id': {
        'ver': '0.0.1',
        'state': 'alpha',
        'iteration': '310'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'asset.edit.history',
          'type': 'feature',
          'changeName': 'View Asset history',
          'changeSummary': 'In Asset Editor, show history of changes to this asset',
          'otherUrls': []
        },
        {
          'featureTag': 'nav.assets.search',
          'type': 'bugfix',
          'changeName': 'Text search fixed',
          'changeSummary': 'Text search was only doing full word search. Now handles partial string matches',
          'otherUrls': []
        }
      ]
    }

  ]
}

export const getReleaseVersionString = id => (`${id.ver} ${id.state} ${id.iteration}`)
export const getCurrentReleaseVersionString = () => (getReleaseVersionString(mgbReleaseInfo.releases[0].id))

export default mgbReleaseInfo