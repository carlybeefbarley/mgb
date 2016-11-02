import React from 'react'
import SkillNodes from '/imports/Skills/SkillNodes/SkillNodes.js'
import Toolbar from '/client/imports/components/Toolbar/Toolbar.js'

export default class SkillTree extends React.Component {
  static propTypes = {
    user: React.PropTypes.object
  }

  constructor (...a) {
    super(...a)
    this.loadSkills()
    this.totals = {}
    this.zoomLevel = 1
    this.countSkillTotals(SkillNodes, '', this.totals)
    // TODO: make it work
    // Meteor.subscribe("user.skills", this.props.user._id)
  }

  // use setState instead?
  updateSkills () {
    this.countSkillTotals(SkillNodes, '', this.totals)
    this.forceUpdate()
  }

  loadSkills () {
    this.skills = {}
    // TODO: this should be in subscription?
    Meteor.call("Skill.getForUser", this.props.user._id, (err, skills) => {
      console.log("Skills:", skills)
      this.skills = skills || {}
      this.updateSkills()
    })
  }

  learnSkill (key) {
    Meteor.call("Skill.grant", key, (...a) => {
      console.log("Skill granted", ...a)
      this.skills[key] = 1
      this.updateSkills()
    })
  }

  // is it even possible?
  forgetSkill (key) {
    delete this.skills[key]
    Meteor.call("Skill.forget", key, () => {
      this.updateSkills()
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
        if (this.skills[newKey]) {
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
    let color = this.skills[path] ? 'green' : 'red'
    if (!node.$meta.enabled)
      color = 'grey'

    let onClick
    if (!disabled && node.$meta.enabled)
      onClick = this.skills[path] ? this.forgetSkill.bind(this, path) : this.learnSkill.bind(this, path)

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
      if(!totals[r]){
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
            <div className='progress'>
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
      parts.push(<div className='part' key={i} style={{ width: width, left: w * i + '%' }}></div>)
    return parts
  }

  renderSkillNodesSmall (skillNodes) {
    const nodes = []
    for (let i in skillNodes) {
      if (i === "$meta")
        continue

      nodes.push(
        <div key={i} className='animate'>
          <div className='progress'>
            {i}
            <div className='value animate' style={{width: (this.totals[i].has / this.totals[i].total) * 100 + '%'}}></div>
            {this.renderParts(this.totals[i].has, this.totals[i].total)}
          </div>
        </div>
      )
    }
    return nodes
  }

  renderSkillNodes (skillNodes) {
    if (this.zoomLevel == 1)
      return this.renderSkillNodesSmall(skillNodes)
    else if (this.zoomLevel == 2)
      return this.renderSkillNodesMid(skillNodes)
  }

  render () {
    const config = {
      level: 2,
      buttons: [
        {
          name: 'zoomin',
          label: 'Zoom In',
          icon: 'zoom in',
          tooltip: 'Open detailed skill view',
          disabled: this.zoomLevel != 1,
          level: 1,
          shortcut: '1'
        },
        {
          name: 'zoomout',
          label: 'Zoom Out',
          icon: 'zoom in',
          tooltip: 'Close detailed skill view',
          disabled: this.zoomLevel != 2,
          level: 2,
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
    if (this.zoomLevel < 2) {
      this.zoomLevel++
      this.forceUpdate()
    }
  }

  zoomout () {
    if (this.zoomLevel > 1) {
      this.zoomLevel--
      this.forceUpdate()
    }
  }
}
