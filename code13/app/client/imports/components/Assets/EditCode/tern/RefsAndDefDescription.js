import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'

const RefsAndDefDescription = React.createClass({
  propTypes: {
    refsInfo: PropTypes.object, // This is the data from ternServer REFS request
    defInfo: PropTypes.object, // This is the data from ternServer DEFINITION request, plus 'definitionText'
    expressionTypeInfo: PropTypes.object, // This is the data frim ternserver TYPE request
  },

  render() {
    if (!this.props.refsInfo) return null

    let refs = this.props.refsInfo.refs

    let def = this.props.defInfo
    let origin = def ? def.origin : null

    let exprName = null,
      type = ''
    if (this.props.expressionTypeInfo && this.props.expressionTypeInfo.exprName) {
      exprName = this.props.expressionTypeInfo.exprName
      type = this.props.expressionTypeInfo.type
    }
    let colorGrey = { color: '#777' }

    let otherRefs = refs.length - 1
    let isFn = type.startsWith('fn(') ? '()' : ''

    if (otherRefs < 1) return null

    return (
      <div className="ui orange segment" style={{ backgroundColor: 'rgba(255, 165, 0, 0.06)' }}>
        {exprName && (
          <div className="ui header">
            <span style={colorGrey}>
              References and Definition of <i>Expression</i>
            </span>{' '}
            <code>
              {exprName}
              <span style={colorGrey}>{isFn}</span>
            </code>
          </div>
        )}
        {otherRefs === 1 ? (
          <p>
            There is 1 other reference to this variable/property.<br />
            <span style={colorGrey}>
              <small>Press CTRL-S to highlight it</small>
            </span>
          </p>
        ) : (
          <p>
            There are {otherRefs} other references to this variable/property.<br />
            <span style={colorGrey}>
              <small>Press CTRL-S to highlight them</small>
            </span>
          </p>
        )}
        {def &&
        def.start && (
          <p>
            The variable{' '}
            <code>
              {exprName}
              <span style={colorGrey}>{isFn}</span>
            </code>{' '}
            is defined on line {def.start.line + 1}.<br />
            {def.definitionText && (
              <span style={{ color: 'blue' }}>
                <code>
                  <small>{def.definitionText}</small>
                </code>
                <br />
              </span>
            )}
            <span style={colorGrey}>
              <small>Press CTRL-B to jump there, and you can use Alt-, to jump back again</small>
            </span>
          </p>
        )}
        {origin &&
        origin != '[doc]' && (
          <p>
            <small>Part of '{origin}'</small>
          </p>
        )}
      </div>
    )
  },
})

export default RefsAndDefDescription
