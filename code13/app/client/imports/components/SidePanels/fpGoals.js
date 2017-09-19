import _ from 'lodash'
import React, { PropTypes } from 'react'
import { skillAreaItems } from '/imports/Skills/SkillAreas'
import SkillCountsLabel from '/client/imports/components/Skills/SkillCountsLabel'
import ThingNotFound from '/client/imports/components/Controls/ThingNotFound'
import { Button, Divider, Header, List, Progress } from 'semantic-ui-react'
import { stopCurrentTutorial } from '/client/imports/routes/App'
import QLink from '/client/imports/routes/QLink'
import { StartDefaultNextTutorial } from '/client/imports/routes/Learn/LearnGetStartedRoute'
import UX from '/client/imports/UX'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

const JoyrideSummary = ({
  joyrideSteps,
  joyrideSkillPathTutorial,
  joyrideCurrentStepNum,
  joyrideOriginatingAssetId,
}) =>
  !joyrideSteps || !joyrideSteps.length ? null : (
    <div className="ui fluid card course">
      <div className="content">
        {/* <i className="right floated code icon" /> */}
        <div className="header">
          {joyrideSteps[0].heading || joyrideSkillPathTutorial || 'Current Tutorial...'}
        </div>
        <List ordered>
          {joyrideSteps.map((s, idx) => (
            <List.Item
              key={idx}
              style={{ textDecoration: idx >= joyrideCurrentStepNum ? 'none' : 'line-through' }}
              content={s.title || `Step ${idx}`}
            />
          ))}
        </List>
      </div>
      <div className="extra content">
        <Progress
          size="small"
          color="green"
          percent={Math.round(100 * (1 + joyrideCurrentStepNum) / joyrideSteps.length)}
          style={{ marginBottom: '0.256em' }}
        />
        {joyrideOriginatingAssetId && (
          <QLink
            to={`/u/${joyrideOriginatingAssetId.ownerName}/asset/${joyrideOriginatingAssetId.id}`}
            style={{ float: 'left' }}
          >
            Edit Tutorial
          </QLink>
        )}
        <a style={{ float: 'right' }} onClick={stopCurrentTutorial}>
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
    joyrideSteps: PropTypes.array, // As passed to Joyride. If non-empty, a joyride is active
    joyrideSkillPathTutorial: PropTypes.string, // Null, unless it is one of the builtin skills tutorials which is currently active
    joyrideOriginatingAssetId: PropTypes.object, // Used to support nice EditTutorial button in fpGoals ONLY. Null, or, if set, an object: origAsset: { ownerName: asset.dn_ownerName, id: asset._id }. THIS IS NOT USED FOR LOAD, JUST FOR OTHER UI TO ENABLE A EDIT-TUTORIAL BUTTON
    joyrideCurrentStepNum: PropTypes.number, // Step number (IFF joyrideSteps is not an empty array)
  },

  contextTypes: {
    skills: PropTypes.object, // skills for currently loggedIn user (not necessarily the props.user user)
  },

  render() {
    const skillarea = 'code' // temp hack
    const area = _.find(skillAreaItems, ['tag', skillarea])
    const {
      currUser,
      joyrideSteps,
      joyrideSkillPathTutorial,
      joyrideCurrentStepNum,
      joyrideOriginatingAssetId,
    } = this.props
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
        {(!joyrideSteps || joyrideSteps.length === 0) && (
          <StartDefaultNextTutorial currUser={currUser} userSkills={skills} />
        )}
        <JoyrideSummary
          joyrideSteps={joyrideSteps}
          joyrideSkillPathTutorial={joyrideSkillPathTutorial}
          joyrideCurrentStepNum={joyrideCurrentStepNum}
          joyrideOriginatingAssetId={joyrideOriginatingAssetId}
        />
        <Divider hidden clearing />
        <Button as={QLink} to="/learn" fluid icon="left arrow" labelPosition="left" content="All tutorials" />
      </div>
    )
  },
})

export default fpGoals
