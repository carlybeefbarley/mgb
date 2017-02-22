import style from './WorkState.css'
import _ from 'lodash'
import React, { PropTypes } from 'react'
import { workStateNames, workStateIcons } from '/imports/Enums/workStates'
import { Header, Icon, List, Popup } from 'semantic-ui-react'

// Note that this is a Stateless function:
//   See https://facebook.github.io/react/docs/reusable-components.html

const WorkStateIcon = ( { workState, size } ) => (
  <Icon 
      name={workStateIcons[workState]} 
      circular
      color='black'
      size={size}
      className={`mgb-workstate-${workState}`} />
)

const WorkState = ( { workState, canEdit, popupPosition, handleChange } ) => (
  <Popup
      on='hover'
      hoverable={canEdit}    // So mouse-over popup keeps it visible for Edit for example
      positioning={popupPosition}
      trigger={(
        <span>
          <WorkStateIcon workState={workState} />
        </span>
      )} >
    { !canEdit ? `Quality=${workState}` : (
        <div>
          <Header content='Quality level' />
          <List selection>
            {_.map(workStateNames, name => (
              <List.Item
                  key={name}
                  active={name == workState}
                  onClick={(e) => {
                    e.preventDefault()
                    canEdit && handleChange && handleChange(name)
                  }}>
                <WorkStateIcon size='large' workState={name} />
                <List.Content verticalAlign='middle'>
                 &nbsp;{name}
                </List.Content>
              </List.Item>
            ))}
          </List>
        </div>
      )
    }
  </Popup>
)

WorkState.propTypes = {
  workState:      PropTypes.string.isRequired,      // E.g  "unknown"
  popupPosition:  PropTypes.string.isRequired,
  handleChange:   PropTypes.func,                   // Callback function - single param is new workState string. Only called if CanEdit is true
  canEdit:        PropTypes.bool                    // If false, then don't allow popup/change
}

WorkState.defaultProps = {
  popupPosition: "bottom right",
}

export default WorkState