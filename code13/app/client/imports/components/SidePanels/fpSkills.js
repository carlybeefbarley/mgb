import React, { PropTypes } from 'react'
import { Button, Divider, Header, Message } from 'semantic-ui-react'

import QLink from '/client/imports/routes/QLink'
import SkillsMap from '/client/imports/components/Skills/SkillsMap'
import SkillCountsLabel from '/client/imports/components/Skills/SkillCountsLabel'
import UX from '/client/imports/UX'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

const fpSkills = React.createClass({
  propTypes: {
    currUser: PropTypes.object, // Currently Logged in user. Can be null/undefined
  },

  contextTypes: {
    skills: PropTypes.object, // skills for currently loggedIn user (not necessarily the props.user user)
  },

  render() {
    const { currUser, isSuperAdmin } = this.props
    const { skills } = this.context

    if (!currUser) return <Message warning content="You must be logged in to see your skills status" />

    return (
      <div>
        <Header as="h3">
          <QLink to={`/u/${currUser.username}/skilltree`}>My Skills</QLink>
          <SkillCountsLabel skills={skills} />
        </Header>
        <p style={{ overflow: 'hidden' }}>
          <img src={UX.makeMascotImgLink('whale')} style={{ maxWidth: '70px', float: 'left' }} />
          This is your learning progress via tutorials, muted help, assessed tasks etc...
        </p>

        <SkillsMap isSuperAdmin={isSuperAdmin} expandable labeled skills={skills} />

        <Divider hidden />

        <Button as={QLink} to="/learn/skills" size="large" fluid icon="refresh" content="Learn skills" />
      </div>
    )
  },
})

export default fpSkills
