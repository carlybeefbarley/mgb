import React, { PropTypes } from 'react'
import { Message, Icon } from 'semantic-ui-react'

import QLink from '/client/imports/routes/QLink'
import SkillsMap from '/client/imports/components/Skills/SkillsMap'
import SkillCountsLabel from '/client/imports/components/Skills/SkillCountsLabel'
import UX from '/client/imports/UX'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

export default fpSkills = React.createClass({

  propTypes: {
    currUser: PropTypes.object             // Currently Logged in user. Can be null/undefined
  },

  contextTypes: {
    skills: PropTypes.object       // skills for currently loggedIn user (not necessarily the props.user user)
  },

  render: function () {
    const { currUser } = this.props
    const { skills } = this.context

    if (!currUser) 
      return <Message warning content='You must be logged in to see your skills status' />

    return (
      <div>
        <QLink to={`/u/${currUser.username}/skilltree`}>
          <h3 style={{marginTop: 0, marginBottom: 20}}>
            {currUser.username}'s Skills
            <SkillCountsLabel skills={skills} />
          </h3>
        </QLink>
        <p>
          <img src={UX.makeMascotImgLink('whale')} style={{maxWidth: '70px', float: 'left'}} />
          This is your learning progress via tutorials, muted help, assessed tasks etc...
        </p>

        <SkillsMap expandable toggleable skills={skills} />

        <QLink to='/learn/skills' style={{clear: 'both'}}>
          <button className='ui button large fluid'><Icon name='refresh' />Learn skills</button>
        </QLink>
      </div>
    )
  }
})
