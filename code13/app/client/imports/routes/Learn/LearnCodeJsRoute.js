import _ from 'lodash'
import React, { PropTypes } from 'react'
import styles from '../home.css'
import { utilPushTo } from "/client/imports/routes/QLink"
import { Divider, Grid, Header, List, Segment } from 'semantic-ui-react'

import { showToast } from '/client/imports/routes/App'
import { logActivity } from '/imports/schemas/activity'

import SkillNodes from '/imports/Skills/SkillNodes/SkillNodes'

// for convenience, extract out the skillItems' $meta content into a simple array
const skillItems = _.compact(_.map(SkillNodes.code.js.basics, (val, key) => (
  key === '$meta' ? null : { ...val['$meta'], idx: key, skill: val.skill, key: key }
)))

const handleClick = (e, idx, code, currUser) => {
  const newTab = (e.buttons == 4 || e.button == 1)
  StartCodeJsRoute(idx, code.join( '\n' ), currUser, newTab)
}

export const StartCodeJsRoute = (name, code, currUser, newTab) => {
  if (!currUser)
  {
    showToast( 'You must be logged in to use these tutorials', 'info')
    return
  }

  const newAsset = {
    name: 'tutorials.js.' + name,
    kind: 'code',
    skillPath: 'code.js.basics.' + name,
    content2: { src: code },
    isCompleted: false,
    isDeleted: false,
    isPrivate: false
  }

  Meteor.call( 'Azzets.create', newAsset, (error, result) => {
    if (error) {
      showToast( "cannot create Asset because: " + error.reason, 'error' )
      return
    }
    newAsset._id = result             // So activity log will work
    logActivity( "asset.create", 'Created code tutorial', null, newAsset )
    const url = `/u/${currUser.username}/asset/${newAsset._id}`

    if (newTab)
      window.open( window.location.origin + url )
    else
      utilPushTo( window.location, url )
  })
}

const LearnCodeJsRoute = ( { currUser } ) => (
  <Grid container columns='1'>
    <Divider hidden />
    <Grid.Column>
      <Header
        as='h1'
        content='JavaScript programming basics'
        subheader='Click on an item and explore it'
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
    <a
      href="https://github.com/freeCodeCamp/freeCodeCamp/blob/staging/LICENSE.md"
      target="_blank"
      data-tooltip={`FreeCodeCamp content copyrighted under "BSD 3-Clause License"`}
      style={ { color: "#999" } } >
        FreeCodeCamp license
    </a>
  </Grid>
)

export default LearnCodeJsRoute
