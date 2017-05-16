import React from 'react';

/**
 * Works as fallback mechanism in a case when ExpressionDescription fails to retrieve info
 * main purpose is to show info about arrays in format '[]'
 */
export default ExpressionDescription = ({typeDescription}) => {

  const name = typeDescription.name
  if (!typeDescription.def) {
    return null
  }
  const docToDisplay = typeDescription.def['!doc']
  const url = typeDescription.def['!url']

  return (
    <div className="ui yellow segment" style={{backgroundColor: "rgba(255,255,0,0.03)"}}>
      <a className="ui yellow left ribbon label"><code>{name}</code></a>
      <a className="ui yellow right corner label">
        <i className="help icon"/>
      </a>
      <div className="ui header">
        <span> <code>{name}</code> definition</span>
      </div>
      { docToDisplay && <p style={{whiteSpace: 'pre-line'}}>{docToDisplay}</p> }
      { url && <p><a target='_blank' href={url}>
        <small>{url}</small>
      </a></p> }
    </div>
  )
}
