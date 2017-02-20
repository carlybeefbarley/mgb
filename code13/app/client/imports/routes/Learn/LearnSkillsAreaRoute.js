import _ from 'lodash'
import React, { PropTypes } from 'react'
import styles from '../home.css'
import getStartedStyle from '../GetStarted.css'
import { Segment, Header, Image, Icon } from 'semantic-ui-react'
import { skillAreaItems } from '/imports/Skills/SkillAreas'
import SkillNodes from '/imports/Skills/SkillNodes/SkillNodes'
import ThingNotFound from '/client/imports/components/Controls/ThingNotFound'
import SkillsMap from '/client/imports/components/Skills/SkillsMap.js'
import { makeCDNLink } from '/client/imports/helpers/assetFetchers'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

const mascotStyle = {
  maxWidth: "8em",
  paddingRight: "0.5em",
  marginBottom: "0"
}

const headerStyle = {
  marginTop: "0.15em",
  marginBottom: "0.4em"
}

const descStyle = {
  fontSize: "1.25em",
  lineHeight: "1.5em"
}

const LearnSkillsAreaRoute = ( { currUser, params }, context ) => {    //props.params.skillarea

  const area = _.find(skillAreaItems, ['tag', params.skillarea] )
  const skillNode = SkillNodes[params.skillarea]
  if (!area)
    return <ThingNotFound type='Skill area' id={params.skillarea} />

  return (
    <Segment basic padded style={{margin: '0 auto'}}>
      <Image className='animated bounceInLeft' floated='left' style={mascotStyle} src={makeCDNLink(`/images/mascots/${area.mascot}.png`)} />
      <Header as='h2' style={headerStyle}><Icon name={area.icon} />&nbsp;{area.mascotName}'s {area.title} Quests</Header>
      <p style={descStyle}>{area.desc}.</p>
      <br />
      <Header as='h4' content={`${area.title} Skill tutorials will be here soon!`} />
      <ul>
        { _.map(skillNode, (v, k) => (k==='$meta' ? null : <li key={k}>{(v.$meta && v.$meta.name) ? v.$meta.name : k}</li>) ) }
      </ul>
      { currUser &&
        <SkillsMap user={currUser} userSkills={context.skills} ownsProfile={true} onlySkillArea={area.tag}/>
      }
    </Segment>
  )
}

LearnSkillsAreaRoute.contextTypes = {
  skills:       PropTypes.object       // skills for currently loggedIn user (not necessarily the props.user user)
}

export default LearnSkillsAreaRoute
