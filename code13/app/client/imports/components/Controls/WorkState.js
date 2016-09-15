import _ from 'lodash'
import React, { PropTypes } from 'react'
import { workStateNames, workStateColors } from '/imports/Enums/workStates'

// Note that this is a Stateless function: 
//   See https://facebook.github.io/react/docs/reusable-components.html 

const _propTypes = {
  workState:    PropTypes.string.isRequired,      // E.g  "unknown"
  handleChange: PropTypes.func,                   // Callback function - single param is new workState string. Only called if CanEdit is true
  canEdit:      PropTypes.bool                    // If false, then don't allow popup/change
}

const _initPopup = (c) => (
  c && $(c).popup( {
    on: "click", 
    inline: true, 
    closable: true,
    position: "bottom right"
  })
)

const WorkState = (props) => 
  <span>
    <div  className={`ui ${workStateColors[props.workState]} label`}
          ref={ (c) => { props.canEdit && _initPopup(c); this._popupInitiator = c } }>
      Quality: { props.workState }
    </div>
    { props.canEdit && 
      <div className="ui popup">
        { 
          _.map(workStateNames, (name,idx) => {
            return (
              <div key={idx} className="ui labels">
                <div 
                  className={`ui fluid ${workStateColors[name]} label`}
                  onClick={() => { 
                    $(this._popupInitiator).popup('hide')
                    props.canEdit && props.handleChange && props.handleChange(name)
                  }}>
                  {name} 
                  <div className="detail">
                    <i className={(name === props.workState) ? "black checkmark icon" : "icon"} />
                  </div>
                </div>
              </div>
            )
          }) 
        }
      </div>
    }
  </span>

WorkState.propTypes = _propTypes
export default WorkState