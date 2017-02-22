import _ from 'lodash'
import React, { PropTypes } from 'react'
import styles from '../home.css'
import QLink from '../QLink'
import { Divider, Grid, Card, Header, Image, Icon } from 'semantic-ui-react'

import { showToast } from '/client/imports/routes/App'
import { logActivity } from '/imports/schemas/activity'

import SkillNodes from '/imports/Skills/SkillNodes/SkillNodes'
import SkillsMap from '/client/imports/components/Skills/SkillsMap.js'

import { startSkillPathTutorial } from '/client/imports/routes/App'

const jsSkills = SkillNodes.code.js.lang
const skillItems = []
for (var key in jsSkills) {
  if (jsSkills.hasOwnProperty( key ) && key != '$meta') {
    let skill = _.cloneDeep( jsSkills[key]['$meta'] )
    skill.idx = key
    skill.skill = jsSkills[key].skill
    skillItems.push( skill )
  }
}


// console.log(
//   "graphic",
//   fileName,
//   projectName,
//   projectOwnerId,
//   projectOwnerName,
//   content2,
//   thumbnail,
//   this.assetLicense,
//   this.workState,
//   this.isCompleted,
// )
// // graphic fern_2.png null null null  content2 thumbnail MIT unknown false

const handleClick = (e, idx, code, currUser) => {
  // console.log(e, idx, code, currUser)

  const content2 = {}

  let newAsset = {
    name: 'tutorials.js.'+idx,
    kind: 'code',
    text: '',
    skillPath: 'code.js.lang.'+idx,
    assetLicense: 'MIT',
    workState: 'unknown',
    thumbnail: '',
    content2: { src: code.join('\n')},
    dn_ownerName: currUser.username,      
    isCompleted: false,
    isDeleted:   false,
    isPrivate:   false
  }

  console.log(newAsset)

  Meteor.call('Azzets.create', newAsset, (error, result) => {
    if (error) {
      showToast("cannot create Asset because: " + error.reason, 'error')
    } else {
      newAsset._id = result             // So activity log will work
      logActivity("asset.create",  `Created code tutorial`, null, newAsset)
      console.log(result)
    }
  })
}


// TODO pass as param createAsset function

const LearnCodeJsRoute = (props, context) => {
  const currUser = props.currUser

  // console.log(props)

  return (
    <Grid container columns='1'>
      <Divider hidden /> <Grid.Column>
      <Header as='h1' size='huge' style={{ fontSize: '2.5em' }}>
        JavaScript programming basics
        <em className="sub header">Click on item and explore it</em>
      </Header>
    </Grid.Column>
      <Grid.Column>
        <Card.Group itemsPerRow={1} stackable className="skills">
          { skillItems.map( (area, idx) => (
            <div key={idx} className='card animated fadeIn' style={cardStyle}
            onClick={ (e)=>{ handleClick(e, area.idx, area.code, currUser) } }>
              <Card.Content>
                <p style={descStyle}>
                  <i className={area.icon + " large icon"}></i>
                  { area.name}
                </p>

              </Card.Content>
            </div>
          ) ) }
        </Card.Group>
      </Grid.Column>
    </Grid>
  )
}

export default LearnCodeJsRoute

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
