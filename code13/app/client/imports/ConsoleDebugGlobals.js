
import _ from 'lodash'

window._MGB_DBG = {
  _contents: {}      // This should have strings like 'J:Joyride'

}

if (!window.m)
  window.m = window._MGB_DBG


const registerDebugGlobal = (propertyKey, value, sourceFileName, comment) => {
  window._MGB_DBG[propertyKey] = value
  window._MGB_DBG._contents[propertyKey] = { sourceFileName, comment }
  window._MGB_DBG.h =
    '\nAvailable helpful MGB debug values: \n' +
    `m.h                 This help text - ${__filename}\n` +
    _.sortBy(
      _.map(window._MGB_DBG._contents, (v, k) => `m.${(k+'               ').slice(0,16)}  ${v.comment} - ${v.sourceFileName}` )
    ).join('\n') +
    '\n'
  // this is for tests.. so we can disable side panel animations
  window._MGB_DBG.addStyle = s => {
    const style = document.createElement("style")
    style.setAttribute("type", 'text/css')
    style.appendChild(document.createTextNode(s))
    document.head.appendChild(style)
  }
}

registerDebugGlobal( '_reg', registerDebugGlobal, __filename, 'The registerDebugGlobal function!')
registerDebugGlobal( '_what', `This is a handy debug object created by MGB's App.js component. It is a place to put debug stuff. It should only be set via the window._MGB_DBG variable, but there is also a convenient alias window.m for console debugging in browser\n\n Try typing   m.h  in the browser console to learn more`, __filename, 'Explains more about what this is')

registerDebugGlobal( '_what', `This is a handy debug object created by MGB's App.js component. It is a place to put debug stuff. It should only be set via the window._MGB_DBG variable, but there is also a convenient alias window.m for console debugging in browser\n\n Try typing   m.h  in the browser console to learn more`, __filename, 'Explains more about what this is')

console.log(`%cMGB debug helpers enabled. Try typing 'm.h' in the browser debug console`, 'color: #00aa00; font-weight: bold; font-size: 14px;')

export default registerDebugGlobal
