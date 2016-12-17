import _ from 'lodash'

const _wrapKey = key => `%${key}%`
const _looksLikeMacroKey = key => (_.isString(key) && key.length > 2 && key.search(/^%.*%$/) !== -1)
const _fullStepField = null


// e.g. _mkNp( 'learn', 'student' )
const _mkNp = ( npname, icon ) => (
  {
    field: null,
    key: _wrapKey(`np-${npname}`),
    desc: `Step for finding the ${_.upperFirst(npname)} NavPanel`,
    newVal:
    {
      "title": `Navigation panel -> ${_.upperFirst(npname)}`,
      "text": `Click on the  <i class='ui inverted bordered ${icon} icon'></i> ${_.upperCase(npname)} button here`,
      "selector": `#mgbjr-navPanelIcons-${npname}`,
      "showStepOverlay": false,
      "awaitCompletionTag": `mgbjr-CT-navPanel-${npname}-show`,
      "position": "right",
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
  _mkNp( 'home',     'home'         ),
  _mkNp( 'learn',    'student'      ),
  _mkNp( 'create',   'pencil'       ),
  _mkNp( 'play',     'game'         ),
  _mkNp( 'meet',     'street view'  ),
  _mkNp( 'projects', 'sitemap'      ),
  _mkNp( 'history',  'history'      )
]

// This returns { newStep{}, notFoundMacros[] }  .. and never returns null, or a differnt shape
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