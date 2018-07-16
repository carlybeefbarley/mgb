import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import SpecialGlobals from '/imports/SpecialGlobals'

const makeFriendlyName = (name, eName) => {
  if (name === '<top>') return `[GLOBAL] ${eName}`
  else return name ? name : 'Unknown'
}

export default class ExpressionDescription extends React.PureComponent{
  static propTypes = {
    expressionTypeInfo: PropTypes.object, // Has the data from a TernJS typeInfo request on an expression
  }

  render() {
    if (!this.props.expressionTypeInfo || !this.props.expressionTypeInfo.exprName) return null

    const { name, type, exprName, doc, url, origin } = this.props.expressionTypeInfo
    const colorGrey = { color: '#777' }
    const isFn = type.startsWith('fn(') ? '(...)' : ''

    const nameFriendly = makeFriendlyName(name, exprName)

    let docToDisplay = doc
    const sl = SpecialGlobals.editCode.mgbMentorPrefix.trim()

    if (doc && doc.trim().startsWith(sl)) {
      docToDisplay = ''
    }

    let typeFriendly = ''
    if (type.length > 300) {
      typeFriendly = name
    } else {
      typeFriendly =
        type.length > 30
          ? type
              .replace(/\{/gi, '{\n')
              .replace(/}/gi, '\n}')
              //.replace(/\(/gi,"(\n")
              //.replace(/\)/gi,"\n)")
              .replace(/ /gi, '')
              .replace(/,/gi, ',\n')
              .replace(/:/gi, ': ')
          : type
    }
    return (
      <div className="ui yellow segment" style={{ backgroundColor: 'rgba(255,255,0,0.03)' }}>
        <a className="ui orange left ribbon label">
          <code>
            {nameFriendly}
            {isFn}
          </code>
        </a>
        <a className="ui orange right corner label">
          <i className="help icon" />
        </a>
        <div className="ui header">
          <span style={colorGrey}>
            Reference <i>Expression</i>:
          </span>{' '}
          <code>
            {exprName}
            <span style={colorGrey}>{isFn}</span>
          </code>
        </div>
        <span style={colorGrey}>Name:</span> <code>{name || exprName}</code>
        <br />
        {type !== '?' && (
          <span>
            <span style={colorGrey}>Type:</span>{' '}
            <code style={{ whiteSpace: 'pre-wrap' }}>{typeFriendly}</code>
            <br />
          </span>
        )}
        {origin && (
          <p>
            <small>Part of '{origin}'</small>
          </p>
        )}
        {docToDisplay && <p style={{ whiteSpace: 'pre-line' }}>{docToDisplay}</p>}
        {url && (
          <p>
            <a target="_blank" href={url}>
              <small>{url}</small>
            </a>
          </p>
        )}
      </div>
    )
  }
}