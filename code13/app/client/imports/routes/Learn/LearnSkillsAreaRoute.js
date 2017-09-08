import _ from 'lodash'
import React, { PropTypes } from 'react'
import '../home.css'
import { Segment, Header, Icon, Label } from 'semantic-ui-react'
import UX from '/client/imports/UX'
import { skillAreaItems } from '/imports/Skills/SkillAreas'
import SkillNodes from '/imports/Skills/SkillNodes/SkillNodes'
import ThingNotFound from '/client/imports/components/Controls/ThingNotFound'
import SkillsMap from '/client/imports/components/Skills/SkillsMap'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

const mascotStyle = {
  maxWidth: '8em',
  paddingRight: '0.5em',
  marginBottom: '0',
}

const headerStyle = {
  marginTop: '0.15em',
  marginBottom: '0.4em',
}

const descStyle = {
  fontSize: '1.25em',
  lineHeight: '1.5em',
}

const LearnSkillsAreaRoute = ({ currUser, params }, context) => {
  //props.params.skillarea

  const area = _.find(skillAreaItems, ['tag', params.skillarea])
  const skillNode = SkillNodes[params.skillarea]
  if (!area) return <ThingNotFound type="Skill area" id={params.skillarea} />

  return (
    <Segment basic padded>
      <UX.ImageMascot
        className="animated bounceInLeft"
        floated="left"
        style={mascotStyle}
        mascotName={area.mascot}
      />
      <Header as="h2" style={headerStyle}>
        <Icon name={area.icon} />&nbsp;{area.mascotName}'s {area.title} Quests
      </Header>
      <p style={descStyle}>{area.desc}.</p>
      <p>
        <Label size="huge" color="orange" content="Area not yet available" />
      </p>
      <Header as="h3" style={{ clear: 'both' }}>
        Planned topics include...
      </Header>
      <ul>
        {_.map(
          skillNode,
          (v, k) => (k === '$meta' ? null : <li key={k}>{v.$meta && v.$meta.name ? v.$meta.name : k}</li>),
        )}
      </ul>
      {currUser && <SkillsMap skills={context.skills} expandable toggleable skillPaths={[area.tag]} />}
    </Segment>
  )
}

LearnSkillsAreaRoute.contextTypes = {
  skills: PropTypes.object, // skills for currently loggedIn user (not necessarily the props.user user)
}

export default LearnSkillsAreaRoute
