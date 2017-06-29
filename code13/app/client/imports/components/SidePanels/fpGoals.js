import _ from 'lodash'
import React, { PropTypes } from 'react'
import { skillAreaItems } from '/imports/Skills/SkillAreas'
import SkillCountsLabel from '/client/imports/components/Skills/SkillCountsLabel'
import ThingNotFound from '/client/imports/components/Controls/ThingNotFound'
import { Button, Divider, Header, Progress } from 'semantic-ui-react'
import { stopCurrentTutorial } from '/client/imports/routes/App'
import QLink from "/client/imports/routes/QLink"
import { StartDefaultNextTutorial } from '/client/imports/routes/Learn/LearnGetStartedRoute'
import UX from '/client/imports/UX'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

const JoyrideSummary = ( { joyrideSteps, joyrideSkillPathTutorial, joyrideCurrentStepNum, joyrideOriginatingAssetId } ) => (
  (!joyrideSteps || !joyrideSteps.length) ? null : (
    <div className="ui fluid card course">
      <div className="content">
        { /* <i className="right floated code icon" /> */ }
        <div className="header">{joyrideSteps[0].heading || joyrideSkillPathTutorial || "Current Tutorial..."}</div>
        <ol className="ui list">
          { joyrideSteps.map( (s, idx) => <li key={idx} className={ idx >= joyrideCurrentStepNum ? 'active' : 'complete'}>{s.title || `Step ${idx}`}</li> ) }
        </ol>
      </div>
      <div className="extra content">
        <Progress size='small' color='green' percent={Math.round((100*(1+joyrideCurrentStepNum)) / (joyrideSteps.length) )} style={{marginBottom: '0.256em'}} />
        { joyrideOriginatingAssetId &&
          <QLink to={`/u/${joyrideOriginatingAssetId.ownerName}/asset/${joyrideOriginatingAssetId.id}`} style={{float: 'left'}} >Edit Tutorial</QLink>
        }
        <a style={{float: 'right'}} onClick={stopCurrentTutorial}>Stop Tutorial</a>
      </div>
    </div>
  )
)

export default fpGoals = React.createClass({

  propTypes: {
    currUser:               PropTypes.object,             // Currently Logged in user. Can be null/undefined
    user:                   PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    panelWidth:             PropTypes.string.isRequired,  // Typically something like "200px".
    joyrideSteps:           PropTypes.array,              // As passed to Joyride. If non-empty, a joyride is active
    joyrideSkillPathTutorial: PropTypes.string,           // Null, unless it is one of the builtin skills tutorials which is currently active
    joyrideOriginatingAssetId: PropTypes.object,          // Used to support nice EditTutorial button in fpGoals ONLY. Null, or, if set, an object: origAsset: { ownerName: asset.dn_ownerName, id: asset._id }. THIS IS NOT USED FOR LOAD, JUST FOR OTHER UI TO ENABLE A EDIT-TUTORIAL BUTTON
    joyrideCurrentStepNum:  PropTypes.number              // Step number (IFF joyrideSteps is not an empty array)
  },

  contextTypes: {
    skills:       PropTypes.object       // skills for currently loggedIn user (not necessarily the props.user user)
  },

  render: function () {
    const skillarea = 'code'    // temp hack
    const area = _.find(skillAreaItems, ['tag', skillarea] )
    const { currUser, joyrideSteps, joyrideSkillPathTutorial, joyrideCurrentStepNum, joyrideOriginatingAssetId } = this.props
    const { skills } = this.context

    if (!area)
      return <ThingNotFound type='Skill area' id={skillarea} />

    return (
      <div>
        <Header as='h3'>
          {area.mascotName}'s Quests
          <SkillCountsLabel skills={skills} />
        </Header>
        <p style={{ overflow: 'hidden' }}>
          <img src={UX.makeMascotImgLink('bigguy')} style={{ maxWidth: '70px', float: 'left' }} />
          Your Learning quests
        </p>
        { (!joyrideSteps || joyrideSteps.length === 0) &&
          <StartDefaultNextTutorial currUser={currUser} userSkills={skills}  />
        }
        <JoyrideSummary
            joyrideSteps={joyrideSteps}
            joyrideSkillPathTutorial={joyrideSkillPathTutorial}
            joyrideCurrentStepNum={joyrideCurrentStepNum}
            joyrideOriginatingAssetId={joyrideOriginatingAssetId} />
        <Divider hidden clearing />
        <Button as={QLink} to='/learn' size="large" fluid icon='refresh' content='Get more tasks' />
      </div>
    )
  }
})


        // <h3 style={{marginTop: 0, marginBottom: 20}}>
        //   {area.mascotName}'s Quests
        //   <div className="ui label large right floated" style={{float: 'right', opacity: '0.75'}}>19 / 114&nbsp;&nbsp;<i className="check circle icon" style={{marginRight: 0}} /></div>
        // </h3>
        // <p style={{fontSize: '1.25em'}}>
        //   <img src="/images/mascots/bigguy.png" style={{maxWidth: 70, float: 'left', marginRight: 15}} />
        //   <span style={{position: 'relative', top: 0}}>Let's figure out how to show an animated sprite in Phaser!</span>
        // </p>
        // <div className="ui card complete" style={{opacity: 0.5}}>
        //   <div className="content">
        //     <i className="green right floated checkmark icon" />
        //     <div className="header" style={{marginBottom: 0}}>Load an image</div>
        //   </div>
        // </div>
        // <div className="ui card course">
        //   <div className="content">
        //     <i className="right floated code icon" />
        //     <div className="header">Display an image</div>
        //     <div className="description">
        //       <ol className="ui list">
        //         <li className="complete">Load an image</li>
        //         <li className="active">Create a sprite</li>
        //       </ol>
        //       <button className="ui active yellow button">
        //         <i className="student icon"></i>
        //         Show me
        //       </button>
        //     </div>
        //   </div>
        //   <div className="extra content">
        //     <div className="ui tiny green progress" data-percent={50} style={{marginBottom: 0}}>
        //       <div className="bar" />
        //     </div>
        //   </div>
        // </div>
        // <div className="ui link card">
        //   <div className="content">
        //     <i className="right floated paint brush icon" />
        //     <div className="header">Draw an animated sprite</div>
        //   </div>
        // </div>
        // <div className="ui link card">
        //   <div className="content">
        //     <i className="right floated code icon" />
        //     <div className="header">Load an animated sprite</div>
        //   </div>
        // </div>
        // <div className="ui link card">
        //   <div className="content">
        //     <i className="right floated paint brush icon" />
        //     <div className="header">Draw an animated sprite</div>
        //   </div>
        // </div>
