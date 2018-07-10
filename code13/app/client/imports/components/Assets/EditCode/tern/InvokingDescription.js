import React from 'react'

/**
 * Works as fallback mechanism in a case when ExpressionDescription fails to retrieve info
 * main purpose is to show info about arrays in format '[]'
 * @param typeDescription.name - name of the token type (e.g. Array / Object)
 *        typeDescription.def - related definitions as defined in the def files (e.g. public/lib/tern/defs/ecma5.json#Array)
 */
const ExpressionDescription = ({ typeDescription }) => {
  if (!typeDescription || !typeDescription.def) {
    return null
  }

  const name = typeDescription.name
  const docToDisplay = typeDescription.def['!doc']
  const url = typeDescription.def['!url']

  return (
    <div className="ui yellow segment" style={{ backgroundColor: 'rgba(255,255,0,0.03)' }}>
      <a className="ui yellow left ribbon label">
        <code>{name}</code>
      </a>
      <a className="ui yellow right corner label">
        <i className="help icon" />
      </a>
      <div className="ui header">
        <span>
          Invoking <code>{name}</code>
        </span>
      </div>
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

export default ExpressionDescription
