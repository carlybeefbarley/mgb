import _ from 'lodash'
import React, { PropTypes } from 'react'
import styles from '../home.css'
import { utilPushTo } from "/client/imports/routes/QLink"
import { Divider, Grid, Header, List, Segment } from 'semantic-ui-react'

import { showToast } from '/client/imports/routes/App'
import { logActivity } from '/imports/schemas/activity'

import SkillNodes from '/imports/Skills/SkillNodes/SkillNodes'
import SkillsMap from '/client/imports/components/Skills/SkillsMap.js'
// TODO make this dynamic
import tutorialObject from '/public/codeTutorialsPhaser.json'

import { getAssetBySelector } from '/client/imports/helpers/assetFetchers'


const phaserSkills = SkillNodes.code.js.phaser
const skillItems = []
for (var key in phaserSkills) {
  if (phaserSkills.hasOwnProperty( key ) && key != '$meta') {
    let skill = _.cloneDeep( phaserSkills[key]['$meta'] )
    skill.idx = key
    skillItems.push( skill )
  }
}

const handleClick = (e, idx, code, currUser) => {
  const newTab = (e.buttons == 4 || e.button == 1)
  StartJsGamesRoute(idx, code, currUser, newTab)
}

export const StartJsGamesRoute = (name, code, currUser, newTab) => {
  if (!currUser)
  {
    showToast( 'You must be logged in to use these tutorials', 'info')
    return
  }

  const newAsset = {
    name: 'tutorials.phaser.' + name,
    kind: 'code',
    isDeleted: false,
    dn_ownerName: currUser.username
  }

  // check if asset exists
  getAssetBySelector(newAsset, (asset, err) => {
    if (asset)  // asset exists. open it.
    {  
      const url = `/u/${asset.dn_ownerName}/asset/${asset._id}`
      openUrl(url, newTab)
    }
    else        // asset doesn't exist. create one.
    {  
      newAsset.skillPath = 'code.js.phaser.' + name
      newAsset.content2 = { src: code }
      newAsset.isCompleted = false
      newAsset.isPrivate = false

      Meteor.call( 'Azzets.create', newAsset, (error, result) => {
        if (error) {
          showToast( "cannot create Asset because: " + error.reason, 'error' )
          return
        }
        newAsset._id = result             // So activity log will work
        logActivity( "asset.create", 'Created game tutorial', null, newAsset )
        const url = `/u/${currUser.username}/asset/${newAsset._id}`

        openUrl(url, newTab)
      })
    }
  })
}

const openUrl = (url, newTab) => {
  if (newTab)
    window.open( window.location.origin + url )
  else
    utilPushTo( window.location, url )
}

const LearnCodePhaserRoute = ({ currUser }, context) => {
  return (
    <Grid container columns='1'>
      <Divider hidden />
      <Grid.Column>
        <Header as='h1'>
          Game development concepts
          <Header.Subheader>
            These concept tutorials use the 'PhaserJS' game engine for JavaScript. However, these are fundamental concepts that will apply to any game engine you use in future.
          </Header.Subheader>
        </Header>
        { currUser && (
          <div style={{ clear: 'both' }}>
            <SkillsMap user={currUser} subSkill={true} onlySkillArea={'code.js.phaser'} userSkills={context.skills} ownsProfile={true} />
          </div>
        )}
      </Grid.Column>
      <Grid.Column>
        <Segment padded piled>
          <List size='large' relaxed='very' link className="skills">
            { skillItems.map( (area, idx) => {
              let skillPath = 'code/js/phaser/' + area.idx + '/' + area.idx
              const isComplete = currUser && !_.isEmpty( context.skills[skillPath] )
              const code = tutorialObject[area.idx].steps[0].code

              return (
                <List.Item
                  key={idx}
                  as={'a'} // isComplete ? 'div' : 'a'}
                  //disabled={isComplete}
                  onClick={ (e) => handleClick( e, area.idx, code, currUser ) }
                  icon={isComplete ? { name: 'checkmark', color: 'green' } : area.icon}
                  header={isComplete ? null : area.name}
                  content={isComplete ? area.name : area.description}
                />
              )
            } ) }
          </List>
        </Segment>
      </Grid.Column>
    </Grid>
  )
}

LearnCodePhaserRoute.contextTypes = {
  skills: PropTypes.object       // skills for currently loggedIn user (not necessarily the props.user user)
}

export default LearnCodePhaserRoute
