import _ from 'lodash'
import React, { PropTypes } from 'react'
import { workStateNames } from '/imports/Enums/workStates'

// Note that this is a Stateless function: https://facebook.github.io/react/docs/reusable-components.html 

const WorkState = (props) => 
  <span>
    <div className="ui olive label" ref={(c) => { c && $(c).popup( {inline:true, position: "left center"}) }} >
      Quality: { props.workState }
    </div>
    <div className="ui popup">
      { _.map(workStateNames, (name,idx) => (<p key={idx}><div className="ui fluid label">{name} </div></p>)) }
    </div>
  </span>

WorkState.propTypes = {
  workState: PropTypes.string.isRequired,     // E.g  "unknown"
  canEdit:   PropTypes.bool                   // e.g false
}
export default WorkState