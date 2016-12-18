import _ from 'lodash'

const _wrapKey = key => `%${key}%`
const _looksLikeMacroKey = key => (_.isString(key) && key.length > 2 && key.search(/^%.*%$/) !== -1)
const _fullStepField = null


/* These enable Tutorial steps to be written using macros:   e.g. 

  {
    "steps": [
      "%flexPanel%",
      "%fp-goals%",
    ...
  }

*/

// Helper which makes a NavPanel Macro: e.g. _mkNp( 'learn', 'student' )
const _mkNp = ( npname, icon ) => (
  {
    field: _fullStepField,
    key: _wrapKey(`np-${npname}`),
    desc: `Step for finding the ${_.upperFirst(npname)} NavPanel`,
    newVal:
    {
      "title": `The '${_.upperFirst(npname)}' Navigation panel`,
      "text": `Click on the  <i class='ui inverted bordered ${icon} icon'></i> ${_.upperCase(npname)} button here`,
      "selector": `#mgbjr-navPanelIcons-${npname}`,
      "showStepOverlay": false,
      "awaitCompletionTag": `mgbjr-CT-navPanel-${npname}-show`,
      "position": "right",
      "style": "%inverted%"    // Note that full Step Macros can still use per-field macros :)
    }
  }
)

// Helper which makes a FlexPanel Macro: e.g. _mkNp( 'learn', 'student' )
const _mkFp = ( fpname, icon ) => (
  {
    field: _fullStepField,
    key: _wrapKey(`fp-${fpname}`),
    desc: `Step for finding the ${_.upperFirst(fpname)} FlexPanel`,
    newVal:
    {
      "title": `The '${_.upperFirst(fpname)}' Flex panel`,
      "text": `Click on the  <i class='ui inverted bordered ${icon} icon'></i> ${_.upperCase(fpname)} button here`,
      "selector": `#mgbjr-flexPanelIcons-${fpname}`,
      "showStepOverlay": false,
      "awaitCompletionTag": `mgbjr-CT-flexPanel-${fpname}-show`,
      "position": "left",
      "style": "%inverted%"    // Note that full Step Macros can still use per-field macros :)
    }
  }
)

const _mkCreateAsset = kind => (
  {
    field: _fullStepField,
    key: _wrapKey(`create-asset-${kind}`),
    desc: `Step for awaiting creation of a ${_.upperCase(kind)} Asset`,
    newVal:
    {
      "title": `Create a ${_.upperCase(kind)} Asset`,
      "text": `First, type in a name for the asset above... 
      for example '<span style='color: red'>my avatar</span>'.<br></br>Second.. Select the ${_.upperCase(kind)} asset kind above.<br></br>Third... Click on the 'Create Asset' button to the left here`,
      "selector": "#mgbjr-create-asset-button",
      "awaitCompletionTag": `mgbjr-CT-asset-create-new-${kind}`,
      "position": "right"
    }
  }
)

const macros = [

  // field == someFieldName means this is a macros for fields WITHIN a step.. e.g ."style"
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
    desc: "An very green style for success",
    newVal:
    {
      "backgroundColor": "rgba(0, 96, 0, 1)",
      "color": "#fff",
      "mainColor": "#fbbd08",
      "skip": { "color": "#f04" },
      "hole": { "backgroundColor": "RGBA(201, 23, 33, 0.2)" }
    }
  },
  // field == null means this is to replace an entire step  

  {
    field: _fullStepField,
    key: _wrapKey('complete'),
    desc: `Tutorial completed`,
    newVal:
    {
      "title": `Great! You completed the tutorial`,
      "text": `You can start the next tutorial from the Goals FlexPanel at any time`,
      "selector": "#mgbjr-flexPanelIcons-goals",
      "position": "left",
      "style": "%green%"    // Note that full Step Macros can still use per-field macros :)
    }
  },

  {
    field: _fullStepField,
    key: _wrapKey('MOCK'),
    desc: `A Mock step that is handy as a placeholder when making a tutorial`,
    newVal:
    {
      "title": `MOCK STEP. Placeholder - Does nothing`,
      "text": `Lorem ipsum hocus pocus testing 1 2 3 Ground Control To Major Tom. Kthxbye`,
      "selector": "body",
      "position": "top",
      "style": "%inverted%"    // Note that full Step Macros can still use per-field macros :)
    }
  },
  
  {
    field: _fullStepField,
    key: _wrapKey('flexPanel'),
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
    field: _fullStepField,
    key: _wrapKey('navPanel'),
    desc: `Step for finding the NavPanel`,
    newVal:
    {
      "title": `The NavPanel area`,
      "text": `This stack of icons on the left-hand side is called the <em>NavPanel</em>. These Navigation Panels are useful for navigating the site`,
      "selector": "#mgbjr-navPanelIcons",
      "showStepOverlay": true,
      "position": "right",
      "style": "%inverted%"    // Note that full Step Macros can still use per-field macros :)
    }
  },

  {
    field: _fullStepField,
    key: _wrapKey('create-new-asset'),
    desc: `Step for Create New Asset. Prior step should be %np-create%`,
    newVal:
    {
      "title": "Great. Now choose 'Create New Asset'",
      "text": "Click on the&ensp;<div class='ui label'>Create New Asset&emsp;<i class='green pencil icon'></i></div>&ensp;option",
      "selector": "#mgbjr-np-create-createNewAsset",
      "awaitCompletionTag": "mgbjr-CT-app-location-path-/assets/create",
      "position": "right"
    },
  },

  _mkNp( 'home',     'home'         ),
  _mkNp( 'learn',    'student'      ),
  _mkNp( 'create',   'pencil'       ),
  _mkNp( 'play',     'game'         ),
  _mkNp( 'meet',     'street view'  ),
  _mkNp( 'projects', 'sitemap'      ),
  _mkNp( 'history',  'history'      ),

  _mkFp( 'activity', 'lightning'    ),
  _mkFp( 'goals',    'student'      ),
  _mkFp( 'assets',   'pencil'       ),
  _mkFp( 'chat',     'chat'         ),
  _mkFp( 'options',  'options'      ),
  _mkFp( 'skills',   'plus circle'  ),
  _mkFp( 'users',    'street view'  ),
  _mkFp( 'network',  'signal'       ),
  _mkFp( 'keys',     'keyboard'     ),

  _mkCreateAsset( 'graphic'  ),
  _mkCreateAsset( 'actor'    ),
  _mkCreateAsset( 'actorMap' ),
  _mkCreateAsset( 'map'      ),
  _mkCreateAsset( 'code'     ),
  _mkCreateAsset( 'sound'    ),
  _mkCreateAsset( 'music'    ),
  _mkCreateAsset( 'game'     ),
  _mkCreateAsset( 'tutorial' )

]

// This returns { newStep{}, notFoundMacros[] }  .. and never returns null, nor a different shape
export const transformStep = step =>
{
  const notFoundMacros = []

  if (_.isString(step))
  {
    const m = _.find(macros, { field: _fullStepField, key: step } )
    if (m)
      step = m.newVal
    else
      return { 
        newStep: step, 
        notFoundMacros: { key: _fullStepField, val: step } 
      }
  }
  
  const newStep = _.mapValues(step, (v, k) =>
  {
    if (!_looksLikeMacroKey(v))
      return v
    const m = _.find(macros, { field: k, key: v } )
    if (m)
      return m.newVal

    notFoundMacros.push( { key: k, val: v } )
  })

  return { newStep, notFoundMacros }
}



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