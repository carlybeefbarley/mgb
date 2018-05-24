import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import '../home.css'
import { utilPushTo } from '/client/imports/routes/QLink'
import { Divider, Grid, Header, Icon, List, Segment } from 'semantic-ui-react'

import { showToast } from '/client/imports/modules'
import { logActivity } from '/imports/schemas/activity'

import SkillNodes from '/imports/Skills/SkillNodes/SkillNodes'
import SkillsMap from '/client/imports/components/Skills/SkillsMap.js'

import { getAssetBySelector } from '/client/imports/helpers/assetFetchers'
import { mgbAjax } from '/client/imports/helpers/assetFetchers'

// This can be called with the url param:
// item = one of these: (a subset of what what is SkillNodes.js : codeItems)
const learnItems = ['intro', 'phaser', 'games', 'advanced']
// Note that this does not handle the /learn/code/modify route - that has its own
// component instead.

const handleClick = (e, learnItem, idx, currUser, area) => {
  const newTab = e.buttons == 4 || e.button == 1
  StartJsGamesRoute(learnItem, idx, currUser, newTab, area)
}

/**
 *
 * @param {string} learnItem - one of the learn groups (basic, intro, advanced etc). This is used to determine the tutorial asset name and the skill path
 * @param {string} name - name of this skill
 * @param {User} currUser - currently logged-in Meteor User.
 * @param {boolean} newTab True if it should be opened in a new Browser tab
 * @param {any} area A Skillnode object from SkillNodes.js
 */
export const StartJsGamesRoute = (learnItem, name, currUser, newTab, area) => {
  if (!currUser) {
    showToast.info('You must be logged in to use these tutorials')
    return
  }

  const newAsset = {
    name: 'tutorials.' + learnItem + '.' + name,
    kind: 'code',
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

      if (!area.skillChallengeType || area.skillChallengeType === '')
        console.error('skill has no skillChallengeType: ', area)
      const prefix = area.skillChallengeType

      // xhr to get code
      mgbAjax(`/api/asset/code/!vault/` + prefix + `.` + name, (err, str) => {
        if (err) console.log('error', err)
        else {
          let code = JSON.parse(str)

          // challenges are in a stupid format from free code camp which we join into one string:
          if (prefix == 'challenges') code = code.code.join('\n')
          else code = code.steps[0].code

          newAsset.skillPath = 'code.js.' + learnItem + '.' + name
          newAsset.content2 = { src: code }
          newAsset.isCompleted = false
          newAsset.isPrivate = false

          Meteor.call('Azzets.create', newAsset, (error, result) => {
            if (error) {
              showToast.error('cannot create Asset because: ' + error.reason)
              return
            }
            newAsset._id = result // So activity log will work
            logActivity('asset.create', 'Created game tutorial', null, newAsset)
            const url = `/u/${currUser.username}/asset/${newAsset._id}`

            openUrl(url, newTab)
          })
        }
      })
    }
  })
}

/**
 *
 * @param {string} url The URL to open
 * @param {boolean} newTab True if it should be opened in a new Browser tab
 */
const openUrl = (url, newTab) => {
  if (newTab) window.open(window.location.origin + url)
  else utilPushTo(null, url)
}

const getSkillTitle = learnItem => SkillNodes.code.js[learnItem].$meta.name
const getSkillDescription = learnItem => SkillNodes.code.js[learnItem].$meta.description

const getSubSkills = learnItem => {
  // if (subSkills.length > 0)
  //   return subSkills
  // else {
  const subSkills = [] // array of learnItem subskills
  const skillsObject = SkillNodes.code.js[learnItem]
  for (let key in skillsObject) {
    if (skillsObject.hasOwnProperty(key) && key != '$meta') {
      let skill = _.cloneDeep(skillsObject[key]['$meta'])
      skill.idx = key
      subSkills.push(skill)
    }
  }
  return subSkills
  // }
}

const LearnCodeRouteItem = ({ currUser, isSuperAdmin, params }, context) => {
  const learnItem = params.item
  const bySubsection = _.groupBy(getSubSkills(learnItem), 'subsection')

  if (!learnItems.includes(learnItem)) {
    console.error('User reached unknown learn code route: ', learnItem)
    return (
      // Note a route we understand so tell the user
      <div>No such learn path</div>
    )
  } else
    return (
      <Grid container columns="1">
        <Divider hidden />
        <Grid.Column>
          <Header style={headerStyle}>
            {getSkillTitle(learnItem)}
            <Header.Subheader>{getSkillDescription(learnItem)}</Header.Subheader>
          </Header>
          {currUser && (
            <div style={{ clear: 'both' }}>
              <SkillsMap
                isSuperAdmin={isSuperAdmin}
                skills={context.skills}
                skillPaths={['code.js.' + learnItem]}
              />
            </div>
          )}
        </Grid.Column>
        <Grid.Column>
          {_.map(_.keys(bySubsection), subkey => (
            <Segment padded piled key={subkey}>
              <Header as="h2" content={subkey} />
              <List size="large" relaxed="very" link className="skills">
                {_.map(bySubsection[subkey], (area, idx) => {
                  let skillPath = 'code/js/' + learnItem + '/' + area.idx
                  const isComplete = currUser && !_.isEmpty(context.skills[skillPath])

                  return (
                    <List.Item
                      key={idx}
                      as={'a'}
                      onMouseUp={e => handleClick(e, learnItem, area.idx, currUser, area)}
                      onTouchEnd={e => handleClick(e, learnItem, area.idx, currUser, area)}
                      icon={
                        isComplete ? (
                          <Icon size="large" name="checkmark" color="green" />
                        ) : (
                          <Icon size="large" name={area.icon} />
                        )
                      }
                      header={isComplete ? null : area.name}
                      content={isComplete ? area.name : null}
                    />
                  )
                })}
              </List>
            </Segment>
          ))}
        </Grid.Column>
      </Grid>
    )
}

const headerStyle = {
  fontSize: '2.5em',
  textAlign: 'center',
  paddingBottom: '10px',
}

LearnCodeRouteItem.contextTypes = {
  skills: PropTypes.object, // skills for currently loggedIn user (not necessarily the props.user user)
}

export default LearnCodeRouteItem
