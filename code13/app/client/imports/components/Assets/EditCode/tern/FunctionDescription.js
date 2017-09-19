import _ from 'lodash'
import React, { PropTypes } from 'react'

const FunctionDescription = React.createClass({
  propTypes: {
    functionHelp: PropTypes.object, // This is the data from ternServer.cachedArgHints
    functionArgPos: PropTypes.number, // -1 means not valid since not in a call
    functionTypeInfo: PropTypes.object, // This is the return value from a Tern TYPE request. So we get doc, url etc
    helpDocJsonMethodInfo: PropTypes.object, // See DocsPhaser.js for example and schema and help functions
  },

  /** Make A Table
 * @param {array} headers - Array of Column Header strings to be displayed (or null)
 * @param {array} fields - Array of field names to match headers. "#" means 'display row number (1=first)'
 * @param {array} data - Array of objects (maybe) containing specified fields
 * @param {number} highlightRow - 0-based row index to highlight
 */
  makeTable(headers, fields, data, highlightRow = undefined) {
    let m = this.props.helpDocJsonMethodInfo
    // TODO: add extra description for the rest/spread arguments ... (three dots)
    return (
      <table className="ui very compact small celled table">
        {!headers ? null : (
          <thead>
            <tr>
              {headers.map((h, colIdx) => {
                return <th key={colIdx}>{h}</th>
              })}
            </tr>
          </thead>
        )}
        <tbody>
          {data.map((rowData, rowIdx) => {
            // TODO: We also have 'InlineHelp" -- maybe use this as a bolded version?
            var paramHelp =
              m && m.parameters && m.parameters.length > rowIdx
                ? m.parameters[rowIdx].help ||
                  m.parameters[rowIdx].inlineHelp ||
                  m.parameters[rowIdx].description
                : null
            return [
              <tr key={rowIdx} className={highlightRow === rowIdx ? 'active' : ''}>
                {fields.map((fieldName, colIdx) => {
                  let value = rowData[fieldName]
                  if (fieldName === 'name' && _.endsWith(value, '?')) {
                    value = value.substring(0, value.length - 1) + ' (optional)'
                  }

                  return <td key={colIdx}>{fieldName === '#' ? rowIdx + 1 : <code>{value}</code>}</td>
                })}
              </tr>,
              highlightRow === rowIdx && !!paramHelp ? (
                <tr>
                  <td className="active" colSpan={3}>
                    {paramHelp}
                    <br />
                  </td>
                </tr>
              ) : null,
            ]
          })}
        </tbody>
      </table>
    )
  },
  // beautify type - TODO: make nice indent for object like types
  beautifyType(type) {
    // for cases {}
    if (type.length < 3) {
      return type
    }
    return type
      .replace(/\{/gi, '{\n ')
      .replace(/,/gi, ',\n')
      .replace(/}/gi, '\n}\n')
  },
  render() {
    let fh = this.props.functionHelp
    let hDoc = this.props.helpDocJsonMethodInfo
    let argPos = this.props.functionArgPos // 0 for first argument, -1 for Not in a function at all

    if (!fh || _.isEmpty(fh) || argPos === -1) return null

    let { name, origin } = this.props.functionTypeInfo // eg Phaser.Game, phaser
    let { doc, url } = this.props.functionTypeInfo
    let colorGrey = { color: '#777' }
    let colorBlue = { color: 'navy' }

    // Return info
    let retInfoHelpText = null
    if (hDoc && hDoc.__typeIs === 'classConstructor')
      retInfoHelpText = (
        <span style={colorBlue}>
          This 'function' is actually a <i>class constructor</i> and should be called with{' '}
          <b>
            <code>
              <span style={{ color: 'purple' }}>new</span> {name}(...)
            </code>
          </b>{' '}
          so that it returns an <i>Object</i> that is a new <i>instance</i> of the <i>class</i>{' '}
          <code>{name}</code>
        </span>
      )
    else
      retInfoHelpText = (
        <span>
          <span style={colorGrey}>
            This <i>function</i> will return data of type:{' '}
          </span>
          {fh.type.rettype ? (
            <code style={{ whiteSpace: 'pre' }}>{this.beautifyType(fh.type.rettype)}</code>
          ) : (
            <span>
              <code>null</code> <small style={colorGrey}>(the function does not return a value)</small>
            </span>
          )}
        </span>
      )

    // Inheritance info
    let inheritanceInfoHelpText = null
    if (hDoc && hDoc.inherited === true && hDoc.inheritedFrom)
      inheritanceInfoHelpText = (
        <p>
          Inherited from <code>{hDoc.inheritedFrom}</code>
        </p>
      )

    let knownTernBug =
      typeof fh.start === 'number' ? (
        <a
          href="https://github.com/codemirror/CodeMirror/issues/3934"
          className="ui compact negative message"
        >
          MGB ISSUE: Non-patched codemirror/tern giving wrong start data
        </a>
      ) : null

    return (
      <div className="ui blue segment" style={{ backgroundColor: 'rgba(0,0,255,0.03)' }}>
        <div className="ui header">
          <span style={colorGrey}>
            Invoking <i>Function</i>:
          </span>{' '}
          <code>{fh.name}()</code>
        </div>
        {knownTernBug}
        {name && (
          <p>
            <code>{name}()</code>
            <small>
              <br />Part of '{origin}'
            </small>
          </p>
        )}
        {doc && <p>{doc}</p>}
        {url && (
          <p>
            <a href={url}>
              <small>{url}</small>
            </a>
          </p>
        )}
        {retInfoHelpText}
        {inheritanceInfoHelpText}
        {fh.type.args.length === 0 ? (
          <div className="ui content">(function takes no parameters)</div>
        ) : (
          this.makeTable(
            ['Parameter position', 'Parameter name', 'Parameter type'],
            ['#', 'name', 'type'],
            fh.type.args,
            argPos,
          )
        )}
      </div>
    )
  },
})

export default FunctionDescription
