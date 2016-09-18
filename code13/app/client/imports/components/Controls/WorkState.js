import _ from 'lodash'
import React, { PropTypes } from 'react'
import { workStateNames, workStateColors, workStateIcons } from '/imports/Enums/workStates'
import style from './WorkState.css'

// Note that this is a Stateless function:
//   See https://facebook.github.io/react/docs/reusable-components.html

const _propTypes = {
  workState:      PropTypes.string.isRequired,      // E.g  "unknown"
  popupPosition:  PropTypes.string,
  showMicro:      PropTypes.bool,                   // If true then show really compactly (single char in circular label)
  handleChange:   PropTypes.func,                   // Callback function - single param is new workState string. Only called if CanEdit is true
  canEdit:        PropTypes.bool                    // If false, then don't allow popup/change
}

const _initPopup = (c, popupPosition, isHoverable) => (
  c && $(c).popup( {
    on: "hover",
    hoverable: isHoverable,    // So mouse-over popup keeps it visible for Edit for example
    inline: true,
    closable: true,
    position: popupPosition || "bottom right",
    lastResort: "bottom right"
  })
)

const WorkState = (props) => {
  const description = `Quality: ${props.workState}`
  const labelSty = { marginBottom: "4px" }

  return (
    <span>
      <div className={`workstate ui ${workStateColors[props.workState]} ${props.showMicro ? "circular " : ""} label`}
          title={ props.canEdit ? null : description }
          ref={ (c) => { _initPopup(c, props.popupPosition, props.canEdit); this._popupInitiator = c } }>
          <i className={`black ${workStateIcons[props.workState]} icon`} style={{margin: '0'}}></i>
        { !props.showMicro && description }
      </div>
      { props.canEdit &&
        <div className="ui popup">
          { props.showMicro &&
            <div className="ui left aligned header"><small>Stated Quality is:</small></div>
          }
          {
            _.map(workStateNames, (name,idx) => (
                <div
                  key={idx}
                  style={labelSty}
                  className={`ui fluid ${workStateColors[name]} label`}
                  onClick={(e) => {
                    e.preventDefault()
                    $(this._popupInitiator).popup('hide')
                    props.canEdit && props.handleChange && props.handleChange(name)
                  }}>
                  {name}
                  <div className="detail">
                    <i className={(name === props.workState) ? "black checkmark icon" : "icon"} />
                  </div>
                </div>
              )
            )
          }
        </div>
      }
    </span>
  )
}

WorkState.propTypes = _propTypes
export default WorkState
