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