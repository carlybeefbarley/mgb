import _ from 'lodash'
import React, { PropTypes } from 'react'
import SkillNodes from '/imports/Skills/SkillNodes/SkillNodes'
import Toolbar from '/client/imports/components/Toolbar/Toolbar'
import ThingNotFound from '/client/imports/components/Controls/ThingNotFound'
import { skillAreaItems } from '/imports/Skills/SkillAreas'

import { hasSkill, learnSkill, forgetSkill } from '/imports/schemas/skills'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]


export default class SkillTree extends React.Component {
  static propTypes = {
    user:             PropTypes.object,     // Can be null if user is not valid
    userSkills:       PropTypes.object,     // As defined in skills.js. Can be null if no user
    ownsProfile:      PropTypes.bool,       // true IFF user is valid and asset owner is currently logged in user
    onlySkillArea:    PropTypes.string,     // If non-null, then show no toolbars, and just show the top-level area specified (e..g a string that is a tag in skillsAreas.js)
    initialZoomLevel: PropTypes.number,
    hideToolbars:     PropTypes.bool         // If true turn off toolbars
  }

  static defaultProps = {
    onlySkillArea:    null,                 // Avoid undefined/null duality
    initialZoomLevel: 1
  }

  constructor (...a) {
    super(...a)
    this.state = {
      zoomLevel:    this.props.initialZoomLevel,
      skillAreaOverride: null
    }
    this.totals = {}
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
        const newFullKey = this.parentPath ? this.parentPath + '.' + newKey : newKey
        if (hasSkill(this.props.userSkills, newFullKey)) {
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
    const fullPath = this.parentPath ? this.parentPath + '.' + path : path
    const hasIt = hasSkill(this.props.userSkills, fullPath)
    let color = hasIt ? 'green' : 'grey'
    if (!node.$meta.enabled)
      color = 'grey'

    let onClickFn
    if (!disabled && node.$meta.enabled)
      onClickFn = hasIt ? forgetSkill : learnSkill
    const iconName = hasIt ? 'checkmark box' : 'square outline'
    return (
      <div
        title={"requires:\n" + node.$meta.requires.join("\n") + " \n\nunlocks:\n" +  node.$meta.unlocks.join("\n")}
        key={fullPath}
        style={{ backgroundColor: color, margin: '5px', border: 'solid 1px', display: 'inline-block', padding: '4px' }}
        className={(!node.$meta.enabled || disabled) ? 'ui small semi-transparent button' : 'ui button'}
        onClick={() => onClickFn(fullPath)}>
        <i className={'icon ' + iconName + ' large'}></i>
        {key}  <small className='mgb-show-on-parent-div-hover' style={{color: 'white'}} title="Each individual skill is assigned a Level-of-difficulty group.. L1=beginner up to L4=guru">L{node.$meta.level || 1}</small>
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
  renderSkillNodesMid (skillNodes, onlySkillArea, key = '' , requires = []) {
    const nodes = []
    for (let i in skillNodes) {
      if (i === "$meta")
        continue

      if (key === '' && onlySkillArea !== null && i !== onlySkillArea)
        continue

      // requires && console.log("requires")
      const newKey = key ? key + '.' + i : i
      let disabled = !this.hasRequirementsMet(skillNodes[i].$meta, this.totals)

      // TODO: technically isLeaf can be replaced with keys check or similar
      if (!skillNodes[i].$meta.isLeaf) {
        const areaName = (key === '') ? i : key
        const area = _.find(skillAreaItems, ['tag', areaName] )
        const color = area ? area.color : 'green'
        const valueSty = {
          backgroundColor: color,
          opacity:  0.3,
          width: (this.totals[newKey].has / this.totals[newKey].total) * 100 + '%',
          pointerEvents: 'none'
        }

        const boxSty = {
          position:         'relative',
          backgroundColor:  'rgba(0,0,0,0.1)',
          margin:           (key === '') ? 'none' : '8px',
          padding:          '0px',
          border:           'none', // was solid 1px',
          boxShadow:        'inset 1px 1px 2px rgba(0,0,0,0.5)'
          // padding:          '3px 5px',
          // border:           'solid 1px',
          // boxShadow:        'inset 1px 1px 2px rgba(0,0,0,0.5)'
        }

        nodes.push(
          <div
            key={i}
            style={boxSty}
            className={disabled ? 'animate mgb-disabled' : 'animate'}
            data-requires={requires}>
            <div className='mgb-skillsmap-progress'>
              <div className='mgb-skillsmap-value animate' style={valueSty}></div>
              { this.renderParts(this.totals[newKey].has, this.totals[newKey].total) }
              <div onClick={() => { if (key === '') this.setState( { zoomLevel: 1, skillAreaOverride: null } ) } }>
                { (key === '') && <i className='minus circle icon' /> }
                {skillNodes[i].$meta.name || i} ({newKey})
              </div>
            </div>
            {this.renderSkillNodesMid(skillNodes[i], onlySkillArea, newKey, skillNodes[i].$meta.requires)}
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
      parts.push(<div className='mgb-skillsmap-part' key={i} style={{ pointerEvents: 'none', width: width, left: w * i + '%' }}></div>)
    return parts
  }

  /** This shows one line per skill area */
  renderSkillNodesSmall (skillNodes, onlySkillArea) {
    let nodes = []
    for (let i in skillNodes) {
      if (i === "$meta")
        continue

      const area = _.find(skillAreaItems, ['tag', i] )
      const color = area ? area.color : 'green'
      const valueSty = {
        backgroundColor: color,
        opacity:  0.3,
        width: (this.totals[i].has / this.totals[i].total) * 100 + '%'
      }

      if (!onlySkillArea || onlySkillArea === i)
        nodes.push(
          <div
              key={ 'hdr'+i }
              className='animate'
              onClick={() => { this.setState( { zoomLevel: 2, skillAreaOverride: i } ) } }
              >
            <div className='mgb-skillsmap-progress' style={{margin: '0px 0px 4px 0px'}}>
              { skillNodes[i].$meta.name || i }
              <div className='mgb-skillsmap-value animate' style={valueSty}></div>
              { this.renderParts(this.totals[i].has, this.totals[i].total) }
            </div>
          </div>
        )
    }
    return nodes
  }

  // this renders all skills on a single line. Kinda too small really
  renderSkillNodesOneLine (skillNodes) {
    const nodes = []

    let idx = 0
    let numNodes = Object.keys(skillNodes).length - 1   // -1 for $meta

    for (let i in skillNodes) {
      if (i === "$meta")
        continue
      const area = _.find(skillAreaItems, ['tag', i] )
      const color = area ? area.color : 'green'
      const valueSty = {
        backgroundColor: color,
        opacity:  0.3,
        width: (this.totals[i].has / this.totals[i].total) * 100 + '%'
      }

      const areaSty = {
        width: (100/numNodes) + '%',
        left:  (idx*(100/numNodes)) + '%',
        position: 'absolute'
      }
      idx++

      nodes.push(
        <div key={ i } className='animate' style={areaSty}>
          <div className='mgb-skillsmap-progress'>
            <span className='mgb-show-on-parent-div-hover' style={{whiteSpace: 'nowrap'}}>
              { skillNodes[i].$meta.name || i }
            </span>
            <div className='mgb-skillsmap-value animate' style={valueSty}></div>
            { this.renderParts(this.totals[i].has, this.totals[i].total) }
          </div>
        </div>
      )
    }
    nodes.push(<div key="_filler">&nbsp;</div>)
    return nodes
  }

  renderSkillNodes (skillNodes, onlySkillArea) {
    switch (this.state.zoomLevel)
    {
    case 0:
      return this.renderSkillNodesOneLine(skillNodes, onlySkillArea)
    case 1:
      return this.renderSkillNodesSmall(skillNodes, onlySkillArea)
    case 2:
      return this.renderSkillNodesMid(skillNodes, onlySkillArea)
    }
  }

  getSubSkillNodes(skillNodes, onlySkillArea){
    const onlyAreas = onlySkillArea.split('.')
    let tmpNodes = _.cloneDeep(skillNodes)
    while(onlyAreas.length > 1){
      const nodeName = onlyAreas.shift()
      if(tmpNodes[nodeName]){
        tmpNodes = tmpNodes[nodeName]
      }
    }
    return {
      skillNodes: tmpNodes,
      onlySkillArea: onlyAreas[onlyAreas.length-1]
    }
  }

  render () {
    const { zoomLevel, skillAreaOverride } = this.state
    let { user, userSkills, subSkill, onlySkillArea, hideToolbars } = this.props
    if (!user)
      return <ThingNotFound type="User" />
    if (!userSkills)
      return <div className='ui warning message'>This user does not yet have any Skills stored in our database. But I'm sure they are awesome anyway</div>

    let skillNodes = SkillNodes
    this.parentPath

    if(subSkill){
      this.parentPath = onlySkillArea
      this.parentPath = this.parentPath.split('.')
      this.parentPath.pop()
      this.parentPath = this.parentPath.join('.')

      const subSkillNodes = this.getSubSkillNodes(SkillNodes, onlySkillArea)
      // console.log(subSkillNodes)
      skillNodes = subSkillNodes.skillNodes
      onlySkillArea = subSkillNodes.onlySkillArea
    }


    this.countSkillTotals(skillNodes, '', this.totals)

    const config = {
      // level: 1,      // default level -- This is now in expectedToolbars.getDefaultLevel
      buttons: [
        {
          name:  'zoomout',
          label: 'Zoom Out',
          icon:  'zoom out',
          tooltip: 'Show less detail',
          disabled: zoomLevel <= 0,
          level:    1,
          shortcut: '-'
        },
        {
          name:  'zoomin',
          label: 'Zoom In',
          icon:  'zoom in',
          tooltip: 'Show more detail',
          disabled: zoomLevel >= 2,
          level:    1,
          shortcut: '+'
        },
      ]
    }

    return (
      <div>
        { ( onlySkillArea === null && !hideToolbars) && <Toolbar name='SkillsMap' config={config} actions={this} /> }
        <div style={{position: 'relative'}}>
          {this.renderSkillNodes(skillNodes, skillAreaOverride || onlySkillArea)}
        </div>
      </div>
    )
  }

  zoomin () {
    const { zoomLevel } = this.state
    if (this.props.ownsProfile && zoomLevel < 2)
      this.setState( { zoomLevel: zoomLevel+1, skillAreaOverride: null } )
  }

  zoomout () {
    const { zoomLevel } = this.state
    if (this.props.ownsProfile && zoomLevel > 0)
      this.setState( { zoomLevel: zoomLevel-1, skillAreaOverride: null } )
  }
}
