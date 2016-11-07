import _ from 'lodash'
import React from 'react'
import styles from './home.css'
import QLink from './QLink'
import getStartedStyle from './GetStarted.css'
import { Segment, Header, Image, Icon } from 'semantic-ui-react'
import { skillAreaItems } from '/imports/Skills/SkillAreas'
import ThingNotFound from '/client/imports/components/Controls/ThingNotFound'
const _notReallyWorkingYet = "These don't do anything yet.. but soon will! sorry for the psych!"

const cardStyle = {
  color: "#2e2e2e"
}

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
  if (!area)
    return <ThingNotFound type='Skill area' id={params.skillarea} />

  return (
    <Segment basic padded className="slim" style={{margin: '0 auto'}}>
      <Image className='animated bounceInLeft' floated='left' style={mascotStyle} src={`/images/mascots/${area.mascot}.png`} />
      <Header as='h2' style={headerStyle}><Icon name={area.icon} />&nbsp;{area.title}</Header>
      <p style={descStyle}>{area.desc}.</p>
      <br />
      <p>Coming very soon...</p>
      
    </Segment>
  )
}

export default GetStartedSkillsAreaRoute