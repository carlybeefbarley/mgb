import _ from 'lodash'
import React, { PropTypes } from 'react'
import '../home.css'
import './learnRoute.css'
import { utilPushTo } from '../QLink'
import { showToast } from '/client/imports/routes/App'
import { Divider, Grid, Header, Label } from 'semantic-ui-react'
import { logActivity } from '/imports/schemas/activity'
import SkillLinkCard from '/client/imports/components/Learn/SkillLinkCard'
import SkillsMap from '/client/imports/components/Skills/SkillsMap'
import SkillNodes, { countMaxUserSkills } from '/imports/Skills/SkillNodes/SkillNodes'
import { getSkillNodeStatus, countCurrentUserSkills } from '/imports/schemas/skills'

import { getAssetBySelector } from '/client/imports/helpers/assetFetchers'

import { mgbAjax } from '/client/imports/helpers/assetFetchers'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

const _artSkillNodeName = 'art'
const _maxArtSkillCount = countMaxUserSkills(_artSkillNodeName + '.')
const artSkills = SkillNodes[_artSkillNodeName] // shorthand
const artItems = [
  { key: 'lineArt', node: artSkills.lineArt, mascot: 'arcade_player' },
  { key: 'colors', node: artSkills.colors, mascot: 'rpgGuy' },
  { key: 'shadesAndTextures', node: artSkills.shadesAndTextures, mascot: 'slimy2' },
  { key: 'gameSprites', node: artSkills.gameSprites, mascot: 'game_runner' },
]

// This is the   1 / n    box at the top-right of each skill box
const ProgressLabel = ({ subSkillsComplete, subSkillTotal }) => (
  <Label attached="top right">
    {subSkillsComplete} / {subSkillTotal}
  </Label>
)

ProgressLabel.propTypes = {
  subSkillsComplete: PropTypes.number,
  subSkillTotal: PropTypes.number,
}

const handleClick = (e, key, currUser, todoSkills) => {
  // cards with links already have a path, skip on to
  if (!currUser || _.get(todoSkills, 'length') === 0) return

  const newTab = e.buttons == 4 || e.button == 1
  StartArtRoute(key + '.' + todoSkills[0], currUser, newTab)
}

const handleDoItAgainClick = (e, key, currUser) => {
  const newTab = e.buttons == 4 || e.button == 1
  StartArtRoute(key, currUser, newTab)
}

export const StartArtRoute = (key, currUser, newTab) => {
  if (!currUser) {
    showToast('You must be logged in to use these tutorials', 'info')
    return
  }

  const newAsset = {
    name: 'tutorials.' + (key.startsWith('art.') ? key : 'art.' + key),
    kind: 'graphic',
    isDeleted: false,
    dn_ownerName: currUser.username,
  }

  // check if asset exists
  getAssetBySelector(newAsset, (asset, err) => {
    if (asset) {
      // asset exists. open it.
      const url = `/u/${asset.dn_ownerName}/asset/${asset._id}`
      openUrl(url, newTab)
    } else {
      // asset doesn't exist. create one.
      // xhr to get art
      mgbAjax(`/api/asset/fullgraphic/!vault/graphic.${key.split('art.').pop()}`, (err, str) => {
        if (
          err &&
          err !== 404 // If asset does not exist (error 404) just create blank graphic
        )
          console.log('error', err)
        else {
          if (str) {
            let data = JSON.parse(str)
            newAsset.thumbnail = data.thumbnail
            newAsset.content2 = data.content2
          }

          newAsset.skillPath = key.startsWith('art.') ? key : 'art.' + key
          newAsset.isCompleted = false
          newAsset.isPrivate = false

          Meteor.call('Azzets.create', newAsset, (error, result) => {
            if (error) {
              showToast('cannot create Asset because: ' + error.reason, 'error')
              return
            }
            newAsset._id = result // So activity log will work
            logActivity('asset.create', 'Created tutorial graphic', null, newAsset)
            const url = `/u/${currUser.username}/asset/${newAsset._id}`

            openUrl(url, newTab)
          })
        }
      })
    }
  })
}

const openUrl = (url, newTab) => {
  if (newTab) window.open(window.location.origin + url)
  else utilPushTo(null, url)
}

const LearnArtRoute = ({ currUser, isSuperAdmin }, context) => {
  const numArtSkills = countCurrentUserSkills(context.skills, _artSkillNodeName + '.') || 0

  return (
    <Grid container columns="1">
      <Divider hidden />
      <Grid.Column>
        <Header as="h1" style={{ fontSize: '2.5em' }}>
          Pixel Art
          <Header.Subheader>Learn to make art for your games</Header.Subheader>
        </Header>
        <ProgressLabel subSkillsComplete={numArtSkills} subSkillTotal={_maxArtSkillCount} />
        <Divider hidden />
        {currUser && <SkillsMap isSuperAdmin={isSuperAdmin} skills={context.skills} skillPaths={['art']} />}

        {/*
         Add a pseudo-card for login/signup
         login/signup is a pseudo-tutorial that exists outside the normal skills databases
         so it is sort-of hard0coded here
         since it has no skill tutorials to revisit, we hide it on completion
         */}
        {!currUser && (
          <SkillLinkCard
            to="/signup"
            mascot="flyingcat"
            name="Log In / Sign Up"
            description="You must be logged in to use these tutorials"
          />
        )}

        {artItems.map(area => {
          const skillStatus = getSkillNodeStatus(currUser, context.skills, area.node.$meta.key)

          return (
            <SkillLinkCard
              key={area.node.$meta.name}
              disabled={!currUser}
              mascot={area.mascot}
              name={area.node.$meta.name}
              description={area.node.$meta.description}
              childSkills={skillStatus.childSkills}
              learnedSkills={skillStatus.learnedSkills}
              todoSkills={skillStatus.todoSkills}
              skillPath={area.node.$meta.key}
              onClick={e => handleClick(e, area.key, currUser, skillStatus.todoSkills)}
              onMouseUp={e => handleClick(e, area.key, currUser, skillStatus.todoSkills)}
              onTouchEnd={e => handleClick(e, area.key, currUser, skillStatus.todoSkills)}
              handleDoItAgainClick={(e, key) => handleDoItAgainClick(e, key, currUser)}
            />
          )
        })}
      </Grid.Column>
    </Grid>
  )
}

LearnArtRoute.contextTypes = {
  skills: PropTypes.object, // skills for currently loggedIn user (not necessarily the props.user user)
}

export default LearnArtRoute
