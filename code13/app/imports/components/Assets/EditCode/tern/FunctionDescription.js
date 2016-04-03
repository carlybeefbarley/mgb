import React, { PropTypes } from 'react';


export default FunctionDescription = React.createClass({
  propTypes: {
    functionHelp: PropTypes.object,       // This is the data from ternServer.cachedArgHints
    functionArgPos: PropTypes.number,     // -1 means not valid since not in a call
    functionTypeInfo: PropTypes.object    // This is the return value from a Tern TYPE request. So we get doc, url etc
},

/** Make A Table
 * @param {array} hdrs - Array of Column Header strings to be displayed (or null)
 * @param {array} fields - Array of field names to match headers. "#" means 'display row number (1=first)'
 * @param {array} data - Array of objects (maybe) containing specified fields
 * @param {number} highlightRow - 0-based row index to highlight
 */
makeTable(hdrs, fields, data, highlightRow = undefined) {
  return ( 
    <table className="ui celled table">
      { !hdrs ? null : 
        <thead><tr>
        { hdrs.map( (h, colIdx) => { return <th key={colIdx}>{h}</th>})}
        </tr></thead>
      }
      <tbody>
        { data.map( (rowData, rowIdx) => { 
          return (
            <tr key={rowIdx} className={highlightRow === rowIdx ? "active": ""}>
            { fields.map( (fieldName, colIdx) => {
                return (
                  <td key={colIdx}>
                    {fieldName === "#" ? rowIdx+1 : <code>{rowData[fieldName]}</code>}
                  </td>
                )
              })
            }
            </tr>
            ) 
          })
        }
      </tbody>
    </table>
    
  )
},

render: function() {
  let fh = this.props.functionHelp;
  let argPos = this.props.functionArgPos;     // 0 for first argument, -1 for Not in a function at all
  
  if (!fh || _.isEmpty(fh) ||  argPos === -1)
    return null;

  let {name, origin} = this.props.functionTypeInfo;     // eg Phaser.Game, phaser    
  let { doc, url} = this.props.functionTypeInfo
  let colorGrey = {color: "#777"}        
  
  let knownTernBug = (typeof fh.start === 'number') ? <a href="https://github.com/codemirror/CodeMirror/issues/3934" className="ui compact negative message">MGB ISSUE: Non-patched codemirror/tern giving wrong start data</a> : null
          
  return (
    <div className="ui segment">
      <div className="ui header">
        <span style={colorGrey}>Invoking <i>Function</i>:</span> <code>{fh.name}()</code>
      </div>    
      {knownTernBug}
      { name && <p><code>{name}()</code><small><br></br>Part of '{origin}'</small></p>}
      { doc && <p>{doc}</p> }
      { url && <p><a href={url}><small>{url}</small></a></p> }
        <span style={colorGrey}>This <i>function</i> will return data of type: </span> {fh.type.rettype ? <code>{fh.type.rettype}</code> : <span><code>null</code> <small style={colorGrey}>(the function does not return a value)</small></span>}
        { fh.type.args.length === 0 ? 
            <div className="ui content">(function takes no parameters)</div>
            :
            this.makeTable( ["Parameter position", "Parameter name", "Parameter type"],["#","name","type"], fh.type.args, argPos)
        }   
    </div>)
  }
  
  
  
})