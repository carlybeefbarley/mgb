import React, { PropTypes } from 'react'
import { Popup, Label, Button, Segment } from 'semantic-ui-react'
import { Skills } from '/imports/schemas'
import { ReactMeteorData } from 'meteor/react-meteor-data'

const TaskApprove = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    asset: PropTypes.object.isRequired,
    ownerID: PropTypes.string.isRequired,
    handleTaskApprove: PropTypes.func.isRequired,
  },

  getMeteorData() {
    const sub = Meteor.subscribe('skills.userId', this.props.ownerID)

    return {
      ownerSkills: Skills.find(this.props.ownerID).fetch(),
      loading: !sub.ready(),
    }
  },

  render() {
    const { loading, ownerSkills } = this.data

    // no need to show button if we don't know asset owner skills
    if (loading) return <span />

    const slashSkillPath = this.props.asset.skillPath.replace(/\./gi, '/')
    const oSkills = ownerSkills[0][slashSkillPath]
    const hasSkill = oSkills && oSkills.length > 0 ? true : false
    const color = hasSkill ? 'green' : 'grey'
    const buttonText = hasSkill ? 'Remove Skill' : 'Approve Task'

    return (
      <Popup
        hoverable
        wide
        size="tiny"
        trigger={<Label basic size="small" icon={{ name: 'tasks', color }} content="task" />}
        position="bottom right"
      >
        <Popup.Header>Approve task</Popup.Header>
        <Popup.Content>
          <Segment basic>
            For comments use asset chat
            <Button
              as="div"
              onClick={() => this.props.handleTaskApprove(hasSkill)}
              size="tiny"
              style={{ margin: '1em 1em 0em 2em' }}
              compact
              icon="tasks"
              color={hasSkill ? 'red' : 'green'}
              content={buttonText}
            />
          </Segment>
        </Popup.Content>
      </Popup>
    )
  },
})

export default TaskApprove
