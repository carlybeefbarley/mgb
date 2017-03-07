import _ from 'lodash'
import React, { PropTypes } from 'react'
import styles from '../home.css'
import { utilPushTo } from "/client/imports/routes/QLink"
import { Divider, Grid, Header, List, Segment } from 'semantic-ui-react'

import { showToast } from '/client/imports/routes/App'
import { logActivity } from '/imports/schemas/activity'

import SkillNodes from '/imports/Skills/SkillNodes/SkillNodes'
import SkillsMap from '/client/imports/components/Skills/SkillsMap.js'

import { getAssetBySelector } from '/client/imports/helpers/assetFetchers'


// for convenience, extract out the skillItems' $meta content into a simple array
const skillItems = _.compact(_.map(SkillNodes.code.js.basics, (val, key) => (
  key === '$meta' ? null : { ...val['$meta'], idx: key, skill: val.skill, key: key }
)))

// Now partition it by 'subsection' key
const bySubsection = _.groupBy(skillItems, 'subsection')

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
      newAsset.skillPath = 'code.js.basics.' + name
      newAsset.content2 = { src: code }
      newAsset.isCompleted = false
      newAsset.isPrivate = false
    
      Meteor.call( 'Azzets.create', newAsset, (error, result) => {
        if (error) {
          showToast( "cannot create Asset because: " + error.reason, 'error' )
          return
        }
        newAsset._id = result             // So activity log will work
        logActivity( "asset.create", 'Created code tutorial', null, newAsset )
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

const LearnCodeJsRoute = ( { currUser }, context ) => (
  <Grid container columns='1'>
    <Divider hidden />
    <Grid.Column>
      <Header
        as='h1'
        content='JavaScript programming basics'
        subheader='Click on an item and explore it'
      />
      { currUser && (
        <div style={{ clear: 'both' }}>
          <SkillsMap user={currUser} subSkill={true} onlySkillArea={'code.js.basics'} userSkills={context.skills} ownsProfile={true} />
        </div>
      )}
    </Grid.Column>
    <Grid.Column>
      { _.map(_.keys(bySubsection), subkey => 
        <Segment padded piled key={subkey}>
          <Header as='h3' content={subkey}/>
          <List size='large' relaxed='very' link className="skills">
            { _.map(bySubsection[subkey],  (area, idx) => {

              let skillPath = 'code/js/basics/' + area.idx + '/' + area.idx
              const isComplete = currUser && !_.isEmpty( context.skills[skillPath] )

              return (
                <List.Item
                  as='a'
                  key={idx}
                  header={isComplete ? null : area.name}
                  content={isComplete ? area.name : null}
                  icon={isComplete ? { name: 'checkmark', color: 'green' } : area.icon}
                  onClick={ (e) => handleClick( e, area.idx, area.code, currUser ) }
                />
              ) 
            } ) }
          </List>
        </Segment>
        )
      }
    </Grid.Column>
    <a
      href="https://github.com/freeCodeCamp/freeCodeCamp/blob/staging/LICENSE.md"
      target="_blank"
      data-position='top left'
      data-tooltip={`FreeCodeCamp content copyrighted under "BSD 3-Clause License"`}
      style={ { float: 'right', color: "#999" } } >
        FreeCodeCamp license
    </a>
  </Grid>
)

LearnCodeJsRoute.contextTypes = {
  skills: PropTypes.object       // skills for currently loggedIn user (not necessarily the props.user user)
}

export default LearnCodeJsRoute
