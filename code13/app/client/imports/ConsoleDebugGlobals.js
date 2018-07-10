import _ from 'lodash'

const contents = {
  // [key]: { filename, comment },
}

const indentedColumn = text => _.padEnd(`  ${text}`, 15)

window._MGB_DEBUG = {
  get help() {
    return [
      'Available helpful _MGB_DEBUG properties:',
      '',
      `${indentedColumn('.help')} This help text (${__filename})`,
      ..._.sortBy(_.map(contents, (v, k) => `${indentedColumn(`.${k}`)} ${v.comment} (${v.filename})`)),
    ].join('\n')
  },

  get h() {
    return this.help
  },
}

const registerDebugGlobal = (key, value, filename, comment) => {
  _.set(window._MGB_DEBUG, key, value)
  _.set(contents, key, { filename, comment })
}

registerDebugGlobal(
  'addStyle',
  css => {
    const $style = document.createElement('style')
    $style.setAttribute('type', 'text/css')
    $style.appendChild(document.createTextNode(css))
    document.head.appendChild($style)
  },
  __filename,
  'Inject global CSS. Used in tests.',
)

window.m = window.m || window._MGB_DEBUG

if (!Meteor.isProduction) {
  console.log(
    `%cMGB debug helpers enabled. Type '_MGB_DEBUG.help' or 'm.h' for short.`,
    'color: #00aa00; font-weight: bold; font-size: 14px;',
  )
}

export default registerDebugGlobal
