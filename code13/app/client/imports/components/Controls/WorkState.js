import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { workStateNames, workStateIcons, statusIcons, statusColors } from '/imports/Enums/workStates'
import { Header, Label, Icon, List, Popup } from 'semantic-ui-react'
import './WorkState.css'

// Note that this is a Stateless function:
//   See https://facebook.github.io/react/docs/reusable-components.html

export const WorkStateIcon = ({ workState, size, onIconClick, labelStyle }) => (
  <Icon
    inverted
    name={workStateIcons[workState] || workStateIcons['unknown']}
    style={labelStyle}
    color="brown"
    size={size}
    onClick={onIconClick}
    className={`workstate-icon mgb-workstate-${workState}`}
  />
)

const _hiddenWorkstateStyle = { opacity: 0.1 }
export const WorkStateMultiSelect = ({ style, hideMask, handleChangeMask }) => (
  <div style={style}>
    {_.map(workStateNames, (workState, idx) => (
      <WorkState
        key={workState}
        workState={workState}
        popupPosition="bottom left"
        // Note that in JavaScript, & is logical-and
        labelStyle={(1 << idx) & hideMask ? _hiddenWorkstateStyle : null}
        onIconClick={() => handleChangeMask(hideMask ^ (1 << idx))}
      />
    ))}
  </div>
)

const WorkState = ({ workState, canEdit, size, popupPosition, handleChange, labelStyle, onIconClick }) => (
  <Popup
    on="hover"
    hoverable={!!canEdit} // So mouse-over popup keeps it visible for Edit for example
    position={popupPosition}
    trigger={
      <span>
        <WorkStateIcon size={size} workState={workState} labelStyle={labelStyle} onIconClick={onIconClick} />
      </span>
    }
  >
    <div>
      <Header content="Quality level" />
      <List selection>
        {_.map(
          workStateNames,
          name =>
            (canEdit || name == workState) && (
              <List.Item
                key={name}
                active={name == workState}
                onClick={e => {
                  e.preventDefault()
                  canEdit && handleChange && handleChange(name)
                }}
              >
                <WorkStateIcon size="large" workState={name} />
                <List.Content verticalAlign="middle">&nbsp;{name}</List.Content>
              </List.Item>
            ),
        )}
      </List>
    </div>
  </Popup>
)

const WorkStateStatus = ({ workState, labelStyle, iconOnly }) => (
  <span>
    {workState !== 'unknown' &&
      (iconOnly ? (
        <Icon
          circular
          inverted
          fitted
          size="small"
          title={workState}
          color={`${statusColors[workState]}`}
          name={`${statusIcons[workState]}`}
        />
      ) : (
        <Label className="workstate-label" style={labelStyle} color={`${statusColors[workState]}`}>
          <Icon name={statusIcons[workState]} />
          {workState}
        </Label>
      ))}
  </span>
)

WorkState.propTypes = {
  workState: PropTypes.string.isRequired, // E.g  "unknown"
  popupPosition: PropTypes.string.isRequired,
  handleChange: PropTypes.func, // Callback function - single param is new workState string. Only called if CanEdit is true
  canEdit: PropTypes.bool, // If false, then don't allow popup/change
}

WorkState.defaultProps = {
  popupPosition: 'bottom right',
}

export default WorkState
