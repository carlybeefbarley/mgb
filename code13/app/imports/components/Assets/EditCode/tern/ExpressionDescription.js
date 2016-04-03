import React, { PropTypes } from 'react';


export default ExpressionDescription = React.createClass({
  propTypes: {
    typeInfo: PropTypes.object    // Has the data from a TernJS typeInfo request on an expression
    },


  render: function() {
    if (!this.props.expressionTypeInfo || !this.props.expressionTypeInfo.exprName)
      return null
    
    let {name, type, exprName, doc, url, origin} = this.props.expressionTypeInfo
    let colorGrey = {color: "#777"}          
    let isFn = type.startsWith("fn(") ? "()" : "";
            
    return (
      <div className="ui segment">
        <div className="ui header">
          <span style={colorGrey}>Reference <i>Expression</i>:</span> <code>{exprName}<span style={colorGrey}>{isFn}</span></code>
        </div>    
        <span style={colorGrey}>Type:</span>  <code>{type}</code><br></br>
        <span style={colorGrey}>Name:</span>  <code>{name}</code><br></br>
        { origin && <p><small>Part of '{origin}'</small></p> }
        { doc && <p>{doc}</p> }
        { url && <p><a href={url}><small>{url}</small></a></p> }
      </div>
    )
  }
  
})