import _ from 'lodash';
import React, { PropTypes } from 'react';


function makeFriendlyName(name, eName)
{
  if (name === '<top>')
    return `[GLOBAL] ${eName}`
  else
    return name
}

export default ExpressionDescription = React.createClass({
  propTypes: {
    expressionTypeInfo: PropTypes.object    // Has the data from a TernJS typeInfo request on an expression
  },


  render: function() {
    if (!this.props.expressionTypeInfo || !this.props.expressionTypeInfo.exprName)
      return null
    
    let {name, type, exprName, doc, url, origin} = this.props.expressionTypeInfo
    let colorGrey = {color: "#777"}          
    let isFn = type.startsWith("fn(") ? "(...)" : "";
    if (type === '?')
      return null
            
    
    let nameFriendly = makeFriendlyName(name, exprName);        
    
    return (
      <div className="ui yellow segment" style={{backgroundColor: "rgba(255,255,0,0.03)"}}>
        <a className="ui orange left ribbon label"><code>{nameFriendly}{isFn}</code></a>
        <a className="ui orange right corner label">
          <i className="help icon"></i>
        </a>
        <div className="ui header">
          <span style={colorGrey}>Reference <i>Expression</i>:</span> <code>{exprName}<span style={colorGrey}>{isFn}</span></code>
        </div>    
        <span style={colorGrey}>Type:</span>  <code>{type}</code><br></br>
        <span style={colorGrey}>Name:</span>  <code>{name}</code><br></br>
        { origin && <p><small>Part of '{origin}'</small></p> }
        { doc && <p style={{whiteSpace: 'pre-line'}}>{doc}</p> }
        { url && <p><a href={url}><small>{url}</small></a></p> }
      </div>
    )
  }
  
})
