import _ from 'lodash'
import { getNavPanels } from '/client/imports/components/SidePanels/NavPanel'

// This code is used by the Joyride/Tutorial systems to make it easier to write tutorials.
//
//   transformStep() expands macros in a 'step' that is part of a Joyride step
//   stepKeyOptionsForDropdown[] contains stepMacroNames (and descriptions) for use in a Dropdown etc


const _wrapKey = key => `%${key}%`
const _looksLikeMacroKey = key => (_.isString(key) && key.length > 2 && key.search(/^%.*%$/) !== -1)
const _fullStepField = null     // This is returned in notFoundMacros[].field results for a step macro

/* These enable Tutorial steps to be written using macros:   e.g. 

  {
    "steps": [
      "%flexPanel%",
      "%fp-goals%",
    ...
  }

*/

// Helper which makes an array of NavPanel stepMacro: e.g. _mkNp( 'learn', 'student' )
const _mkNavPanelMacros = () => {

  const np = getNavPanels(null, true) // this gets the complete set so we can extract what we want
  const retval = []
  const parseDropdown = (dd, position) => {
    const ddUpName = _.upperFirst(dd.name)
    // 1. The Top Menu to find (as a click action)
    retval.push({
      key: _wrapKey(`np-${dd.name}`),
      hint: `${_.upperFirst(dd.name)} Menu`,
      desc: `Step for clicking the ${ddUpName} Menu`,
      newVal:
      {
        "title": `The '${ddUpName}' menu: one-click shortcut`,
        "text": `Click (not just hover) on the ${ddUpName} menu here.<br></br>${dd.explainClickAction}`,
        "selector": `#mgbjr-np-${dd.name}`,
        "showStepOverlay": false,
        "awaitCompletionTag": `mgbjr-CT-np-${dd.name}`,
        "position": position
      }
    })
    // 2. Each of the options in the Menu DropDown
    _.each(dd.menu, item => {
      const smText = _.isString(item.content) ? item.content : item.jrkey // hack
      retval.push({
        key: _wrapKey(`np-${dd.name}-${item.jrkey}`),
        hint: `${_.upperFirst(dd.name)} Menu`,
        desc: `Step for finding the ${ddUpName}->${smText} menu`,
        newVal:
        {
          "title": `The '${ddUpName}->${smText}' menu`,
          "text": `<br></br>Hover on the <div class='ui small black button'>${ddUpName}</div> menu,<br></br> then click the <div class='ui label'>${smText}</div> option`,
    //      "selector": `#mgbjr-np-${dd.name}`, // Note that the -jrkey suffix isn't visible yet...
          "showStepOverlay": true,
          "awaitCompletionTag": `mgbjr-CT-np-${dd.name}-${item.jrkey}`,
          "position": 'top ' + position
        }
      })

    })

  }
 
  _.each(np.left,  dd => parseDropdown(dd, 'right'))
  _.each(np.right, dd => parseDropdown(dd, 'left'))

  return retval

}

// Helper which makes a FlexPanel stepMacro: e.g. _mkNp( 'learn', 'student' ) is %fp-learn%
const _mkFp = ( fpname, icon ) => (
  {
    key: _wrapKey(`fp-${fpname}`),
    hint: `${_.upperFirst(fpname)} FlexPanel`,
    desc: `Step for finding the ${_.upperFirst(fpname)} FlexPanel`,
    newVal:
    {
      "title": `The '${_.upperFirst(fpname)}' Flex panel`,
      "text": `Click on the  <i class='ui inverted bordered ${icon} icon'></i> ${_.upperCase(fpname)} button here`,
      "selector": `#mgbjr-flexPanelIcons-${fpname}`,
      "showStepOverlay": true,
      "awaitCompletionTag": `mgbjr-CT-flexPanel-${fpname}-show`,
      "position": "left",
      "style": "%inverted%"    // Note that full Step Macros can still use per-field macros :)
    }
  }
)

// Helper which makes a FlexPanel Descrine stepMacro: e.g. _mkNp( 'learn', 'student', 'some text' ) is %fp-learn-describe%
const _mkFpDescribe = ( fpname, icon, describeText ) => (
  {
    key: _wrapKey(`fp-${fpname}-describe`),
    hint: `${_.upperFirst(fpname)} FlexPanel`,
    desc: `Step for finding the ${_.upperFirst(fpname)} FlexPanel`,
    newVal:
    {
      "title": `The '${_.upperFirst(fpname)}' Flex panel`,
      "text": `${describeText}. <br></br>Click on the  <i class='ui inverted bordered ${icon} icon'></i> ${_.upperCase(fpname)} button here to show this Panel`,
      "selector": `#mgbjr-flexPanelIcons-${fpname}`,
      "showStepOverlay": true,
      "awaitCompletionTag": `mgbjr-CT-flexPanel-${fpname}-show`,
      "position": "left",
      "style": "%inverted%"    // Note that full Step Macros can still use per-field macros :)
    }
  }
)

// Helper which makes a Create New Asset <Kind> stepMacro: e.g. _mkCreateAsset( 'music' )
const _mkCreateAsset = kind => (
  {
    key: _wrapKey(`create-asset-${kind}`),
    hint: `${_.upperCase(kind)} asset created`,
    desc: `Step for awaiting creation of a ${_.upperCase(kind)} Asset`,
    newVal:
    {
      "title": `Create a ${_.upperCase(kind)} Asset`,
      "text": `First, type in a name for the asset above... 
      for example '<span style='color: red'>my avatar</span>'.<br></br>Second.. Select the ${_.upperCase(kind)} asset kind above.<br></br>Third... Click on the 'Create Asset' button to the left here`,
      "selector": "#mgbjr-create-asset-button",
      "showStepOverlay": false,
      "awaitCompletionTag": `mgbjr-CT-asset-create-new-${kind}`,
      "position": "right"
    }
  }
)


const stepMacros = [
  {
    key: _wrapKey('complete'),
    hint: `Tutorial completed`,
    desc: `Tutorial completed, explain how to start next`,
    newVal:
    {
      "title": `Great! You completed the tutorial`,
      "text": `You can start the next tutorial from the Goals FlexPanel at any time`,
      "selector": "#mgbjr-flexPanelIcons-goals",
      "showStepOverlay": true,
      "position": "left",
      "style": "%green%"    // Note that full Step Macros can still use per-field macros :)
    }
  },

  {
    key: _wrapKey('MOCK'),
    hint: `Mock/placeholder step`,
    desc: `A Mock step that is handy as a placeholder when making a tutorial`,
    newVal:
    {
      "title": `MOCK STEP. Placeholder - Does nothing`,
      "text": `Lorem ipsum hocus pocus testing 1 2 3 Ground Control To Major Tom. Kthxbye`,
      "selector": "body",
      "showStepOverlay": false,
      "position": "top",
      "style": "%inverted%"    // Note that full Step Macros can still use per-field macros :)
    }
  },
  
  {
    key: _wrapKey('flexPanel'),
    hint: `Find FlexPanel`,
    desc: `Step for finding the FlexPanel`,
    newVal:
    {
      "title": `The FlexPanel area`,
      "text": `This stack of icons on the right-hand side is called the <em>FlexPanel</em>. These panels have useful context while you are working on other assets`,
      "selector": "#mgbjr-flexPanelIcons",
      "showStepOverlay": true,
      "position": "left",
      "style": "%inverted%"    // Note that full Step Macros can still use per-field macros :)
    }
  },

  {
    key: _wrapKey('navPanel'),
    hint: `Find Top Menu NavPanel`,
    desc: `Step for finding the Top Menu NavPanel`,
    newVal:
    {
      "title": `The page header`,
      "text": `This header has direct links and submenus to navigate this site`,
      "selector": "#mgbjr-np",
      "showStepOverlay": true,
      "position": "bottom",
      "style": "%inverted%"    // Note that full Step Macros can still use per-field macros :)
    }
  },

  ..._mkNavPanelMacros(),

  _mkFp( 'activity', 'lightning'    ),
  _mkFp( 'goals',    'student'      ),
  _mkFp( 'assets',   'pencil'       ),
  _mkFp( 'chat',     'chat'         ),
  _mkFp( 'options',  'options'      ),
  _mkFp( 'skills',   'plus circle'  ),
  _mkFp( 'users',    'street view'  ),
  _mkFp( 'network',  'signal'       ),
  _mkFp( 'keys',     'keyboard'     ),
  _mkFpDescribe( 'activity', 'lightning',   'This activity feed lets you see what people are working on'   ),
  _mkFpDescribe( 'goals',    'student',     'You can track, start/stop or resume your tutorials from here' ),
  _mkFpDescribe( 'assets',   'pencil',      'This lets you find assets, load them, or drag them into other assets - for example dragging a Graphic to a Map' ),
  _mkFpDescribe( 'chat',     'chat',        'This lets you chat with other users of the site' ),
  _mkFpDescribe( 'options',  'options',     'This lets you enable advanced fetures that are initially hidden for new users' ),
  _mkFpDescribe( 'skills',   'plus circle', 'This lets you track your learning skills'),
  _mkFpDescribe( 'users',    'street view', 'This is a quick way to search for other users. It doesn\'t do much yet...' ),
  _mkFpDescribe( 'network',  'signal',      'If you lose network or server connectivity, this provides some info and a way to force a reconnect'),
  _mkFpDescribe( 'keys',     'keyboard',    'This doesn\'t really work yet, but it will be a way to learn and modify keyboard shortcuts' ),

  _mkCreateAsset( 'graphic'  ),
  _mkCreateAsset( 'actor'    ),
  _mkCreateAsset( 'actorMap' ),
  _mkCreateAsset( 'map'      ),
  _mkCreateAsset( 'code'     ),
  _mkCreateAsset( 'sound'    ),
  _mkCreateAsset( 'music'    ),
  _mkCreateAsset( 'game'     ),
  _mkCreateAsset( 'tutorial' ),

  // This is a special/sneaky one that is used in some tutorials to award a badge. The actual award is done server side based on some criteria
  {
    key: _wrapKey('refreshBadgeStatus'),
    hint: `Refresh Badge Status`,
    desc: `Tells the server to check now to see if recent user actions should be rewarded with a badge`,
    newVal:
    {
      "preparePage": 'refreshBadgeStatus',
      "title": "Waving magic wand...",
      "text": "See your new Badge?",
      "style": '%inverted%',
      "position": "top-left"
    },
  }
]

const propertyMacros = [

  // field == someFieldName means this is a macros for fields (properties) WITHIN a step.. e.g ."style"
  {
    field: 'style',
    key: _wrapKey('begin'),
    desc: "A style good for starting a Tutorial",
    newVal:
    {
      "backgroundColor": "rgba(0, 96, 0, 1)",
      "color": "#fff",
      "mainColor": "#fbbd08",
      "skip": { "color": "#f04" },
      "hole": { "backgroundColor": "RGBA(201, 23, 33, 0.2)" }
    }
  },

  {
    field: 'style',
    key: _wrapKey('inverted'),
    desc: "An inverted style for emphasis",
    newVal:
    {
      "backgroundColor": "rgba(0, 0, 0, 0.8)",
      "color": "#fff",
      "mainColor": "#ff4456",
      "skip": { "color": "#ff4456" },
      "hole": { "backgroundColor": "RGBA(201, 23, 33, 0.2)" }
    }
  },

  {
    field: 'style',
    key: _wrapKey('green'),
    desc: "A very green style for success",
    newVal:
    {
      "backgroundColor": "rgba(0, 96, 0, 1)",
      "color": "#fff",
      "mainColor": "#fbbd08",
      "skip": { "color": "#f04" },
      "hole": { "backgroundColor": "RGBA(201, 23, 33, 0.2)" }
    }
  },

  {
    field: 'style',
    key: _wrapKey('under-construction'),
    desc: "An alert style for stuff that does not yet actually exist",
    newVal:
    {
      "backgroundColor": "rgba(255, 128, 128, 0.95)",
      "color": "#fff",
      "mainColor": "#ff4456",
      "skip": { "color": "#ff4456" },
      "hole": { "backgroundColor": "RGBA(23, 23, 23, 0.5)" }
    }
  }
]

// This returns { newStep{}, notFoundMacros[] }  .. and never returns null, nor a different shape
export const transformStep = step =>
{
  const notFoundMacros = []

  if (_.isString(step))
  {
    const m = _.find(stepMacros, { key: step } )
    if (!m)
      return { 
        newStep: step, 
        notFoundMacros: { key: _fullStepField, val: step }  //return key=null for  
      }
    step = m.newVal
    // Now continue processing the step so we can allow the pre-defined steps to use field macros
  }
  
  const newStep = _.mapValues(step, (v, k) =>
  {
    if (!_looksLikeMacroKey(v))
      return v

    const m = _.find( propertyMacros, { field: k, key: v } )
    if (m)
      return m.newVal

    notFoundMacros.push( { key: k, val: v } )
  })

  return { newStep, notFoundMacros }
}


// Munge the stepMacros list to expose what would be interesting for a semanticUI <Dropdown options={}/> control
// e.g. Array of { text: text_to_show_user_on_left, description: extra_but_faded_info_for_user, value: %key% } objects
export const stepKeyOptionsForDropdown = _.map( stepMacros, s => ( { text: s.key, description: s.hint, value: s.key } ) )

export const autocompleteOptions = _.map(stepMacros, s => ({
  desc: s.desc,
  text: s.key
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
