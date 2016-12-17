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

const macros = [
  {
    field: 'style',
    key: _wrapKey('inverted'),
    desc: "An inverted style for emphasis",
    newVal:
    {
      "backgroundColor": "rgba(0, 0, 0, 0.8)",
      "color": "#fff",
      "mainColor": "#ff4456",
      "skip": { "color": "#f04" },
      "hole": { "backgroundColor": "RGBA(201, 23, 33, 0.2)" }
    }
  },

  // Field == null means this is to replace an entire step

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

  _mkNp( 'home',     'home'         ),
  _mkNp( 'learn',    'student'      ),
  _mkNp( 'create',   'pencil'       ),
  _mkNp( 'play',     'game'         ),
  _mkNp( 'meet',     'street view'  ),
  _mkNp( 'projects', 'sitemap'      ),
  _mkNp( 'history',  'history'      ),

  _mkFp( 'activity', 'lightning'    ),
  _mkFp( 'goals',    'student'      ),
  _mkFp( 'asssets',  'pencil'       ),
  _mkFp( 'chat',     'chat'         ),
  _mkFp( 'options',  'options'      ),
  _mkFp( 'skills',   'plus circle'  ),
  _mkFp( 'users',    'street view'  ),
  _mkFp( 'network',  'signal'       ),
  _mkFp( 'keys',     'keyboard'     )
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