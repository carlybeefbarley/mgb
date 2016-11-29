import _ from 'lodash'
import React from 'react'
import styles from './home.css'
import getStartedStyle from './GetStarted.css'
import { Segment, Header, Image, Icon } from 'semantic-ui-react'
import { skillAreaItems } from '/imports/Skills/SkillAreas'
import SkillNodes from '/imports/Skills/SkillNodes/SkillNodes'
import ThingNotFound from '/client/imports/components/Controls/ThingNotFound'

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

const GetStartedSkillsAreaRoute = ( { params } ) => {    //props.params.skillarea

  const area = _.find(skillAreaItems, ['tag', params.skillarea] )
  const skillNode = SkillNodes[params.skillarea]
  if (!area)
    return <ThingNotFound type='Skill area' id={params.skillarea} />

  return (
    <Segment basic padded className="slim" style={{margin: '0 auto'}}>
      <Image className='animated bounceInLeft' floated='left' style={mascotStyle} src={`/images/mascots/${area.mascot}.png`} />
      <Header as='h2' style={headerStyle}><Icon name={area.icon} />&nbsp;{area.title}</Header>
      <p style={descStyle}>{area.desc}.</p>
      <br />
      <Header as='h4' content="Skill tutorials are coming soon..." />
      <p>The skills tutorials are being developed right now. Expect skills tutorials covering the following topics</p>
      <ul>
        { _.map(skillNode, (v, k) => (k==='$meta' ? null : <li key={k}>{(v.$meta && v.$meta.description) ? v.$meta.description : k}</li>) ) }
      </ul>
    </Segment>
  )
}

export default GetStartedSkillsAreaRoute