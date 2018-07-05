import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import {
  workStates,
  workStateColors,
  workStateIcons,
  statusIcons,
  assignmentStatuses,
  statusTitles,
} from '/imports/Enums/workStates'
import { Header, Label, Icon, List, Popup } from 'semantic-ui-react'
import './WorkState.css'

// Note that this is a Stateless function:
//   See https://facebook.github.io/react/docs/reusable-components.html

export const WorkStateIcon = ({ workState, size, onIconClick, color, labelStyle }) => (
  <span>
    {_.includes(workStates, workState) &&
    workState !== 'unknown' && (
      <Icon
        name={workStateIcons[workState]}
        style={labelStyle}
        color={color}
        size={size}
        onClick={onIconClick}
        className={`workstate-icon mgb-workstate-${workState}`}
      />
    )}
  </span>
)

const _hiddenWorkstateStyle = { opacity: 0.1 }
export const WorkStateMultiSelect = ({ style, hideMask, handleChangeMask }) => (
  <div style={style}>
    {_.map(workStates, (workState, idx) => (
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

const WorkState = ({
  workState,
  isAssignment,
  canEdit,
  size,
  popupPosition,
  handleChange,
  labelStyle,
  onIconClick,
  iconOnly,
  isTeacher,
  handleWorkStateCancel,
}) => (
  <div>
    {_.includes(workStates, workState) && workState !== 'unknown' && isAssignment ? (
      <WorkStateStatus
        iconOnly={iconOnly}
        isTeacher={isTeacher}
        canEdit={canEdit}
        workState={workState}
        color={workStateColors[workState]}
        handleWorkStateCancel={handleWorkStateCancel}
      />
    ) : (
      <Popup
        on="hover"
        hoverable={!!canEdit} // So mouse-over popup keeps it visible for Edit for example
        position={popupPosition}
        trigger={
          <WorkStateIcon
            color={workStateColors[workState]}
            size={size}
            workState={workState}
            labelStyle={labelStyle}
            onIconClick={onIconClick}
          />
        }
      >
        <div>
          <Header content="Quality level" />
          <List selection>
            {_.map(
              workStates,
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
                    <WorkStateIcon color={workStateColors[workState]} size="large" workState={name} />
                    <List.Content verticalAlign="middle">&nbsp;{name}</List.Content>
                  </List.Item>
                ),
            )}
          </List>
        </div>
      </Popup>
    )}
  </div>
)

const WorkStateStatus = ({
  workState,
  labelStyle,
  color,
  iconOnly,
  isTeacher,
  canEdit,
  handleWorkStateCancel,
}) => (
  <span>
    {iconOnly ? (
      <Icon
        circular
        inverted
        fitted
        size="small"
        title={workState}
        color={color}
        name={statusIcons[assignmentStatuses[workState]]}
      />
    ) : (
      <Label
        className="workstate-label"
        style={{ verticalAlign: 'middle', margin: '5px', ...labelStyle }}
        color={color}
        size="large"
        title={statusTitles[assignmentStatuses[workState]]}
      >
        <Icon name={statusIcons[assignmentStatuses[workState]]} />
        {assignmentStatuses[workState]}
        {workState === 'broken' ? (
          canEdit && <Icon title="Cancel" color="red" onClick={() => handleWorkStateCancel()} name="delete" />
        ) : (
          isTeacher && (
            <Icon title="Cancel" color="red" onClick={() => handleWorkStateCancel()} name="delete" />
          )
        )}
      </Label>
    )}
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
