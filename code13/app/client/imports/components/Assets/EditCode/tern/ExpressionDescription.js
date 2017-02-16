import _ from 'lodash';
import React, { PropTypes } from 'react';
import SpecialGlobals from '/imports/SpecialGlobals'

function makeFriendlyName(name, eName)
{
  if (name === '<top>')
    return `[GLOBAL] ${eName}`
  else
    return name ? name : "Unknown"
}

export default ExpressionDescription = React.createClass({
  propTypes: {
    expressionTypeInfo: PropTypes.object    // Has the data from a TernJS typeInfo request on an expression
  },


  render: function() {
    if (!this.props.expressionTypeInfo || !this.props.expressionTypeInfo.exprName)
      return null

    const {name, type, exprName, doc, url, origin} = this.props.expressionTypeInfo
    const colorGrey = {color: "#777"}
    const isFn = type.startsWith("fn(") ? "(...)" : "";

    const nameFriendly = makeFriendlyName(name, exprName)

    let docToDisplay = doc
    const sl = SpecialGlobals.editCode.mgbMentorPrefix.singleLine.substring(2).trim()
    const ml = SpecialGlobals.editCode.mgbMentorPrefix.multiLine.substring(2).trim()

    if(doc && (doc.startsWith(sl) || doc.startsWith(ml)) ){
      docToDisplay = ''
    }

    let typeFriendly = ''
    if(type.length > 300){
      typeFriendly = name
    }
    else{
      typeFriendly = type.length > 30 ? type
        .replace(/\{/gi,"{\n")
        .replace(/}/gi,"\n}")
        //.replace(/\(/gi,"(\n")
        //.replace(/\)/gi,"\n)")
        .replace(/ /gi,"")
        .replace(/,/gi,",\n")
        .replace(/:/gi,": ") : type
    }
    return (
      <div className="ui yellow segment" style={{backgroundColor: "rgba(255,255,0,0.03)"}}>
        <a className="ui orange left ribbon label"><code>{nameFriendly}{isFn}</code></a>
        <a className="ui orange right corner label">
          <i className="help icon"></i>
        </a>
        <div className="ui header">
          <span style={colorGrey}>Reference <i>Expression</i>:</span> <code>{exprName}<span style={colorGrey}>{isFn}</span></code>
        </div>
        <span style={colorGrey}>Name:</span>  <code>{name || exprName}</code><br></br>
        { type !== '?' && <span><span style={colorGrey}>Type:</span>  <code style={{ whiteSpace: 'pre-wrap' }}>{typeFriendly}</code><br></br></span>}
        { origin && <p><small>Part of '{origin}'</small></p> }
        { docToDisplay && <p style={{whiteSpace: 'pre-line'}}>{docToDisplay}</p> }
        { url && <p><a href={url}><small>{url}</small></a></p> }
      </div>
    )
  }

})
