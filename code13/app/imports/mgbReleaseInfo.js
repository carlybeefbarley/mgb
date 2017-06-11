// This is the data structure that drives the WhatsNew.js control for MGB2

// Note on some values:
//    mgbReleaseInfo.releases[].changes[].type
//            feature:      New Feature
//            improvement:  Enhanced existing feature
//            bugfix:       Fix a bug
//            removed:      Feature Removed

// For iteration, I just simply use the number of commits (including this) at https://github.com/devlapse/mgb

// Older history is loaded on demand from here (under /public so it can be retrieved as a static asset by clients)
export const olderHistoryPath = '/releaseHistory.json'

const mgbReleaseInfo = {

  'releases': [




    {
      'timestamp': 'Sat Jun 10 2017 19:39:54 GMT-0700 (PDT)',

      'id': {
        'ver': '0.2.0',
        'state': 'Beta',
        'iteration': '4328'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'flexpanel.chat',
          'type': 'improvement',
          'changeName': 'Chat @mentions are now profile links',
          'changeSummary': 'Type a @username like @dgolds in chat and the message will render as a link to the user\'s profile',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'moderation.chat',
          'type': 'improvement',
          'changeName': 'Chat moderation warns about censored text instead of ***ing it',
          'changeSummary': 'The swearjar system nows warns users about phrases rather than sharing the message with certain stuff bleeped out. This seems better.',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'game.play',
          'type': 'improvement',
          'changeName': 'Touch controller overlay for actorMap games',
          'changeSummary': 'On touch devices, we provide an optional overlay to use the games without a keypad/keyboard. This now resizes more sensibly than before.',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'nav.ui',
          'type': 'improvement',
          'changeName': 'UI cleanup (in progress)',
          'changeSummary': 'Lightened the style for the main page area. FlexPanel area is next!   Re-arranged the user profile area a bit (but it still needs work).  Created a new, smaller userItem control and we use that now in some user lists (flexpanel, project members, colleagues etc).',
          'otherUrls': [ ]
        }

      ]

    },



    {
      'timestamp': 'Tue Jun 06 2017 04:45 GMT-0700 (PDT)',

      'id': {
        'ver': '0.2.0',
        'state': 'Beta',
        'iteration': '4300'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'game.actormap',
          'type': 'improvement',
          'changeName': 'ActorMap game improvements',
          'changeSummary': 'The buttons for the actorMap game player have been simplified and have better help text. Frame rate is now locked to 30fps. Fixed bug with melee repeat modifier',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'asset.code',
          'type': 'improvement',
          'changeName': 'Code Splitting',
          'changeSummary': 'The Code Editor is now also dynamically loaded, further reducing initial page load times',
          'otherUrls': [ ]
        }
      ]

    },


    {
      'timestamp': 'Sat Jun 03 2017 00:30 GMT-0700 (PDT)',

      'id': {
        'ver': '0.2.0',
        'state': 'Beta',
        'iteration': '4284'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'asset.graphic',
          'type': 'improvement',
          'changeName': 'Minimap improvement in Graphic Editor',
          'changeSummary': 'The graphic editor \'minimap\' does not take so much space now, and scales down for very large images.',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'asset.graphic',
          'type': 'improvement',
          'changeName': 'Code Splitting',
          'changeSummary': 'The site has been split into multiple dynamically loadable modules, so initial pages load faster. Currently all the asset editors except the code editor will load-on-demand, and more areas of the product will be chnaged to load dynamically soon',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'bugfix',
          'type': 'bugfix',
          'changeName': 'A bunch of bugfixes/tweaks',
          'changeSummary': 'bugfix for Actors/ActorMaps with Melee weapons; homepage ui cleanup; Update to latest build system to enable code splitting in later releases. Fix for audio/music editors not loading' ,
          'otherUrls': [ ]
        }
      ]

    },


    {
      'timestamp': 'Wed May 31 2017 00:45 GMT-0700 (PDT)',

      'id': {
        'ver': '0.2.0',
        'state': 'Beta',
        'iteration': '4256'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'nav.badges',
          'type': 'feature',
          'changeName': 'Badge holders',
          'changeSummary': 'It is now possible to see which users have a specific badge.',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'bugfix',
          'type': 'bugfix',
          'changeName': 'A bunch of bugfixes/tweaks',
          'changeSummary': 'Cleanup up signup/login pages to fix autocomplete issues and add an image next to signup; fixed some actormap logic bugs with weapons; ' ,
          'otherUrls': [ ]
        }
      ]

    },

    {
      'timestamp': 'Sat May 27 2017 23:15 GMT-0700 (PDT)',

      'id': {
        'ver': '0.2.0',
        'state': 'Beta',
        'iteration': '4243'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'edit.graphic.minimap',
          'type': 'feature',
          'changeName': 'Preview animations',
          'changeSummary': 'Feature suggested by @Zaqory - preview just the named animation changes. Now clicking on the animation name in the graphic editor will start/stop the animation preview - but just for the frames within that animation.',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'bugfix',
          'type': 'bugfix',
          'changeName': 'A bunch of bugfixes/tweaks',
          'changeSummary': 'More badges (and users are now sorted by badge count)! Fixed respawn/persist bug with actorMap games; reduced JS download size by 10%; Fixed bug reported by @Zaqory with actors using frames within graphics for animations; removed the \'Network\ flexPanel and instead moved the reconnect-now functionality to the main no-network message bar that is shown when offline; added server support for the upcoming mobile apps to connect via CDN; Fixed issue where drawing would get interrupted every 12 seconds by a chat-unreads check' ,
          'otherUrls': [ ]
        }
      ]

    },

    {
      'timestamp': 'Thu May 25 2017 14:10 GMT-0700 (PDT)',

      'id': {
        'ver': '0.2.0',
        'state': 'Beta',
        'iteration': '4223'
      },

      'releaseManagement': {
        'eng': 'dgolds'
      },

      'changes': [
        {
          'featureTag': 'edit.graphic.minimap',
          'type': 'feature',
          'changeName': 'New MiniMap 1x graphic preview for graphic editor',
          'changeSummary': 'The graphic editor now has an extra \'MiniMap\' button. When clicked, this will show a draggable preview of the current frame at 1x resolution. The preview miniMap can also (optionally) show the current frame tessellated (in a 3x3 grid of itself).',
          'otherUrls': [ ]
        },
        {
          'featureTag': 'bugfix',
          'type': 'bugfix',
          'changeName': 'A bunch of bugfixes/tweaks',
          'changeSummary': 'Hid last getStarted tutorial which didn\'t actually do anything; Forking assets now clears the \'loved\' entries from the new assets; Fixed one of the gettingStarted tutorials (#16) that was getting stuck',
          'otherUrls': [ ]
        }
      ]

    }

      // ,
      // Older history has been moved to ${olderHistoryPath} in order to reduce js size
      // But at least the most recent should be in this file. 
      // See notes in main_server.js for how to more to ${olderHistoryPath} as JSON

  ]
}

export const getReleaseVersionString = id => (`${id.ver} ${id.state} ${id.iteration}`)
export const getCurrentReleaseVersionString = () => (getReleaseVersionString(mgbReleaseInfo.releases[0].id))

export default mgbReleaseInfo