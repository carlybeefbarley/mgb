import style from './WorkState.css'
import _ from 'lodash'
import React, { PropTypes } from 'react'
import { workStateNames, workStateColors, workStateIcons } from '/imports/Enums/workStates'
import { Header, Icon, Label, List, Popup } from 'semantic-ui-react'

// Note that this is a Stateless function:
//   See https://facebook.github.io/react/docs/reusable-components.html

const WorkStateIcon = (props) => (
  <Icon name={workStateIcons[props.name]} color='black' style={{ margin: '0 0 0 -0.07em', fontSize: '1.25em'}} />
)

const labelSty = {
  marginBottom: "4px",
  textAlign: "left",
  whiteSpace: "nowrap"
}

const WorkState = (props) => {
  const { workState } = props

  return (
      <Popup
        on="hover"
        hoverable={props.canEdit}    // So mouse-over popup keeps it visible for Edit for example
        positioning={props.popupPosition}
        trigger={(
          <Label circular={props.showMicro} size='small' color={workStateColors[props.workState]} className='workstate'>
            <WorkStateIcon name={props.workState} />
            { !props.showMicro && workState }
          </Label>
        )}
      >
        { props.canEdit ? (
            <div>
              { props.showMicro && (
                <Header textAlign="left">
                  <small>Quality level</small>
                </Header>
              )}
              <List selection>
                {_.map(workStateNames, (name, idx) => (
                  <List.Item
                    key={idx}
                    style={labelSty}
                    color={workStateColors[name]}
                    active={name == props.workState}
                    onClick={(e) => {
                      e.preventDefault()
                      props.canEdit && props.handleChange && props.handleChange(name)
                    }}>
                    <Label circular color={workStateColors[name]} className='workstate' title={name}>
                      <WorkStateIcon name={name} />
                    </Label>
                    &nbsp;&nbsp;
                    {name}
                  </List.Item>
                ))}
              </List>
            </div>
          ) : (
            `Quality=${workState}`
          ) }
      </Popup>
  )
}

WorkState.propTypes = {
  workState:      PropTypes.string.isRequired,      // E.g  "unknown"
  popupPosition:  PropTypes.string,
  showMicro:      PropTypes.bool,                   // If true then show really compactly (single char in circular label)
  handleChange:   PropTypes.func,                   // Callback function - single param is new workState string. Only called if CanEdit is true
  canEdit:        PropTypes.bool                    // If false, then don't allow popup/change
}

WorkState.defaultProps = {
  popupPosition: "bottom right",
}

export default WorkState
