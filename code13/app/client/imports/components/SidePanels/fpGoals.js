import _ from 'lodash'
import React, { PropTypes } from 'react'
import { skillAreaItems } from '/imports/Skills/SkillAreas'
import SkillNodes from '/imports/Skills/SkillNodes/SkillNodes'
import ThingNotFound from '/client/imports/components/Controls/ThingNotFound'
import { Progress, Icon } from 'semantic-ui-react'
import { addJoyrideSteps } from '/client/imports/routes/App'
import QLink from "/client/imports/routes/QLink"

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

const _stopTutorial = () => addJoyrideSteps( [], { replace: true } )

const JoyrideSummary = ( { joyrideSteps, joyrideSkillPathTutorial, joyrideCurrentStepNum } ) => (
  (!joyrideSteps || !joyrideSteps.length) ? null : (
    <div className="ui card course">
      <div className="content">
        { /* <i className="right floated code icon" /> */ }
        <div className="header">{joyrideSteps[0].heading || joyrideSkillPathTutorial || "Current Tutorial..."}</div>
        <ol className="ui list">
          { joyrideSteps.map( (s, idx) => <li key={idx} className={ idx >= joyrideCurrentStepNum ? 'active' : 'complete'}>{s.title || `Step ${idx}`}</li> ) }
        </ol>
      </div>
      <div className="extra content">
        <Progress progress={false} size='small' color='green' value={1+joyrideCurrentStepNum} total={joyrideSteps.length} style={{marginBottom: 0}} />
        <a style={{float: 'right'}} onClick={_stopTutorial}>Stop Tutorial</a>
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
    joyrideCurrentStepNum:  PropTypes.number              // Step number (IFF joyrideSteps is not an empty array)
  },

  render: function () {
    const skillarea = 'code'    // temp hack
    const area = _.find(skillAreaItems, ['tag', skillarea] )
    const skillNode = SkillNodes[skillarea]

    if (!area)
      return <ThingNotFound type='Skill area' id={skillarea} />

    return (
      <div>
        <h3 style={{marginTop: 0, marginBottom: 20}}>
          {area.mascotName}'s Quests
          <div className="ui label large right floated" style={{float: 'right', opacity: '0.75'}}>0 / 114&nbsp;&nbsp;<i className="check circle icon" style={{marginRight: 0}} /></div>
        </h3>
        <p style={{fontSize: '1.25em'}}>
          <img src="/images/mascots/bigguy.png" style={{maxWidth: 70, float: 'left', marginRight: 15}} />
          <span style={{position: 'relative', top: 0}}>Your Learning quests</span>
        </p>
        <JoyrideSummary 
            joyrideSteps={this.props.joyrideSteps} 
            joyrideSkillPathTutorial={this.props.joyrideSkillPathTutorial}
            joyrideCurrentStepNum={this.props.joyrideCurrentStepNum} />

        <QLink to='/learn'>
          <button className="ui button large fluid"><Icon name='refresh' />Get more tasks</button>
        </QLink>
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