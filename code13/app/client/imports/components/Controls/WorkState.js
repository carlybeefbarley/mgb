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
//import './WorkState.css'

// Note that this is a Stateless function:
//   See https://facebook.github.io/react/docs/reusable-components.html

export const WorkStateIcon = ({ circular, workState, size, onIconClick, color, labelStyle }) => (
  <Icon
    circular={circular}
    name={workStateIcons[workState] ? workStateIcons[workState] : workStateIcons['unknown']}
    style={labelStyle}
    color={color}
    size={!circular && size}
    onClick={onIconClick}
    className={`workstate-icon mgb-workstate-${workState}`}
  />
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
  circular,
  onIconClick,
  iconOnly,
  isTeacher,
  handleWorkStateCancel,
}) => (
  <span>
    {_.includes(workStates, workState) &&
      (isAssignment ? (
        <WorkStateStatus
          size={size}
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
            <span>
              <WorkStateIcon
                circular={circular}
                color={workStateColors[workState]}
                size={size}
                workState={workState}
                labelStyle={labelStyle}
                onIconClick={onIconClick}
              />
            </span>
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
                      <WorkStateIcon color={workStateColors[name]} size="large" workState={name} />
                      <List.Content verticalAlign="middle">&nbsp;{name}</List.Content>
                    </List.Item>
                  ),
              )}
            </List>
          </div>
        </Popup>
      ))}
  </span>
)

const WorkStateStatus = ({
  workState,
  labelStyle,
  color,
  iconOnly,
  isTeacher,
  canEdit,
  handleWorkStateCancel,
  size,
}) => (
  <span>
    {iconOnly ? (
      <Icon
        circular
        inverted
        fitted
        size="small"
        title={statusTitles[assignmentStatuses[workState]]}
        color={color}
        name={statusIcons[assignmentStatuses[workState]]}
      />
    ) : (
      <Label
        className="workstate-label"
        style={{ verticalAlign: 'middle', margin: '5px', ...labelStyle }}
        color={color}
        size={size ? size : 'large'}
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
