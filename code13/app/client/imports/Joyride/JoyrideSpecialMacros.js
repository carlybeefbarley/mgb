import _ from 'lodash'
import React from 'react'

// This code is used by the Joyride/Tutorial systems to make it easier to write tutorials.
//
//   transformStep() expands macros in a 'step' that is part of a Joyride step
//   stepKeyOptionsForDropdown[] contains stepMacroNames (and descriptions) for use in a Dropdown etc

const _wrapKey = key => `%${key}%`
const _looksLikeMacroKey = key => _.isString(key) && key.length > 2 && key.search(/^%.*%$/) !== -1
const _fullStepField = null // This is returned in notFoundMacros[].field results for a step macro

/* These enable Tutorial steps to be written using macros:   e.g.

  {
    "steps": [
      "%flexPanel%",
      "%fp-learn%",
    ...
  }

*/

// Style: Use %inverted% for any step requiring user action (mostly with awaitCompletionTag)

// Helper which makes an array of NavPanel stepMacro: e.g. _mkNp( 'learn', 'student' )
const _mkNavPanelMacros = () => {
  const currUser = Meteor.user()
  const username = currUser && currUser.username
  const np = {
    left: [
      {
        name: 'mgb',
        explainClickAction: 'Clicking here jumps to the Home Page',
        to: '/',
        menu: [
          {
            jrkey: 'whatsNew', // used for mgjr-np-mgb-{jrkey} id generation for joyride system
            explainClickAction: "What's New",
            to: '/whats-new',
          },
          {
            jrkey: 'roadmap',
            to: '/roadmap',
          },
        ],
      },
      {
        name: 'learn',
        explainClickAction: 'Clicking here jumps to the Learning Paths page',
        hideInIconView: true, // For top-level, items, use
        to: '/learn',
        menu: [
          {
            jrkey: 'getStarted',
            to: '/learn/get-started',
          },
          {
            jrkey: 'learnCode',
            to: '/learn/code',
          },
          {
            jrkey: 'learnSkills',
            to: '/learn/skills',
          },
        ],
      },
      {
        name: 'play',
        explainClickAction: 'Clicking here jumps to the list of playable games',
        to: '/games',
        menu: [
          {
            jrkey: 'lovedGames',
            to: '/games',
            query: { sort: 'loves' },
          },
          {
            jrkey: 'popularGames',
            to: '/games',
            query: { sort: 'plays' },
          },
          {
            jrkey: 'updatedGames',
            to: '/games',
            query: { sort: 'edited' },
          },
        ],
      },
      {
        name: 'meet',
        explainClickAction: 'Clicking here jumps to the User search page',
        to: '/users',
        menu: [
          {
            jrkey: 'allUsers',
            to: '/users',
          },
          {
            jrkey: 'publicChat',
            query: { _fp: 'chat.G_GENERAL_' },
          },
        ],
      },
    ],
    // Right side
    right: _.compact([
      {
        name: 'projects',
        explainClickAction: 'Clicking here jumps to the list of your Projects',
        to: `/u/${username}/projects`,
        menu: [
          {
            jrkey: 'listMy',
            to: `/u/${username}/projects`,
          },
          {
            jrkey: 'allProjects',
            to: '/projects',
          },
          {
            jrkey: 'importMgb1',
            to: `/u/${username}/projects/import/mgb1`,
          },
          {
            jrkey: 'createNew',
            to: `/u/${username}/projects/create`,
          },
        ],
      },
      {
        name: 'assets',
        explainClickAction: 'Clicking here jumps to the list of your Assets',
        to: `/u/${username}/assets`,
        menu: [
          {
            jrkey: 'listMy',
            to: `/u/${username}/assets`,
          },
          {
            jrkey: 'allAssets',
            to: '/assets',
          },
          {
            jrkey: 'listMyChallenge',
            to: `/u/${username}/assets`,
            query: { showChallengeAssets: '1', view: 's' },
          },
          {
            jrkey: 'createNew',
            to: `/assets/create`,
          },
          {
            jrkey: 'createFromTemplate',
            to: `/assets/create-from-template`,
          },
        ],
      },
      {
        name: 'dashboard',
        explainClickAction: 'Clicking here jumps to the Learning Paths page',
        to: `/dashboard`,
        jrkey: 'dashboard',
      },
      {
        name: 'notifications',
        explainClickAction: 'Shortcut: Clicking here jumps to your notifications',
        to: `/notifications`,
        jrkey: 'notifications',

        menu: [
          {
            jrkey: 'notificationsHeader',
          },
        ],
      },
      {
        name: 'user',
        explainClickAction: 'Clicking here jumps to your Profile Page', // if logged in, and this is used by tutorials, so that's ok
        to: `/u/${username}`,
        menu: [
          {
            jrkey: 'username',
          },
          {
            to: `/u/${username}`,
            jrkey: 'myProfile',
          },
          {
            to: `/u/${username}/badges`,
            jrkey: 'myBadges',
          },
          {
            to: `/u/${username}/games`,
            jrkey: 'myGames',
          },
          {
            to: `/u/${username}/skilltree`,
            jrkey: 'mySkills',
          },
          {
            jrkey: 'logout',
          },
        ],
      },
      {
        name: 'login',
        to: '/login',
      },
      {
        name: 'signup',
        to: '/signup',
      },
    ]),
  }

  const retval = []
  const parseDropdown = (dd, position) => {
    const ddUpName = _.upperFirst(dd.name)
    // 1. The Top Menu to find (as a click action)
    retval.push({
      key: _wrapKey(`np-${dd.name}`),
      hint: `${_.upperFirst(dd.name)} Menu`,
      desc: `Step for clicking the ${ddUpName} Menu`,
      newVal: {
        title: `Click the ${ddUpName} menu header`,
        text: dd.explainClickAction,
        selector: `#mgbjr-np-${dd.name}`,
        showStepOverlay: true,
        skipIfUrlAt: dd.to,
        awaitCompletionTag: `mgbjr-CT-np-${dd.name}`,
        position,
        style: '%inverted%',
      },
    })
    // 2. Each of the options in the Menu DropDown
    _.each(dd.menu, item => {
      const smText = _.isString(item.content) ? item.content : item.explainClickAction || item.jrkey // hacky
      retval.push({
        key: _wrapKey(`np-${dd.name}-${item.jrkey}`),
        hint: `${_.upperFirst(smText)} Menu`,
        desc: `Step for finding the ${smText} menu`,
        newVal: {
          title: `Go to the ${smText} page`,
          text: `Hover on the "${_.startCase(ddUpName)}" menu and click "${_.startCase(smText)}".`,
          selector: `#mgbjr-np-${dd.name}-${item.jrkey},#mgbjr-np-${dd.name}`, // Note the  comma  which allows multiple selectors, in descending preference
          showStepOverlay: true,
          skipIfUrlAt: item.to,
          awaitCompletionTag: `mgbjr-CT-np-${dd.name}-${item.jrkey}`,
          position,
          style: '%inverted%',
        },
      })
    })
  }

  _.each(np.left, dd => parseDropdown(dd, 'right'))
  _.each(np.right, dd => parseDropdown(dd, 'left'))

  return retval
}

// Helper which makes a FlexPanel stepMacro: e.g. _mkNp( 'learn', 'student' ) is %fp-learn%
const _mkFp = (fpname, icon) => ({
  key: _wrapKey(`fp-${fpname}`),
  hint: `${_.upperFirst(fpname)} FlexPanel`,
  desc: `Step for finding the ${_.upperFirst(fpname)} FlexPanel`,
  newVal: {
    title: `The ${fpname.toUpperCase()} FlexPanel`,
    text: `Click on the  <i class='ui inverted bordered ${icon} icon'></i> <strong>${fpname.toUpperCase()}</strong> button here`,
    selector: `#mgbjr-flexPanelIcons-${fpname}`,
    showStepOverlay: true,
    awaitCompletionTag: `mgbjr-CT-flexPanel-${fpname}-show`,
    position: 'left',
    style: '%inverted%', // Note that full Step Macros can still use per-field macros :)
  },
})

// Helper which makes a FlexPanel Descrine stepMacro: e.g. _mkNp( 'learn', 'student', 'some text' ) is %fp-learn-describe%
const _mkFpDescribe = (fpname, icon, describeText) => ({
  key: _wrapKey(`fp-${fpname}-describe`),
  hint: `${fpname.toUpperCase()} FlexPanel`,
  desc: `Step for finding the <strong>${fpname.toUpperCase()}</strong> FlexPanel`,
  newVal: {
    title: `The ${fpname.toUpperCase()} FlexPanel`,
    text: `${describeText}. <br></br>Click on the  <i class='ui inverted bordered ${icon} icon'></i> <strong>${fpname.toUpperCase()}</strong> button here to show this Panel.`,
    selector: `#mgbjr-flexPanelIcons-${fpname}`,
    showStepOverlay: true,
    awaitCompletionTag: `mgbjr-CT-flexPanel-${fpname}-show`,
    position: 'left',
    style: '%inverted%', // Note that full Step Macros can still use per-field macros :)
  },
})

// Helper which makes a Create New Asset <Kind> stepMacro: e.g. _mkCreateAsset( 'music' )
const _mkCreateAsset = kind => [
  {
    key: _wrapKey(`create-asset-${kind}-select-kind`),
    hint: `New ${kind.toUpperCase()} asset kind selected`,
    desc: `Step for selecting a new <strong>${kind.toUpperCase()}</strong> Asset`,
    newVal: {
      title: `Select ${kind.toUpperCase()} Asset kind`,
      text: `Select the <strong>${kind.toUpperCase()}</strong> asset kind. You cannot change the kind once it is created.`,
      selector: `#mgbjr-create-asset-select-kind-${kind}`,
      showStepOverlay: false,
      awaitCompletionTag: `mgbjr-CT-create-asset-select-kind-${kind}`,
      position: 'right',
      style: '%inverted%',
    },
  },
  {
    key: _wrapKey(`create-asset-${kind}-set-name`),
    hint: `New ${kind} asset name set`,
    desc: `Step for selecting a new <strong>${kind.toUpperCase()}</strong> Asset`,
    newVal: {
      title: `Enter a ${kind.toUpperCase()} Asset name`,
      text: `Type in a name. You can always change it later.`,
      selector: '#mgbjr-create-asset-name',
      showStepOverlay: false,
      awaitCompletionTag: `mgbjr-CT-create-asset-name`,
      position: 'right',
      style: '%inverted%',
    },
  },
  {
    key: _wrapKey(`create-asset-${kind}-select-project`),
    hint: `New ${kind.toUpperCase()} asset project selected`,
    desc: `Step for selecting a new <strong>${kind.toUpperCase()}</strong> Asset`,
    newVal: {
      title: `Optionally select a project`,
      text: `Projects let you group assets together. This is optional and can be changed later.`,
      selector: '#mgbjr-create-asset-project',
      showStepOverlay: false,
      position: 'right',
    },
  },
  {
    key: _wrapKey(`create-asset-${kind}-create-button`),
    hint: `New ${kind.toUpperCase()} asset kind selected`,
    desc: `Step for selecting a new <strong>${kind.toUpperCase()}</strong> Asset`,
    newVal: {
      title: `Create your ${kind.toUpperCase()} Asset`,
      text: `Great, now create the asset.`,
      selector: '#mgbjr-create-asset-button',
      showStepOverlay: false,
      awaitCompletionTag: `mgbjr-CT-create-asset-${kind}-do-create`,
      position: 'right',
      style: '%inverted%',
    },
  },
]

const makeStepMacros = () => {
  const stepMacros = [
    {
      key: _wrapKey('complete'),
      hint: `Tutorial completed`,
      desc: `Tutorial completed, you can also start the next from the learn flex panel.`,
      newVal: {
        title: `Great, you completed the tutorial!`,
        text: `Let's get started on the next tutorial.`,
        preparePage: 'openFlexPanel:learn',
        showStepOverlay: true,
        position: 'left',
        style: '%green%', // Note that full Step Macros can still use per-field macros :)
      },
    },

    {
      key: _wrapKey('complete2'),
      hint: `Tutorial completed`,
      desc: `Tutorial completed, explain how to start next using FP`,
      newVal: {
        title: `Great, you completed the tutorial!`,
        text: `Let's get started on the next tutorial.`,
        showStepOverlay: true,
        position: 'left',
        style: '%green%',
      },
    },

    {
      key: _wrapKey('completeLearnPhaserTut'),
      hint: `Tutorial completed`,
      desc: `Tutorial completed, go to /learn/code/phaser for next`,
      newVal: {
        title: `Great, you completed the tutorial!`,
        text: `Let's get started on the next tutorial.`,
        preparePage: 'navToRelativeUrl:/learn/code/phaser',
        showStepOverlay: true,
        position: 'left',
        style: '%green%',
      },
    },

    {
      key: _wrapKey('MOCK'),
      hint: `Mock/placeholder step`,
      desc: `A Mock step that is handy as a placeholder when making a tutorial`,
      newVal: {
        title: `MOCK STEP. Placeholder - Does nothing`,
        text: `Lorem ipsum hocus pocus testing 1 2 3 Ground Control To Major Tom. Kthxbye`,
        selector: 'body',
        showStepOverlay: false,
        position: 'top',
      },
    },

    {
      key: _wrapKey('flexPanel'),
      hint: `Find FlexPanel`,
      desc: `Step for finding the FlexPanel`,
      newVal: {
        title: `The FlexPanel area`,
        text: `This stack of icons on the right-hand side is called the <em>FlexPanel</em>. These panels have useful context while you are working on other assets`,
        selector: '#mgbjr-flexPanelArea', // This was previously mgbjr-flexPanelIcons but that is fixed and narrow so tooltip can't always show
        showStepOverlay: true,
        position: 'left',
      },
    },

    {
      key: _wrapKey('navPanel'),
      hint: `Find Top Menu NavPanel`,
      desc: `Step for finding the Top Menu NavPanel`,
      newVal: {
        title: `The page header`,
        text: `This header has direct links and submenus to navigate this site`,
        selector: '#mgbjr-np',
        showStepOverlay: true,
        position: 'bottom',
      },
    },

    ..._mkNavPanelMacros(),

    _mkFp('activity', 'lightning'),
    _mkFp('learn', 'student'),
    _mkFp('assets', 'pencil'),
    _mkFp('chat', 'chat'),
    _mkFp('options', 'options'),
    _mkFp('users', 'users'),
    _mkFp('network', 'signal'),
    _mkFp('keys', 'keyboard'),
    _mkFpDescribe('activity', 'lightning', 'This activity feed lets you see what people are working on'),
    _mkFpDescribe('learn', 'student', 'You can track, start/stop or resume your tutorials from here'),
    _mkFpDescribe(
      'assets',
      'pencil',
      'This lets you find assets, load them, or drag them into other assets - for example dragging a Graphic to a Map',
    ),
    _mkFpDescribe(
      'chat',
      'chat',
      'The Chat FlexPanel allows you to chat with other users of the site, while still doing other work',
    ),
    _mkFpDescribe(
      'options',
      'options',
      'This lets you enable advanced fetures that are initially hidden for new users',
    ),
    _mkFpDescribe('users', 'users', "This is a quick way to search for other users. It doesn't do much yet."),
    _mkFpDescribe(
      'network',
      'signal',
      'If you lose network or server connectivity, this provides some info and a way to force a reconnect',
    ),
    _mkFpDescribe(
      'keys',
      'keyboard',
      "This doesn't really work yet, but it will be a way to learn and modify keyboard shortcuts",
    ),

    ..._mkCreateAsset('graphic'),
    ..._mkCreateAsset('actor'),
    ..._mkCreateAsset('actormap'),
    ..._mkCreateAsset('map'),
    ..._mkCreateAsset('code'),
    ..._mkCreateAsset('sound'),
    ..._mkCreateAsset('music'),
    ..._mkCreateAsset('game'),
    ..._mkCreateAsset('tutorial'),

    // This is a special/sneaky one that is used in some tutorials to award a badge. The actual award is done server side based on some criteria
    {
      key: _wrapKey('refreshBadgeStatus'),
      hint: `Refresh Badge Status`,
      desc: `Tells the server to check now to see if recent user actions should be rewarded with a badge`,
      newVal: {
        preparePage: 'refreshBadgeStatus',
        title: 'Waving magic wand...',
        text: 'See your new Badge?',
        position: 'top-left',
      },
    },
  ]
  return stepMacros
}

let _stepMacros = makeStepMacros()

Tracker.autorun(function() {
  if (Meteor.userId()) {
    // do something when they've just logged in.
    _stepMacros = makeStepMacros()
    //console.log("makeStepMacros for user: ", Meteor.userId())
  }
})

const usefulColors = {
  yellowish: 'rgba(148, 191, 22, 0.32)',
  whiteTint: 'rgba(255, 255, 255, 0.45)',
  pinkish: 'rgba(201, 23, 33, 0.2)',
  orangeish: 'rgba(251, 189, 8, 0.3)',
}

const propertyMacros = [
  // field == someFieldName means this is a macros for fields (properties) WITHIN a step.. e.g ."style"
  {
    field: 'style',
    key: _wrapKey('navpanelmenu'),
    desc: 'A style good for NavPanel steps',
    newVal: {
      backgroundColor: 'rgba(0, 96, 0, 1)',
      color: '#fff',
      mainColor: '#fbbd08',
      skip: { color: '#804' },
      hole: { backgroundColor: usefulColors.whiteTint },
    },
  },
  {
    field: 'style',
    key: _wrapKey('begin'),
    desc: 'A style good for starting a Tutorial',
    newVal: {
      backgroundColor: 'rgba(0, 96, 0, 1)',
      color: '#fff',
      mainColor: '#fbbd08',
      skip: { color: '#f48' },
      hole: { backgroundColor: usefulColors.whiteTint },
    },
  },

  {
    field: 'style',
    key: _wrapKey('inverted'),
    desc: 'An inverted style for emphasis',
    newVal: {
      backgroundColor: 'rgba(15, 15, 15, 0.8)',
      color: '#fff',
      mainColor: '#ff4456',
      skip: { color: '#804456' },
      hole: { backgroundColor: usefulColors.whiteTint },
      boxShadow: '0px 0px 20px #fff',
    },
  },

  {
    field: 'style',
    key: _wrapKey('green'),
    desc: 'A very green style for success',
    newVal: {
      backgroundColor: 'rgba(0, 96, 0, 1)',
      color: '#fff',
      mainColor: '#fbbd08',
      skip: { color: '#f48' },
      hole: { backgroundColor: usefulColors.yellowish },
    },
  },

  {
    field: 'style',
    key: _wrapKey('under-construction'),
    desc: 'An alert style for stuff that does not yet actually exist',
    newVal: {
      backgroundColor: 'rgba(234, 174, 0, 0.95)',
      color: '#fff',
      mainColor: '#ff4456',
      skip: { color: '#ff4456' },
      hole: { backgroundColor: 'RGBA(23, 23, 23, 0.5)' },
    },
  },
]

// This returns { newStep{}, notFoundMacros[] }  .. and never returns null, nor a different shape
export const transformStep = step => {
  const notFoundMacros = []

  if (_.isString(step)) {
    const m = _.find(_stepMacros, { key: step })
    if (!m)
      return {
        newStep: step,
        notFoundMacros: { key: _fullStepField, val: step }, //return key=null for
      }
    step = m.newVal
    // Now continue processing the step so we can allow the pre-defined steps to use field macros
  }

  const newStep = _.mapValues(step, (v, k) => {
    if (!_looksLikeMacroKey(v)) return v

    const m = _.find(propertyMacros, { field: k, key: v })
    if (m) return m.newVal

    notFoundMacros.push({ key: k, val: v })
  })

  return { newStep, notFoundMacros }
}

// Munge the _stepMacros list to expose what would be interesting for a semanticUI <Dropdown options={}/> control
// e.g. Array of { text: text_to_show_user_on_left, description: extra_but_faded_info_for_user, value: %key% } objects
export const stepKeyOptionsForDropdown = _.map(_stepMacros, s => ({
  text: s.key,
  content: (
    <div>
      {s.key}
      <div style={{ opacity: 0.5 }}>{s.hint}</div>
    </div>
  ),
  value: s.key,
}))

export const autocompleteOptions = _.map(_stepMacros, s => ({
  desc: s.desc,
  text: s.key,
}))
/* Example uses:

    const s1 = {
      style: '%inverted%',
      'bogus': '%sdsd%',
      'thisOk': 123
    }
    console.log(transformStep(s1))
    console.log(transformStep('%npHome%'))

*/

/* Example Tutorial JSON

  {
    "steps": [
      {
        "heading": "Setting An Avatar",
        "title": "What's an Avatar?",
        "text": "Your Avatar is an image that you choose to represent you on this site.<br></br>Let's learn how to set your user Avatar",
        "style": "%inverted%",
        "imageRightSrc": "/api/asset/png/!vault/AccountAvatar"
      },

      {
        "title": "Avatars are Graphic Assets",
        "text": "You must first create a graphic Asset that will be used for your Avatar"
      },

      "%np-create%",
      "%create-new-asset%",
      "%create-asset-graphic%",

      {
        "title": "This is your new, empty GRAPHIC Asset",
        "text": "Use your mouse/finger to draw in the drawing area on the left. Your changes will save within a few seconds.<br></br>Don't worry about how it looks - you can easily improve it later.<br></br>Click Next here when ready",
        "position": "top-right",
        "imageRightSrc": "/api/asset/png/dgolds/foobar",
        "TODO": "Put the image in !vault"
      },

      {
        "title": "To the Profile Page!",
        "text": "Let's go back to your profile page"
      },

      "%np-home%",

      {
        "title": "My Profile",
        "text": "Click on the &ensp;<div class='ui label'>My Profile&emsp;<i class='grey user icon'></i></div>&ensp; option",
        "selector": "#mgbjr-np-home-myProfile",
        "awaitCompletionTag": "mgbjr-CT-app-router-path-u/:username",
        "position": "right"
      },

      {
        "title": "One more step...",
        "text": "Next we are going to drag your graphic to your Profile Avatar"
      },

      "%flexPanel%",
      "%fp-assets%",
      {
        "title": "Drag your graphic to set your avatar",
        "text": "Find your new graphic in the Assets Flex Panel and drag it to the avatar area",
        "awaitCompletionTag": "mgbjr-CT-profile-set-field-profile.avatar",
        "position": "bottom",
        "style": "%inverted%"
      },

      "%complete%"
    ]
  }


*/
