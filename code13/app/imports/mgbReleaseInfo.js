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
      timestamp: 'Friday May 04 2018 09:00:00 GMT-0800 (PST)',

      id: {
        ver: '0.4.5',
        state: 'Beta',
        iteration: '5075',
      },

      releaseManagement: {
        eng: 'Bouhm',
      },

      changes: [
        {
          featureTag: 'bugfix',
          type: 'bugfix',
          changeName: 'Fix modal popup issues',
          changeSummary: 'Modals not popping up for Graphic and Music imports have been fixed.',
          otherUrls: [],
        },
        {
          type: 'improvement',
          changeName: 'New Code Tutorial Flow',
          changeSummary:
            'Many experimental changes have been made to the code tutorial flows, one of which combines JS and Phaser tutorials.',
          otherUrls: [],
        },
        {
          featureTag: 'nav.layout',
          type: 'improvement',
          changeName: 'Code Editor UI Improvement',
          changeSummary:
            'Many changes have been made to the Code Editor to better utilize the space next to the code editor.',
          otherUrls: [],
        },
        {
          type: 'improvement',
          changeName: 'Phaser3 libs',
          changeSummary: 'Phaser3 has been added as an option for import. This is still experimental.',
          otherUrls: [],
        },
      ],
    },
    {
      timestamp: 'Tue Feb 13 2018 09:00:00 GMT-0800 (PST)',

      id: {
        ver: '0.4.4',
        state: 'Beta',
        iteration: '5013',
      },

      releaseManagement: {
        eng: 'levithomason',
      },

      changes: [
        {
          featureTag: 'bugfix',
          type: 'bugfix',
          changeName: 'Fix tutorial looping issue',
          changeSummary:
            'Tutorials sometimes did not award skills and required repeating.  This has been fixed.',
          otherUrls: [],
        },
      ],
    },
    {
      timestamp: 'Tue Feb 06 2018 16:20:00 GMT-0800 (PST)',

      id: {
        ver: '0.4.3',
        state: 'Beta',
        iteration: '5010',
      },

      releaseManagement: {
        eng: 'levithomason',
      },

      changes: [
        {
          type: 'improvement',
          changeName: 'New Tutorial Experience',
          changeSummary: 'The workflow and presentation of tutorials has been vastly improved, try them out!',
          otherUrls: [],
        },
        {
          type: 'improvement',
          changeName: 'Notifications & Activity Feeds',
          changeSummary:
            'Notifications and Activity feeds have been improved throughout the app.  Find them in top nav bar, projects, and user profiles.',
          otherUrls: [],
        },
        {
          featureTag: 'bugfix',
          type: 'bugfix',
          changeName: 'A bunch of bugfixes/tweaks',
          changeSummary: 'Lots of minor bug fixes and usability updates throughout the system.',
          otherUrls: [],
        },
      ],
    },
    {
      timestamp: 'Mon Jan 08 2018 09:15:00 GMT-0800 (PST)',

      id: {
        ver: '0.4.2',
        state: 'Beta',
        iteration: '4996',
      },

      releaseManagement: {
        eng: 'levithomason',
      },

      changes: [
        {
          type: 'improvement',
          changeName: 'Template Projects and Assets',
          changeSummary: 'You can now create projects and assets quickly using our starter templates.',
          otherUrls: [],
        },
        {
          type: 'improvement',
          changeName: 'Prevent bots from signing up',
          changeSummary: 'Added Recaptcha to the signup form.',
          otherUrls: [],
        },
        {
          featureTag: 'bugfix',
          type: 'bugfix',
          changeName: 'A bunch of bugfixes/tweaks',
          changeSummary: 'Lots of minor bug fixes and usability updates throughout the system.',
          otherUrls: [],
        },
      ],
    },
    {
      timestamp: 'Thu Dec 07 2017 12:30:00 GMT-0800 (PST)',

      id: {
        ver: '0.4.1',
        state: 'Beta',
        iteration: '4977',
      },

      releaseManagement: {
        eng: 'levithomason',
      },

      changes: [
        {
          type: 'bugfix',
          changeName: 'Hour of Code Loading',
          changeSummary: 'Fix bug when loading the hour of code activity while not logged in.',
          otherUrls: [],
        },
        {
          featureTag: 'bugfix',
          type: 'bugfix',
          changeName: 'A bunch of bugfixes/tweaks',
          changeSummary: 'Lots of minor bug fixes and usability updates throughout the system.',
          otherUrls: [],
        },
      ],
    },
    {
      timestamp: 'Fri Dec 01 2017 08:30:00 GMT-0800 (PST)',

      id: {
        ver: '0.4.0',
        state: 'Beta',
        iteration: '4968',
      },

      releaseManagement: {
        eng: 'levithomason',
      },

      changes: [
        {
          type: 'improvement',
          changeName: 'Hour of Code Performance',
          changeSummary: 'Remove project creation from The Hour of Code activity.',
          otherUrls: [],
        },
        {
          type: 'improvement',
          changeName: 'Performance',
          changeSummary: 'Queries were improved to help with site performance.',
          otherUrls: [],
        },
      ],
    },
    {
      timestamp: 'Thu Nov 30 2017 14:00:00 GMT-0800 (PST)',

      id: {
        ver: '0.3.9',
        state: 'Beta',
        iteration: '4965',
      },

      releaseManagement: {
        eng: 'levithomason',
      },

      changes: [
        {
          type: 'improvement',
          changeName: 'Hour of Code Improvements',
          changeSummary:
            'Video explanations before each level. A button to exit. Hiding user assets from the main site.  And much more....',
          otherUrls: [],
        },
        {
          featureTag: 'bugfix',
          type: 'bugfix',
          changeName: 'A bunch of bugfixes/tweaks',
          changeSummary: 'Lots of minor bug fixes and usability updates throughout the system.',
          otherUrls: [],
        },
      ],
    },
    {
      timestamp: 'Mon Nov 27 2017 14:30:00 GMT-0800 (PST)',

      id: {
        ver: '0.3.8',
        state: 'Beta',
        iteration: '4953',
      },

      releaseManagement: {
        eng: 'levithomason',
      },

      changes: [
        {
          type: 'improvement',
          changeName: 'Hour of Code Improvements',
          changeSummary: 'This release includes many fixes and improvements to the Hour of Code experience.',
          otherUrls: [],
        },
        {
          featureTag: 'bugfix',
          type: 'bugfix',
          changeName: 'A bunch of bugfixes/tweaks',
          changeSummary: 'Lots of minor bug fixes and usability updates throughout the system.',
          otherUrls: [],
        },
      ],
    },
    {
      timestamp: 'Wed Nov 22 2017 10:45:00 GMT-0800 (PST)',

      id: {
        ver: '0.3.7',
        state: 'Beta',
        iteration: '4943',
      },

      releaseManagement: {
        eng: 'levithomason',
      },

      changes: [
        {
          type: 'improvement',
          changeName: 'Activity Feed',
          changeSummary: 'The Activity flex panel now displays more relevant activity updates.',
          otherUrls: [],
        },
        {
          type: 'improvement',
          changeName: 'Hour of Code Improvements',
          changeSummary:
            'Add recaptcha, more game controls, code editor autocomplete, hints, a better UI and more.',
          otherUrls: [],
        },
        {
          featureTag: 'bugfix',
          type: 'bugfix',
          changeName: 'A bunch of bugfixes/tweaks',
          changeSummary: 'Lots of minor bug fixes and usability updates throughout the system.',
          otherUrls: [],
        },
      ],
    },
    {
      timestamp: 'Tue Nov 09 2017 15:40:00 GMT-0800 (PST)',

      id: {
        ver: '0.3.6',
        state: 'Beta',
        iteration: '4912',
      },

      releaseManagement: {
        eng: 'levithomason',
      },

      changes: [
        {
          type: 'improvement',
          changeName: 'Hour of Code Save Progress',
          changeSummary: 'Guests can now save their progress by submitting their email address.',
          otherUrls: [],
        },
        {
          type: 'improvement',
          changeName: 'Hour of Code Timer',
          changeSummary: 'The activity now has a one hour completion and congratulations timer.',
          otherUrls: [],
        },
        {
          type: 'bugfix',
          changeName: 'Hour of Code Guests',
          changeSummary: 'Fix duplicate guest creation.',
          otherUrls: [],
        },
      ],
    },
    {
      timestamp: 'Tue Nov 07 2017 15:40:00 GMT-0800 (PST)',

      id: {
        ver: '0.3.5',
        state: 'Beta',
        iteration: '4909',
      },

      releaseManagement: {
        eng: 'levithomason',
      },

      changes: [
        {
          type: 'improvement',
          changeName: 'Hour of Code Loop Syntax',
          changeSummary: "We've added simplified `loop() { ... }` syntax to the Hour of Code activity.",
          otherUrls: [],
        },
        {
          type: 'improvement',
          changeName: 'Hour of Code Loop Save Progress',
          changeSummary: 'Guest users can now enter their email address to save their progress.',
          otherUrls: [],
        },
        {
          type: 'bugfix',
          changeName: 'User Avatar Images',
          changeSummary: 'Resolved a bug with displaying and changing user avatars.',
          otherUrls: [],
        },
      ],
    },
    {
      timestamp: 'Fri Nov 03 2017 17:45:00 GMT-0700 (PDT)',

      id: {
        ver: '0.3.4',
        state: 'Beta',
        iteration: '4903',
      },

      releaseManagement: {
        eng: 'levithomason',
      },

      changes: [
        {
          type: 'feature',
          changeName: 'Hour of Code',
          changeSummary:
            "We've been hard at work creating an experience for Hour of Code 2017.  This release includes a beta version, on a hidden link :) If you'd like to test it out and give feedback, let us know in Chat!  We'll make a formal announcement soon.",
          otherUrls: [],
        },
        {
          type: 'improvement',
          changeName: 'Use dark Code Editor theme',
          changeSummary: 'Our code editor theme is now set to a dark theme, Monokai.',
          otherUrls: [],
        },
        {
          type: 'improvement',
          changeName: 'Remove scrollbars in code runner',
          changeSummary: 'Phaser canvases now load at full resolution with no scrollbars.',
          otherUrls: [],
        },
        {
          type: 'bugfix',
          changeName: 'Clear Graphic Editor frames during animation.',
          changeSummary: 'Transparency layers were fixed in animations in the Graphic Editor',
          otherUrls: [],
        },
        {
          type: 'bugfix',
          changeName: 'Remove circular Code Challenge issue',
          changeSummary:
            'Code Challenges would sometimes "reset" your progress, requiring you to complete challenges twice.',
          otherUrls: [],
        },
        {
          featureTag: 'bugfix',
          type: 'bugfix',
          changeName: 'A bunch of bugfixes/tweaks',
          changeSummary: 'Lots of minor bug fixes and usability updates throughout the system.',
          otherUrls: [],
        },
      ],
    },
    {
      timestamp: 'Mon Oct 10 2017 09:30:00 GMT-0700 (PDT)',

      id: {
        ver: '0.3.3',
        state: 'Beta',
        iteration: '4867',
      },

      releaseManagement: {
        eng: 'levithomason',
      },

      changes: [
        {
          type: 'improvement',
          changeName: 'More Related Assets',
          changeSummary: 'We improved the number of related assets that are fetched in the list.',
          otherUrls: [],
        },
        {
          type: 'improvement',
          changeName: 'Actor Maps',
          changeSummary: 'We improved the speed and usability of the Actor Map editor.',
          otherUrls: [],
        },
        {
          type: 'improvement',
          changeName: 'Faster Dashboard and Home',
          changeSummary: 'We implemented caching techniques to improve the page load times.',
          otherUrls: [],
        },
        {
          type: 'bugfix',
          changeName: 'Award Honorable Initiate Badge',
          changeSummary:
            "In some cases, the Honorable Initiate Badge was not awarded when it should have been.  The next time you complete a tutorial, it will be awarded if you've earned it.",
          otherUrls: [],
        },
        {
          type: 'bugfix',
          changeName: 'Missing Code Skills',
          changeSummary: 'You may have noticed some of your code skills were missing, they are back now!',
          otherUrls: [],
        },
        {
          type: 'bugfix',
          changeName: 'A bunch of bugfixes/tweaks',
          changeSummary: 'We fixed bugs and usability issues across the entire system.',
          otherUrls: [],
        },
      ],
    },
    {
      timestamp: 'Tue Sep 26 2017 12:30:00 GMT-0700 (PDT)',

      id: {
        ver: '0.3.2',
        state: 'Beta',
        iteration: '4855',
      },

      releaseManagement: {
        eng: 'levithomason',
      },

      changes: [
        {
          type: 'improvement',
          changeName: 'Improved Signup and Login forms',
          changeSummary:
            'Improved the validation speed and experience.  Clarified how "Username" will be used in the system.',
          otherUrls: [],
        },
        {
          type: 'improvement',
          changeName: 'Contact us at hello@mygamebuilder.com',
          changeSummary: 'Updated Contact Us to use our new email, hello@mygamebuilder.com.',
          otherUrls: [],
        },
        {
          type: 'improvement',
          changeName: 'Skills progress bar component',
          changeSummary:
            'Fixed broken Get Started progress bar style.  Removed the ability to "forget" (un-learn) a skill.  Improved the UX/UI of the Skills progress bar in /learn routes.',
          otherUrls: [],
        },
        {
          type: 'bugfix',
          changeName: 'Fixed missing ActorMap thumbnails',
          changeSummary:
            'The ActorMap had a bug where dragging and dropping a Graphic Asset onto an Actor did not update the thumbnail.  Now it does.',
          otherUrls: [],
        },
      ],
    },
    {
      timestamp: 'Mon Sep 18 2017 10:45:00 GMT-0700 (PDT)',

      id: {
        ver: '0.3.1',
        state: 'Beta',
        iteration: '4844',
      },

      releaseManagement: {
        eng: 'levithomason',
      },

      changes: [
        {
          type: 'improvement',
          changeName: 'Standardize terminology and navigation',
          changeSummary: 'Terminology and navigation names were normalized and updated throughout the app.',
          otherUrls: [],
        },
        {
          type: 'improvement',
          changeName: 'Beautiful landing page social posts',
          changeSummary:
            'https://build.games now looks great in social posts.  Try it out on Twitter and Facebook!',
          otherUrls: [],
        },
        {
          type: 'bugfix',
          changeName: 'Code Editor hot reload',
          changeSummary:
            'Fixed a bug where global variables declared in an import were undefined in following imports.',
          otherUrls: [],
        },
        {
          type: 'bugfix',
          changeName: 'Map Editor tile ids readout',
          changeSummary: 'Fixed Map Editor bug where all tile ids would be drawn on the screen.',
          otherUrls: [],
        },
        {
          type: 'bugfix',
          changeName: 'Create Project Badge',
          changeSummary:
            'This badge was not awarded when it should have been.  It will now be awarded properly the next time you are awarded a badge.',
          otherUrls: [],
        },
      ],
    },
    {
      timestamp: 'Wed Sep 13 2017 13:05:00 GMT-0700 (PDT)',

      id: {
        ver: '0.3.0',
        state: 'Beta',
        iteration: '4837',
      },

      releaseManagement: {
        eng: 'levithomason',
      },

      summary:
        "It's been a while!  We've been working hard on a big release for you :) With this large update done, you can expect us to return to our more rapid release schedule.",

      changes: [
        {
          type: 'feature',
          changeName: 'Dashboard',
          changeSummary: 'Your shiny new Dashboard will help you focus on what is important.',
          otherUrls: [
            {
              txt: 'Dashboard',
              href: '/dashboard',
            },
          ],
        },
        {
          type: 'improvement',
          changeName: 'New UI',
          changeSummary:
            "We've updated the look and feel of the entire app, along with several usability improvements.",
          otherUrls: [],
        },
        {
          type: 'improvement',
          changeName: 'Better code tutorial pacing',
          changeSummary:
            'We\'ve made it easier and quicker for you to get on to making games. We\'ve broken down code tutorials into two sections. The "Intro to Coding" section gives you just what you need to move on to game development concepts. We\'ve moved everything else into the "Advanced Coding" section, out of your way.',
          otherUrls: [
            { txt: 'Learn Code', href: '/learn/code' },
            { txt: 'Intro to Coding', href: '/learn/code/intro' },
            { txt: 'Advanced Coding', href: '/learn/code/advanced' },
          ],
        },
        {
          type: 'bugfix',
          changeName: 'A bunch of bugfixes/tweaks',
          changeSummary: 'We fixed bugs and usability issues across the entire system.',
          otherUrls: [],
        },
      ],
    },
    {
      timestamp: 'Wed Jul 26 2017 13:20:00 GMT-0700 (PDT)',

      id: {
        ver: '0.2.1',
        state: 'Beta',
        iteration: '4746',
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
            "It's been a week of lots of bugfixes and code cleanups. Lots and lots of little changes and fixes around the editors, and improvements for switching between assets",
          otherUrls: [],
        },
      ],
    },

    {
      timestamp: 'Tue Jul 18 2017 17:30:00 GMT-0700 (PDT)',

      id: {
        ver: '0.2.1',
        state: 'Beta',
        iteration: '4655',
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
          changeSummary:
            'Fixed some issues with Items in ActorMap games. More build automation. Improved chat tutorial.',
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
