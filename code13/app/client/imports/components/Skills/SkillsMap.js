import React, { PropTypes } from 'react'
import SkillNodes from '/imports/Skills/SkillNodes/SkillNodes'
import Toolbar from '/client/imports/components/Toolbar/Toolbar'
import ThingNotFound from '/client/imports/components/Controls/ThingNotFound'

import { hasSkill } from '/imports/schemas/skills'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]


export default class SkillTree extends React.Component {
  static propTypes = {
    user:         PropTypes.object,     // Can be null if user is not valid
    userSkills:   PropTypes.object,     // As defined in skills.js. Can be null if no user
    ownsProfile:  PropTypes.bool        // true IFF user is valid and asset owner is currently logged in user
  }

  constructor (...a) {
    super(...a)
    this.state = {
      zoomLevel:    1
    }
    this.totals = {}
  }

  learnSkill (key) {
    Meteor.call("Skill.grant", key, (...a) => {
      console.log("Skill granted: ", key, ...a)
    })
  }

  forgetSkill (key) {
    Meteor.call("Skill.forget", key, (...a) => {
      console.log("Skill forgotten: ", key, ...a)
    })
  }

  // TODO: this looks ugly - hard to understand
  countSkillTotals (skillNodes, key, tot) {
    const ret = {
      total: 0,
      has: 0
    }
    for (let i in skillNodes) {
      if ((i + '').indexOf('$') === 0)
        continue

      const newKey = key ? key + '.' + i : i
      tot[newKey] = tot[newKey] || {total: 0, has: 0}

      // TODO: this check will break in the future
      if (skillNodes[i].$meta.isLeaf) {
        if (!skillNodes[i].$meta.enabled)
          continue

        tot[newKey].total++
        ret.total++
        tot[newKey] = {
          total: 1,
          has: 0
        }
        if (hasSkill(this.props.userSkills, newKey)) {
          tot[newKey].has++
          ret.has++
        }
      } else {
        const tmp = this.countSkillTotals(skillNodes[i], newKey, tot)
        ret.total += tmp.total
        ret.has += tmp.has
      }
    }

    if (key) {
      tot[key].total = ret.total
      tot[key].has = ret.has
    }
    return ret
  }

  // TODO: create separate component for that?
  renderSingleNode (node, key, path, disabled) {
    let color = hasSkill(this.props.userSkills, path) ? 'green' : 'red'
    if (!node.$meta.enabled)
      color = 'grey'

    let onClick
    if (!disabled && node.$meta.enabled)
      onClick = hasSkill(this.props.userSkills, path) ? this.forgetSkill.bind(this, path) : this.learnSkill.bind(this, path)

    return (
      <div
        title={"requires:\n" + node.$meta.requires.join("\n") + " \n\nunlocks:\n" +  node.$meta.unlocks.join("\n")}
        key={path}
        style={{ backgroundColor: color, margin: '5px', border: 'solid 1px', display: 'inline-block', padding: '4px' }}
        className={(!node.$meta.enabled || disabled) ? 'ui semi-transparent button' : 'ui button'}
        onClick={onClick}>
        <i className='icon settings big'></i>
        {key}
      </div>
    )
  }

  // move this to shared includes - as server also needs this check
  hasRequirementsMet(meta, totals) {
    if (!meta.requires.length)
      return true

    let total = 0
    meta.requires.forEach((r) => {
      if (!totals[r]) {
        console.log("failed to resolve requirement:", r)
        return
      }
      if (totals[r].total === totals[r].has)
        total++
    })
    return meta.requireOneOf ? (total > 0) : (total == meta.requires.length)
  }

  // TODO: create separate component for that?
  renderSkillNodesMid (skillNodes, key = '' , requires = []) {
    const nodes = []
    for (let i in skillNodes) {
      if (i === "$meta")
        continue

      // requires && console.log("requires")
      const newKey = key ? key + '.' + i : i
      let disabled = !this.hasRequirementsMet(skillNodes[i].$meta, this.totals)

      // TODO: technically isLeaf can be replaced with keys check or similar
      if (!skillNodes[i].$meta.isLeaf) {
        nodes.push(
          <div
            key={i}
            style={{ position: 'relative', backgroundColor: 'rgba(0,0,0,0.1)', margin: '5px', padding: '3px 5px', border: 'solid 1px', boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.5)' }}
            className={disabled ? 'animate disabled' : 'animate'}
            data-requires={requires}>
            <div className='mgb-skillsmap-progress'>
              <div className='value animate' style={{width: (this.totals[newKey].has / this.totals[newKey].total) * 100 + '%'}}></div>
              {i} ({newKey})
            </div>
            {this.renderSkillNodesMid(skillNodes[i], newKey, skillNodes[i].$meta.requires)}
          </div>
        )
      } 
      else
        nodes.push(this.renderSingleNode(skillNodes[i], i, newKey, disabled))
    }
    return nodes
  }

  renderParts (val, tot) {
    const parts = []
    const w = (100 / tot)
    const width = w + '%'
    // skip last
    for (let i = 0; i < val - 1; i++)
      parts.push(<div className='mgb-skillsmap-part' key={i} style={{ width: width, left: w * i + '%' }}></div>)
    return parts
  }

  renderSkillNodesSmall (skillNodes) {
    const nodes = []
    for (let i in skillNodes) {
      if (i === "$meta")
        continue

      nodes.push(
        <div key={i} className='animate'>
          <div className='mgb-skillsmap-progress'>
            {i}
            <div className='mgb-skillsmap-value animate' style={{width: (this.totals[i].has / this.totals[i].total) * 100 + '%'}}></div>
            {this.renderParts(this.totals[i].has, this.totals[i].total)}
          </div>
        </div>
      )
    }
    return nodes
  }

  renderSkillNodes (skillNodes) {
    const { zoomLevel } = this.state
    if (zoomLevel == 1)
      return this.renderSkillNodesSmall(skillNodes)
    else if (zoomLevel == 2)
      return this.renderSkillNodesMid(skillNodes)
  }

  render () {
    const { zoomLevel } = this.state
    const { user, userSkills } = this.props
    if (!user)
      return <ThingNotFound type="User" />
    if (!userSkills)
      return <div className='ui warning message'>This user does not yet have any Skills stored in our database. But I'm sure they are awesome anyway</div>

    this.countSkillTotals(SkillNodes, '', this.totals)


    const config = {
      level: 2,
      buttons: [
        {
          name:  'zoomin',
          label: 'Zoom In',
          icon:  'zoom in',
          tooltip: 'Open detailed skill view',
          disabled: zoomLevel != 1,
          level:    1,
          shortcut: '1'
        },
        {
          name:  'zoomout',
          label: 'Zoom Out',
          icon:  'zoom out',
          tooltip: 'Close detailed skill view',
          disabled: zoomLevel != 2,
          level:    2,
          shortcut: '2'
        }
      ]
    }

    return (
      <div>
        <Toolbar name='SkillsMap' config={config} actions={this} />
        <div style={{position: 'relative'}}>
          {this.renderSkillNodes(SkillNodes)}
        </div>
      </div>
    )
  }

  zoomin () {
    const { zoomLevel } = this.state
    if (this.props.ownsProfile && zoomLevel < 2)
      this.setState( { zoomLevel: zoomLevel+1 } )
  }

  zoomout () {
    const { zoomLevel } = this.state
    if (this.props.ownsProfile && zoomLevel > 1) 
      this.setState( { zoomLevel: zoomLevel-1 } )
  }
}