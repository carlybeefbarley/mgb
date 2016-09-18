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

const WorkStateIcon = (props) => (
  <i className={`black ${workStateIcons[props.name]} icon`} style={{ margin: '0 0 0 -0.07em', fontSize: '1.25em'}}></i>
)

const WorkState = (props) => {
  const description = props.workState
  const labelSty = {
    marginBottom: "4px",
    textAlign: "left",
  }

  return (
    <span>
      <div className={`workstate ui ${workStateColors[props.workState]} ${props.showMicro ? "circular " : ""} label`}
          title={ props.canEdit ? null : description }
          ref={ (c) => { _initPopup(c, props.popupPosition, props.canEdit); this._popupInitiator = c } }>
          <WorkStateIcon name={props.workState} />
        { !props.showMicro && description }
      </div>
      { props.canEdit &&
        <div className="ui popup" style={{fontSize: '16px'}}>
          { props.showMicro &&
            <div className="ui left aligned header"><small>Quality level</small></div>
          }
          <div className="ui left aligned selection list">
          {
            _.map(workStateNames, (name,idx) => (
                <div
                  key={idx}
                  style={labelSty}
                  className={`ui item left aligned fluid ${workStateColors[name]} ${(name == props.workState) ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault()
                    $(this._popupInitiator).popup('hide')
                    props.canEdit && props.handleChange && props.handleChange(name)
                  }}>
                  <div className={`workstate ui ${workStateColors[name]} circular label`}
                      title={name}>
                      <WorkStateIcon name={name} />
                  </div>
                  &nbsp;&nbsp;
                  {name}
                </div>
              )
            )
          }
          </div>
        </div>
      }
    </span>
  )
}

WorkState.propTypes = _propTypes
export default WorkState
