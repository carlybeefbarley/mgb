import React from 'react'
import SkillNodes from '/imports/SkillNodes/SkillNodes.js'
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
  }

  saveSkills () {
    localStorage.setItem('skills', JSON.stringify(this.skills))
    this.countSkillTotals(SkillNodes, '', this.totals)
    this.forceUpdate()
  }
  loadSkills () {
    const sk = localStorage.getItem('skills')
    if (sk) {
      this.skills = JSON.parse(sk)
    }else {
      this.skills = {}
    }
  }
  learnSkill (key) {
    this.skills[key] = 1
    this.saveSkills()
  }
  forgetSkill (key) {
    delete this.skills[key]
    this.saveSkills()
  }

  countSkillTotals (skillNodes, key, tot) {
    const ret = {
      total: 0,
      has: 0
    }
    for (let i in skillNodes) {
      if ((i + '').indexOf('$') === 0) {
        continue
      }
      const newKey = key ? key + '.' + i : i

      tot[newKey] = tot[newKey] || {total: 0, has: 0}

      // TODO: this check will break in the future
      if (typeof skillNodes[i] != 'object') {
        if (!skillNodes[i]) {
          continue
        }
        tot[newKey].total++
        ret.total++
        if (this.skills[newKey]) {
          tot[newKey].has++
          ret.has++
        }
      }else {
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

  resolveRequire (key, req) {
    const ka = key.split('.')
    const ra = req.split('.')
    for (let i = 0; i < ra.length; i++) {
      if (ra[i] == '') {
        ka.pop()
        ra.shift()
        i--
      }else {
        break
      }
    }
    return ka.join('.') + '.' + ra.join('.')
  }

  renderSingleNode (node, key, path, disabled) {
    let color = this.skills[path] ? 'green' : 'red'
    if (!node) {
      color = 'grey'
    }
    return (
      <div
        key={path}
        style={{ backgroundColor: color, margin: '5px', border: 'solid 1px', display: 'inline-block', padding: '4px' }}
        className={(!node || disabled) ? 'ui disabled button' : 'ui button'}
        onClick={this.skills[path] ? this.forgetSkill.bind(this, path) : this.learnSkill.bind(this, path)}>
        <i className='icon settings big'></i>
        {key}
      </div>
    )
  }
  renderSkillNodesMid (skillNodes, key = '' , requires = '') {
    const nodes = []
    for (let i in skillNodes) {
      if (i.indexOf('$') === 0) {
        if (i == '$requires') {
          requires = this.resolveRequire(key, skillNodes[i])
        }
        continue
      }
      // requires && console.log("requires")
      const newKey = key ? key + '.' + i : i
      let disabled = false
      if (requires) {
        if (this.totals[requires]) {
          disabled = this.totals[requires].total !== this.totals[requires].has
        }else {
          console.log('cannot resolve require:', requires)
        }
      }
      // TODO: this check will break in the future
      if (typeof skillNodes[i] == 'object') {
        nodes.push(
          <div
            key={i}
            style={{ position: 'relative', backgroundColor: 'rgba(0,0,0,0.1)', margin: '5px', padding: '3px 5px', border: 'solid 1px', boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.5)' }}
            className={disabled ? 'animate disabled' : 'animate'}
            data-requires={requires}>
            <div className='progress'>
              {i}
              <div className='value animate' style={{width: (this.totals[newKey].has / this.totals[newKey].total) * 100 + '%'}}></div>
            </div>
            {this.renderSkillNodesMid(skillNodes[i], newKey, requires)}
          </div>
        )
      }else {
        nodes.push(this.renderSingleNode(skillNodes[i], i, newKey, disabled))
      }
    }
    return nodes
  }
  renderParts (val, tot) {
    const parts = []
    const w = (100 / tot)
    const width = w + '%'
    // skip last
    for (let i = 0; i < val - 1; i++) {
      parts.push(
        <div className='part' key={i} style={{ width: width, left: w * i + '%' }}></div>
      )
    }
    return parts
  }
  renderSkillNodesSmall (skillNodes) {
    const nodes = []
    for (let i in skillNodes) {
      if ((i + '').indexOf('$') === 0) {
        continue
      }
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
    if (this.zoomLevel == 1) {
      return this.renderSkillNodesSmall(skillNodes)
    }
    else if (this.zoomLevel == 2) {
      return this.renderSkillNodesMid(skillNodes)
    }
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
