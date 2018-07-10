import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { skillAreaItems } from '/imports/Skills/SkillAreas'
import SkillCountsLabel from '/client/imports/components/Skills/SkillCountsLabel'
import ThingNotFound from '/client/imports/components/Controls/ThingNotFound'
import { Button, Divider, Header, List, Progress } from 'semantic-ui-react'
import { withStores } from '/client/imports/hocs'
import { joyrideStore } from '/client/imports/stores'
import QLink from '/client/imports/routes/QLink'
import { StartDefaultNextTutorial } from '/client/imports/components/Learn'
import UX from '/client/imports/UX'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

const JoyrideSummary = ({
  state: { isRunning, originatingAsset, step, steps, skillPathTutorial, stepIndex },
  stop,
}) =>
  !isRunning ? null : (
    <div className="ui fluid card course">
      <div className="content">
        {/* <i className="right floated code icon" /> */}
        <div className="header">{step.heading || skillPathTutorial || 'Current Tutorial...'}</div>
        <List ordered>
          {steps.map((s, idx) => (
            <List.Item
              key={idx}
              style={{ textDecoration: idx >= stepIndex ? 'none' : 'line-through' }}
              content={s.title || `Step ${idx}`}
            />
          ))}
        </List>
      </div>
      <div className="extra content">
        <Progress
          size="small"
          color="green"
          percent={Math.round(100 * (1 + stepIndex) / steps.length)}
          style={{ marginBottom: '0.256em' }}
        />
        {originatingAsset && (
          <QLink
            to={`/u/${originatingAsset.ownerName}/asset/${originatingAsset.id}`}
            style={{ float: 'left' }}
          >
            Edit Tutorial
          </QLink>
        )}
        <a style={{ float: 'right' }} onClick={stop}>
          Stop Tutorial
        </a>
      </div>
    </div>
  )

const fpGoals = React.createClass({
  propTypes: {
    currUser: PropTypes.object, // Currently Logged in user. Can be null/undefined
    user: PropTypes.object, // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    panelWidth: PropTypes.string.isRequired, // Typically something like "200px".
  },

  contextTypes: {
    skills: PropTypes.object, // skills for currently loggedIn user (not necessarily the props.user user)
  },

  render() {
    const skillarea = 'code' // temp hack
    const area = _.find(skillAreaItems, ['tag', skillarea])
    const { currUser, joyride } = this.props
    const { skills } = this.context

    if (!area) return <ThingNotFound type="Skill area" id={skillarea} />

    return (
      <div>
        <Header as="h3">
          {area.mascotName}'s Quests
          <SkillCountsLabel skills={skills} />
        </Header>
        <p style={{ overflow: 'hidden' }}>
          <img src={UX.makeMascotImgLink('bigguy')} style={{ maxWidth: '70px', float: 'left' }} />
          Your Learning quests
        </p>
        {!joyride.state.isRunning && <StartDefaultNextTutorial currUser={currUser} userSkills={skills} />}
        <JoyrideSummary {...joyride} />
        <Divider hidden clearing />
        <Button as={QLink} to="/learn" fluid icon="left arrow" labelPosition="left" content="All tutorials" />
      </div>
    )
  },
})

export default withStores({ joyride: joyrideStore })(fpGoals)
