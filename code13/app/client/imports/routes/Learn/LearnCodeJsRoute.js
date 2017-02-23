import _ from 'lodash'
import React, { PropTypes } from 'react'
import styles from '../home.css'
import { utilPushTo } from "/client/imports/routes/QLink"
import { Divider, Grid, Header, List, Segment } from 'semantic-ui-react'

import { showToast } from '/client/imports/routes/App'
import { logActivity } from '/imports/schemas/activity'

import SkillNodes from '/imports/Skills/SkillNodes/SkillNodes'

const jsSkills = SkillNodes.code.js.basics
const skillItems = []
for (let key in jsSkills) {
  if (jsSkills.hasOwnProperty( key ) && key != '$meta') {
    let skill = _.cloneDeep( jsSkills[key]['$meta'] )
    skill.idx = key
    skill.skill = jsSkills[key].skill
    skillItems.push( skill )
  }
}

const handleClick = (e, idx, code, currUser) => {
  const newTab = (e.buttons == 4 || e.button == 1)

  let newAsset = {
    name: 'tutorials.js.' + idx,
    kind: 'code',
    skillPath: 'code.js.basics.' + idx,
    content2: { src: code.join( '\n' ) },
    dn_ownerName: currUser.username,
    isCompleted: false,
    isDeleted: false,
    isPrivate: false
  }

  Meteor.call( 'Azzets.create', newAsset, (error, result) => {
    if (error) {
      showToast( "cannot create Asset because: " + error.reason, 'error' )
    } else {
      newAsset._id = result             // So activity log will work
      logActivity( "asset.create", `Created code tutorial`, null, newAsset )

      const url = `/u/${currUser.username}/asset/${result}`

      if (newTab) {
        window.open( window.location.origin + url )
      } else {
        utilPushTo( window.location, url )
      }
    }
  } )
}

// TODO pass as param createAsset function

const LearnCodeJsRoute = (props, context) => {
  const currUser = props.currUser

  return (
    <Grid container columns='1'>
      <Divider hidden />
      <Grid.Column>
        <Header
          as='h1'
          content='JavaScript programming basics'
          subheader='Click on item and explore it'
        />
      </Grid.Column>
      <Grid.Column>
        <Segment padded piled>
          <List size='large' relaxed='very' link className="skills">
            { skillItems.map( (area, idx) => (
              <List.Item
                as='a'
                key={idx}
                header={area.name}
                icon={area.icon}
                onClick={ (e) => handleClick( e, area.idx, area.code, currUser ) }
              />
            ) ) }
          </List>
        </Segment>
      </Grid.Column>
    </Grid>
  )
}

export default LearnCodeJsRoute
