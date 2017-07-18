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
  releases: [
    {
      timestamp: 'Mon Jul 17 2017 16:30:00 GMT-0700 (PDT)',

      id: {
        ver: '0.2.1',
        state: 'Beta',
        iteration: '4643',
      },

      releaseManagement: {
        eng: 'dgolds',
      },

      changes: [
        {
          featureTag: 'tutorials.getStarted',
          type: 'improvement',
          changeName: 'Getting Started tutorials',
          changeSummary: 'The "getting started" tutorials have been streamlined further. ',
          otherUrls: [],
        },
        {
          featureTag: 'bugfix',
          type: 'bugfix',
          changeName: 'A bunch of bugfixes/tweaks',
          changeSummary: 'Fixed some issues with Items in ActorMap games. ',
          otherUrls: [],
        },
      ],
    },
    {
      timestamp: 'Fri Jul 14 2017 08:40:00 GMT-0700 (PDT)',

      id: {
        ver: '0.2.1',
        state: 'Beta',
        iteration: '4622',
      },

      releaseManagement: {
        eng: 'levithomason',
      },

      changes: [
        {
          featureTag: 'bugfix',
          type: 'bugfix',
          changeName: 'A bunch of bugfixes/tweaks',
          changeSummary: 'Linted and refactored the codebase. Fixed many missing links and components.',
          otherUrls: [],
        },
      ],
    },
    {
      timestamp: 'Sun July 9 2017 00:20:00 GMT-0700 (PDT)',

      id: {
        ver: '0.2.0',
        state: 'Beta',
        iteration: '4586',
      },

      releaseManagement: {
        eng: 'dgolds',
      },

      changes: [
        {
          featureTag: 'bugfix',
          type: 'bugfix',
          changeName: 'A bunch of bugfixes/tweaks',
          changeSummary:
            'Fix "get Older messages" for chat; Prevent profanity in asset names; Cleaned up and simplified some tutorials based on user feedback. Fix some obscure bugs. Hide some sections in user profile if there is no content (projects, friends etc).',
          otherUrls: [],
        },
      ],
    },

    {
      timestamp: 'Wed July 5 2017 16:20:00 GMT-0700 (PDT)',

      id: {
        ver: '0.2.0',
        state: 'Beta',
        iteration: '4557',
      },

      releaseManagement: {
        eng: 'dgolds',
      },

      changes: [
        {
          featureTag: 'Asset flagging and banning',
          type: 'feature',
          changeName: 'Users may now flag assets that do not conform to our Terms of Service',
          changeSummary: 'Assets now have the same flag/moderation features that Chats gained last week.',
          otherUrls: [],
        },
        {
          featureTag: 'Activity for skills and badges',
          type: 'improvement',
          changeName: 'Activity updates for Badges and skills',
          changeSummary:
            'There were some items missing from the Activity stream - skills gained and badges earned. These have been added. The activity FlexPanel is still "noisy" since it does not yet support filtering. Activity filtering, notifications, and Dashboard will arrive by mid July.',
          otherUrls: [],
        },
        {
          featureTag: 'bugfix',
          type: 'bugfix',
          changeName: 'A bunch of bugfixes/tweaks',
          changeSummary:
            'The "Next tutorial" button for the Get Started tutorials now updates when those tutorials have all been completed; the network-offline message has been tweaked a bit; All project lists are now consistently sorted by most-recently-created-first; Fixed some chat-notification bugs; Fixed some code-import bugs; Fixed a playsCount bug; Make the Graphic Editor\' frames-menu more discoverable.',
          otherUrls: [],
        },
      ],
    },
    {
      timestamp: 'Fri Jun 30 2017 21:00:00 GMT-0700 (PDT)',

      id: {
        ver: '0.2.0',
        state: 'Beta',
        iteration: '4535',
      },

      releaseManagement: {
        eng: 'dgolds',
      },

      changes: [
        {
          featureTag: 'nav.layout',
          type: 'improvement',
          changeName: 'UI Improvements',
          changeSummary:
            'The create-asset UI has been cleaned up and the tutorials for it have been simplified. We have some new spam-flagging features. Graphic Editor has a small and big mode for the frame viewer. Actor Editor has an improved animations editor UI.',
          otherUrls: [],
        },
      ],
    },

    {
      timestamp: 'Mon Jun 26 2017 22:00:00 GMT-0700 (PDT)',

      id: {
        ver: '0.2.0',
        state: 'Beta',
        iteration: '4494',
      },

      releaseManagement: {
        eng: 'dgolds',
      },

      changes: [
        {
          featureTag: 'nav.layout',
          type: 'improvement',
          changeName: 'UI Cleanup',
          changeSummary:
            'The Breadcrumb bar and the FlexPanels have received a UI cleanup, and colors have been tweaked further or reduced for clarity.',
          otherUrls: [],
        },
      ],
    },

    {
      timestamp: 'Fri Jun 23 2017 13:30:00 GMT-0700 (PDT)',

      id: {
        ver: '0.2.0',
        state: 'Beta',
        iteration: '4470',
      },

      releaseManagement: {
        eng: 'dgolds',
      },

      changes: [
        {
          featureTag: 'bugfix',
          type: 'bugfix',
          changeName: 'A bunch of bugfixes/tweaks',
          changeSummary:
            'Fixed bug that broke actorMap Layer editing. Fixed misplaced popup on Avatar edit prompt. Improved ActorMap animiation editor UI',
          otherUrls: [],
        },
      ],
    },

    {
      timestamp: 'Thu Jun 22 2017 16:40:00 GMT-0700 (PDT)',

      id: {
        ver: '0.2.0',
        state: 'Beta',
        iteration: '4465',
      },

      releaseManagement: {
        eng: 'dgolds',
      },

      changes: [
        {
          featureTag: 'nav.layout',
          type: 'feature',
          changeName: 'Show/Hide header rows',
          changeSummary:
            'There is now an easy way to maximize editing UI area. There is a small ︽ or ︾ icon at the top-right of the main page area. Click this, or use the alt-shift-H shortcut to hide/show the top rows of the UI.',
          otherUrls: [],
        },
        {
          featureTag: 'nav.layout',
          type: 'improvement',
          changeName: 'Improved network-offline message',
          changeSummary:
            'It is now an overlay so there is less flicker during intermittent connection issues',
          otherUrls: [],
        },
      ],
    },

    {
      timestamp: 'Wed Jun 21 2017 17:00:00 GMT-0700 (PDT)',

      id: {
        ver: '0.2.0',
        state: 'Beta',
        iteration: '4452',
      },

      releaseManagement: {
        eng: 'dgolds',
      },

      changes: [
        {
          featureTag: 'asset.code',
          type: 'feature',
          changeName: 'Import Assistant',
          changeSummary:
            "We revamped the Import Helper in the Code Editor and it's now a top-level assistant. It has collapsible help to explain what JS imports are, and it has a nifty auto-detect-and-explain tag for react, phaser and lodash package imports.",
          otherUrls: [],
        },
        {
          featureTag: 'flexpanel.asset',
          type: 'improvement',
          changeName: 'Asset flexpanel asset-kinds-selection',
          changeSummary:
            'The Asset flexpanel has a nicer asset-kinds selection UI now. Less text, and proper toggles for on/off for filtering a single asset kind. alt-click to multi-select still works.',
          otherUrls: [],
        },
        {
          featureTag: 'bugfix',
          type: 'bugfix',
          changeName: 'A bunch of bugfixes/tweaks',
          changeSummary:
            'Fixed actormap play preview bug with arrow keys; improved Code EDitor Import Assistant more; removed Flexpanel headers for prettiness; Cleaned up BIO area in Profile.',
          otherUrls: [],
        },
      ],
    },

    {
      timestamp: 'Tue Jun 20 2017 15:30:00 GMT-0700 (PDT)',

      id: {
        ver: '0.2.0',
        state: 'Beta',
        iteration: '4428',
      },

      releaseManagement: {
        eng: 'dgolds',
      },

      changes: [
        {
          featureTag: 'chat.flagging',
          type: 'feature',
          changeName: 'Flaging/Moderation for chats',
          changeSummary:
            'There is now a hover-option in chats to flag a chat message for Moderator attention. The system will be expanded to assets, projects etc soon.',
          otherUrls: [],
        },
        {
          featureTag: 'asset.map',
          type: 'improvement',
          changeName: 'Map Editor has an improved properties panel and scale-fit',
          changeSummary:
            'The properties panel for the Map editor is easier to use now. The actiorMap and Map editors now have a scale-to-fit option.',
          otherUrls: [],
        },
        {
          featureTag: 'bugfix',
          type: 'bugfix',
          changeName: 'A bunch of bugfixes/tweaks',
          changeSummary:
            'Fixed a bug @jaketor reported about graphic edit grid needing a redraw; Fixed some cases that prevented CodeMentor updating; Added visible area indicator to graphic edit preview.',
          otherUrls: [],
        },
      ],
    },

    {
      timestamp: 'Sun Jun 18 2017 10:30:00 GMT-0700 (PDT)',

      id: {
        ver: '0.2.0',
        state: 'Beta',
        iteration: '4395',
      },

      releaseManagement: {
        eng: 'dgolds',
      },

      changes: [
        {
          featureTag: 'bugfix',
          type: 'bugfix',
          changeName: 'A bunch of bugfixes/tweaks',
          changeSummary:
            'Fixed a problem that was preventing forgot-password mail from sending. Improved the "Import Helper" in the Code Editor',
          otherUrls: [],
        },
      ],
    },

    {
      timestamp: 'Sat Jun 17 2017 11:30:00 GMT-0700 (PDT)',

      id: {
        ver: '0.2.0',
        state: 'Beta',
        iteration: '4389',
      },

      releaseManagement: {
        eng: 'dgolds',
      },

      changes: [
        {
          featureTag: 'bugfix',
          type: 'bugfix',
          changeName: 'A bunch of bugfixes/tweaks',
          changeSummary:
            'Fixed the last of the disappearing-pixel bugs in Graphic Editor. Fixed an iPad sound bug. Added more map view modes to Map Editor. Updated to use latest SUIR UI framework.',
          otherUrls: [],
        },
      ],
    },

    {
      timestamp: 'Wed Jun 14 2017 22:30:00 GMT-0700 (PDT)',

      id: {
        ver: '0.2.0',
        state: 'Beta',
        iteration: '4373',
      },

      releaseManagement: {
        eng: 'dgolds',
      },

      changes: [
        {
          featureTag: 'asset.graphic',
          type: 'improvement',
          changeName: 'Graphic editor - Color palette changes',
          changeSummary:
            'Color palette remembers last 24 selected/picked colors. Also, if you click the color icon, it will pin the color picker in place. Click it again to remove it. The color-hover picker still works as before. ',
          otherUrls: [],
        },
        {
          featureTag: 'asset.graphic',
          type: 'improvement',
          changeName: 'Graphic editor - Layout improvements',
          changeSummary:
            'Rearranged tools and preview map to be a bit more space-efficient. There is an improved Drawing status line which can be hidden using the bullseye icon in the Views options. Also the preview map can be dragged around more of the screen area than before',
          otherUrls: [],
        },
        {
          featureTag: 'bugfix',
          type: 'bugfix',
          changeName: 'A bunch of bugfixes/tweaks',
          changeSummary: 'More fixes for Actormap games and the actormap editor.',
          otherUrls: [],
        },
      ],
    },

    {
      timestamp: 'Mon Jun 12 2017 11:00:00 GMT-0700 (PDT)',

      id: {
        ver: '0.2.0',
        state: 'Beta',
        iteration: '4348',
      },

      releaseManagement: {
        eng: 'dgolds',
      },

      changes: [
        {
          featureTag: 'asset.graphic',
          type: 'improvement',
          changeName: 'Graphic editor - Color Palette',
          changeSummary:
            'Color palette feature is coming. For now it has presets, but a way to change these will be available soon. ',
          otherUrls: [],
        },
        {
          featureTag: 'bugfix',
          type: 'bugfix',
          changeName: 'A bunch of bugfixes/tweaks',
          changeSummary:
            'Fixed the first-draw problem with the minimap. Made the last getting-started tutorial easier to follow. Fixed some typos.',
          otherUrls: [],
        },
      ],
    },

    {
      timestamp: 'Mon Jun 12 2017 01:45:00 GMT-0700 (PDT)',

      id: {
        ver: '0.2.0',
        state: 'Beta',
        iteration: '4339',
      },

      releaseManagement: {
        eng: 'dgolds',
      },

      changes: [
        {
          featureTag: 'asset.graphic',
          type: 'improvement',
          changeName: 'Graphic editor tweaks',
          changeSummary:
            'Graphic editor is faster; the disappearing-first-few-pixels bug has finally been resolved!',
          otherUrls: [],
        },
        {
          featureTag: 'bugfix',
          type: 'bugfix',
          changeName: 'A bunch of bugfixes/tweaks',
          changeSummary:
            'Bio area on Profile is nicer. Mobile phone screen widths are now correct. Create New Asset in no-project is faster (and can no longer stall the asset edit loaders). ',
          otherUrls: [],
        },
      ],
    },

    {
      timestamp: 'Sat Jun 10 2017 19:39:54 GMT-0700 (PDT)',

      id: {
        ver: '0.2.0',
        state: 'Beta',
        iteration: '4328',
      },

      releaseManagement: {
        eng: 'dgolds',
      },

      changes: [
        {
          featureTag: 'flexpanel.chat',
          type: 'improvement',
          changeName: 'Chat @mentions are now profile links',
          changeSummary:
            "Type a @username like @dgolds in chat and the message will render as a link to the user's profile",
          otherUrls: [],
        },
        {
          featureTag: 'moderation.chat',
          type: 'improvement',
          changeName: 'Chat moderation warns about censored text instead of ***ing it',
          changeSummary:
            'The swearjar system nows warns users about phrases rather than sharing the message with certain stuff bleeped out. This seems better.',
          otherUrls: [],
        },
        {
          featureTag: 'game.play',
          type: 'improvement',
          changeName: 'Touch controller overlay for actorMap games',
          changeSummary:
            'On touch devices, we provide an optional overlay to use the games without a keypad/keyboard. This now resizes more sensibly than before.',
          otherUrls: [],
        },
        {
          featureTag: 'nav.ui',
          type: 'improvement',
          changeName: 'UI cleanup (in progress)',
          changeSummary:
            'Lightened the style for the main page area. FlexPanel area is next!   Re-arranged the user profile area a bit (but it still needs work).  Created a new, smaller userItem control and we use that now in some user lists (flexpanel, project members, colleagues etc).',
          otherUrls: [],
        },
      ],
    },

    {
      timestamp: 'Tue Jun 06 2017 04:45 GMT-0700 (PDT)',

      id: {
        ver: '0.2.0',
        state: 'Beta',
        iteration: '4300',
      },

      releaseManagement: {
        eng: 'dgolds',
      },

      changes: [
        {
          featureTag: 'game.actormap',
          type: 'improvement',
          changeName: 'ActorMap game improvements',
          changeSummary:
            'The buttons for the actorMap game player have been simplified and have better help text. Frame rate is now locked to 30fps. Fixed bug with melee repeat modifier',
          otherUrls: [],
        },
        {
          featureTag: 'asset.code',
          type: 'improvement',
          changeName: 'Code Splitting',
          changeSummary:
            'The Code Editor is now also dynamically loaded, further reducing initial page load times',
          otherUrls: [],
        },
      ],
    },

    {
      timestamp: 'Sat Jun 03 2017 00:30 GMT-0700 (PDT)',

      id: {
        ver: '0.2.0',
        state: 'Beta',
        iteration: '4284',
      },

      releaseManagement: {
        eng: 'dgolds',
      },

      changes: [
        {
          featureTag: 'asset.graphic',
          type: 'improvement',
          changeName: 'Minimap improvement in Graphic Editor',
          changeSummary:
            "The graphic editor 'minimap' does not take so much space now, and scales down for very large images.",
          otherUrls: [],
        },
        {
          featureTag: 'asset.graphic',
          type: 'improvement',
          changeName: 'Code Splitting',
          changeSummary:
            'The site has been split into multiple dynamically loadable modules, so initial pages load faster. Currently all the asset editors except the code editor will load-on-demand, and more areas of the product will be chnaged to load dynamically soon',
          otherUrls: [],
        },
        {
          featureTag: 'bugfix',
          type: 'bugfix',
          changeName: 'A bunch of bugfixes/tweaks',
          changeSummary:
            'bugfix for Actors/ActorMaps with Melee weapons; homepage ui cleanup; Update to latest build system to enable code splitting in later releases. Fix for audio/music editors not loading',
          otherUrls: [],
        },
      ],
    },

    {
      timestamp: 'Wed May 31 2017 00:45 GMT-0700 (PDT)',

      id: {
        ver: '0.2.0',
        state: 'Beta',
        iteration: '4256',
      },

      releaseManagement: {
        eng: 'dgolds',
      },

      changes: [
        {
          featureTag: 'nav.badges',
          type: 'feature',
          changeName: 'Badge holders',
          changeSummary: 'It is now possible to see which users have a specific badge.',
          otherUrls: [],
        },
        {
          featureTag: 'bugfix',
          type: 'bugfix',
          changeName: 'A bunch of bugfixes/tweaks',
          changeSummary:
            'Cleanup up signup/login pages to fix autocomplete issues and add an image next to signup; fixed some actormap logic bugs with weapons; ',
          otherUrls: [],
        },
      ],
    },

    {
      timestamp: 'Sat May 27 2017 23:15 GMT-0700 (PDT)',

      id: {
        ver: '0.2.0',
        state: 'Beta',
        iteration: '4243',
      },

      releaseManagement: {
        eng: 'dgolds',
      },

      changes: [
        {
          featureTag: 'edit.graphic.minimap',
          type: 'feature',
          changeName: 'Preview animations',
          changeSummary:
            'Feature suggested by @Zaqory - preview just the named animation changes. Now clicking on the animation name in the graphic editor will start/stop the animation preview - but just for the frames within that animation.',
          otherUrls: [],
        },
        {
          featureTag: 'bugfix',
          type: 'bugfix',
          changeName: 'A bunch of bugfixes/tweaks',
          changeSummary:
            "More badges (and users are now sorted by badge count)! Fixed respawn/persist bug with actorMap games; reduced JS download size by 10%; Fixed bug reported by @Zaqory with actors using frames within graphics for animations; removed the 'Network flexPanel and instead moved the reconnect-now functionality to the main no-network message bar that is shown when offline; added server support for the upcoming mobile apps to connect via CDN; Fixed issue where drawing would get interrupted every 12 seconds by a chat-unreads check",
          otherUrls: [],
        },
      ],
    },

    {
      timestamp: 'Thu May 25 2017 14:10 GMT-0700 (PDT)',

      id: {
        ver: '0.2.0',
        state: 'Beta',
        iteration: '4223',
      },

      releaseManagement: {
        eng: 'dgolds',
      },

      changes: [
        {
          featureTag: 'edit.graphic.minimap',
          type: 'feature',
          changeName: 'New MiniMap 1x graphic preview for graphic editor',
          changeSummary:
            "The graphic editor now has an extra 'MiniMap' button. When clicked, this will show a draggable preview of the current frame at 1x resolution. The preview miniMap can also (optionally) show the current frame tessellated (in a 3x3 grid of itself).",
          otherUrls: [],
        },
        {
          featureTag: 'bugfix',
          type: 'bugfix',
          changeName: 'A bunch of bugfixes/tweaks',
          changeSummary:
            "Hid last getStarted tutorial which didn't actually do anything; Forking assets now clears the 'loved' entries from the new assets; Fixed one of the gettingStarted tutorials (#16) that was getting stuck",
          otherUrls: [],
        },
      ],
    },

    // ,
    // Older history has been moved to ${olderHistoryPath} in order to reduce js size
    // But at least the most recent should be in this file.
    // See notes in main_server.js for how to more to ${olderHistoryPath} as JSON
  ],
}

export const getReleaseVersionString = id => `${id.ver} ${id.state} ${id.iteration}`
export const getCurrentReleaseVersionString = () => getReleaseVersionString(mgbReleaseInfo.releases[0].id)

export default mgbReleaseInfo
