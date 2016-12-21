import React, { PropTypes } from 'react'
import { Message, Icon } from 'semantic-ui-react'
import { maxSkillsCount } from '/imports/Skills/SkillNodes/SkillNodes'

import QLink from "/client/imports/routes/QLink"
import SkillsMap from '/client/imports/components/Skills/SkillsMap.js'
import { countCurrentUserSkills } from '/imports/schemas/skills'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]


export default fpSkills = React.createClass({

  propTypes: {
    currUser:               PropTypes.object             // Currently Logged in user. Can be null/undefined
  },

  contextTypes: {
    skills:       PropTypes.object       // skills for currently loggedIn user (not necessarily the props.user user)
  },

  render: function ( ) {
    const { currUser } = this.props
    const { skills } = this.context
  
    if (!currUser)
      return <Message warning content="You must be logged in to see your skills status" />

    const mySkillCount = countCurrentUserSkills(skills)

    return (
      <div>
        <h3 style={{marginTop: 0, marginBottom: 20}}>
          {currUser.username}'s Skills
          <div className="ui label large right floated" style={{float: 'right', opacity: '0.75'}}>{mySkillCount} / {maxSkillsCount}&nbsp;&nbsp;<i className="minus circle icon" style={{marginRight: 0}} /></div>
        </h3>
        <p >
          <img src="/images/mascots/whale.png" style={{maxWidth: 70, float: 'left', marginRight: 15}} />
          <QLink to={`/u/${currUser.username}/skilltree`} style={{clear: 'both'}} style={{fontSize: '1.25em'}}>
            <span style={{position: 'relative', top: 0}}>My Skills</span>
          </QLink>
          <br />
          <small><i>&emsp;...coming soon - better UI for this, and correlation from skill-tag to tutorials and contextual help...</i></small>
        </p>
        
        <div style={{clear: 'both'}}>
          <SkillsMap user={currUser} userSkills={skills} ownsProfile={true}/>
        </div>

        <QLink to='/learn/skills' style={{clear: 'both'}}>
          <button className="ui button large fluid"><Icon name='refresh' />Learn skills</button>
        </QLink>
      </div>
    )
  }
})