import React, { PropTypes } from 'react'

// Note that this is a Stateless function: https://facebook.github.io/react/docs/reusable-components.html 

const ThingNotFound = (props) => 
  <div className="ui segment">
    <div className="ui error message">
      <div className="header">
        {props.type} not found
      </div>
      <p>{props.type} {props.id ? `'${props.id}' `: ''} does not exist. Weird. </p>
    </div>
  </div>


ThingNotFound.propTypes = {
  type: PropTypes.string.isRequired,     // E.g  "User"
  id:   PropTypes.string                 // e.g a98uqeihuca
}
export default ThingNotFound