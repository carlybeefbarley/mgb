"use strict"
import _ from 'lodash'
import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { utilMuteLevelSlider, utilActivateLevelSlider, utilAdvertizeSlider } from '/client/imports/components/Nav/NavBarGadgetUxSlider'

const CTRL = 1 << 8
const SHIFT = 1 << 9
const ALT = 1 << 10
const META = 1 << 11            // Mac CMD key / Windows 'windows' key. https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/metaKey


const sliderPcts = {
  iconSizeBreak1:  0.25,
  iconSizeBreak2:  0.66,
  tooltipSlowdown: 0.5
}


// Here is a list of *known* toolbar scope names. This is so that a ui (e.g fpUxLevels.js) can enumerate them all
export const expectedToolbarScopeNames = {
  EditGraphic: "EditGraphic",
  GraphicTools: "GraphicTools",
  MapTools: "MapTools",
  SkillsMap: "SkillsMap"
}

export function getLevelKey(name) {
  return "toolbar-level-" + name
}

export function getLevelVal(name) {
  return localStorage.getItem("toolbar-level-" + name)
}


export default class Toolbar extends React.Component {
  constructor(...args) {
    super(...args)
    this.keyActions = {}
    this.buttons = []

    // separate these - and allow some toolbars to share level???
    this.lsDataKey = "toolbar-data-" + this.props.name
    this.lsLevelKey = "toolbar-level-" + (this.props.levelName || this.props.name)

    if (!_.includes(expectedToolbarScopeNames, this.props.name))
      console.trace(`Unexpected Toolbar name "${this.props.name}" in Toolbar.js. Devs should add new ones to expectedToolbarScopeNames"`)

    this._activeButton = null
    this.startPos = null
    this.hasMoved = false
    
    this.visibleButtons = null

    this.levelSlider = null
    this.maxLevel = 10      // _addLevelSlider will set this value to 1+ the highest level it sees. The 1+ is so there's a final level to hide the last text label and 'more buttons' button

    this.state = {};

    this.order = _.range(this.props.config.buttons.length)    // Creates array [0, ... n]

    this._onChange = (e) => {
      this.setState({level: parseInt(e.target.value, 10)})
    }

    this._onKeyDown = (e) => {
      const keyval = this.getKeyval(e)
      if (this.keyActions[keyval]) {
        e.preventDefault()
        // TODO(@Stauzs) Do we need this?
        e.stopPropagation()
      }
    }

    this._onKeyUp = (e) => {
      // don't steal events from input fields
      // TODO(@stauzs): Maybe worth using something like https://github.com/madrobby/keymaster to handle the edge cases like meta (cmd), input etc.
      if (["INPUT", "SELECT", "TEXTAREA"].indexOf(e.target.tagName) > -1)
        return
      
      let keyval = this.getKeyval(e)
      if (this.keyActions[keyval]) {
        const b = this.getButtonFromAction(this.keyActions[keyval].action)
        if (!b || b.disabled)
          return
        e.preventDefault()
        this.keyActions[keyval](e)
      }
    }

    this._onMouseMove = this._moveButton.bind(this)
    this._onMouseUp = this._moveButtonStop.bind(this)

    this.loadState()
  }


  _showDelay() 
  {
    return this.state.level <= (sliderPcts.tooltipSlowdown * this.maxLevel) ? 300 : 700
  }


  set activeButton(v) {
    if (v) {
      v.classList.remove("animate")
      v.classList.add("main")
      $(v).popup('destroy')
    }
    else {
      this._activeButton.classList.add("animate")
      this._activeButton.classList.remove("main")
      // TODO: dont repeat..
      $(this._activeButton).popup( { delay: {show: this._showDelay(), hide: 0}} )
    }
    this._activeButton = v
  }


  get activeButton() {
    return this._activeButton
  }

  /* Lifecycle functions */
  componentDidMount() {
    this.setState({level:localStorage.getItem(this.lsLevelKey) || this.props.config.level})
    this.levelSlider = this._addLevelSlider()

    this.levelSlider.addEventListener("input", this._onChange)
    window.addEventListener("keyup", this._onKeyUp)
    window.addEventListener("mousemove", this._onMouseMove)
    window.addEventListener("mouseup", this._onMouseUp)
  }

  componentWillReceiveProps(props) {
    const len = props.config.buttons.length

    // add spaces for extra buttons
    if (this.order.length < len) {
      for (let i=this.order.length; i<len; i++)
        this.order[i] = i
    }

    this.data = props.config
  }

  componentWillUnmount() {
    this.levelSlider.removeEventListener("input", this._onChange)
    window.removeEventListener("keyup", this._onKeyUp)
    window.removeEventListener("mousemove", this._onMouseMove)
    window.removeEventListener("mouseup", this._onMouseUp)

    let $a = $(ReactDOM.findDOMNode(this))
    $a.find('.hazPopup').popup( 'destroy' )

    utilMuteLevelSlider(this.levelSlider)
  }

  setState(state) {
    super.setState(state)
    Object.assign(this.state, state)
    localStorage.setItem(this.lsLevelKey, state.level)       // TODO(@dgolds): Store in User record if logged in
    this.initPopups()
  }

  saveState() {
    localStorage.setItem(this.lsDataKey, JSON.stringify(this.order))     // TODO(@dgolds): Store in User record if logged in
  }

  loadState() {
    const savedData = localStorage.getItem(this.lsDataKey)
    this.data = this.props.config

    if (savedData) {
      const pData = JSON.parse(savedData)
      // ignore old config
      if (pData.length && typeof(pData[0]) == "number" )
        this.order = pData
    }
  }
  /* End of Lifecycle functions */

  /* Helper/Misc function */
  // seems harmless if called more than once on the same element
  initPopups() {
    let $a = $(ReactDOM.findDOMNode(this))
    // seems harmless if called twice on the same element
    $a.find('.hazPopup').popup("destroy")
    window.setTimeout(() => {
      $a.find('.hazPopup').popup( { delay: {show: this._showDelay(), hide: 0}} )
    }, 0)
  }


  getRow(mb, b) {
    const totRows = Math.round(mb.height / b.height);
    if(totRows == 0){
      return 0
    }
    const relY = (b.top - mb.top)

    const row = Math.round( (relY / mb.height) * totRows )
    return mb.width * row
  }


  getKeyval(e) {
    let keyval = e.which
    e.metaKey  &&  (keyval |= META)
    e.shiftKey &&  (keyval |= SHIFT)
    e.ctrlKey  &&  (keyval |= CTRL)
    e.altKey   &&  (keyval |= ALT)
    return keyval
  }


  getButtonFromAction(action) {
    return _.find(this.data.buttons, (o) => {
      return o.name == action
    })
  }


  registerShortcut(shortcut, action) {
    const keys = shortcut.split("+")
    // create unique index where
    // first 8 bits is keycode
    // 9th bit is Ctrl    (see const CTRL)
    // 10th bit is Shift  (see const SHIFT)
    // 11th bit is Alt    (see const ALT)
    // 12th bit is Meta (AppleKey / WindowsKey)  (see const META)
    let keyval = 0
    for (let i=0; i<keys.length; i++) {
      const key = keys[i].toLowerCase().trim()
      switch (key) {
        case "ctrl":
              keyval |= CTRL
              break
        case "alt":
              keyval |= ALT
              break
        case "shift":
              keyval |= SHIFT
              break
        case "meta":
              keyval |= META
              break
        default:
              if (key.length > 1)
                console.error("unknown key: [" + key + "]")              
              keyval |= key.toUpperCase().charCodeAt(0)
              break
      }
    }
    // TODO: check duplicate shortcuts?
    if (!this.props.actions[action]) {
      console.trace("missing action:", action)
      return
    }
    this.keyActions[keyval] = this.props.actions[action].bind(this.props.actions)
    this.keyActions[keyval].action = action
  }


  determineButtonSize() {
     // TODO: are 3 levels enough?  TODO(@dgolds) Should we make this a config option?
    if (this.state.level <= sliderPcts.iconSizeBreak1 * this.maxLevel)
      return "medium"
    else if (this.state.level <= sliderPcts.iconSizeBreak1 * this.maxLevel)
      return "small"
    return "tiny"
  }


  render() {
    const size = this.determineButtonSize()
    const buttons = []
    let parent = []
    buttons.push(parent)
    const newButtons = []
    let b
    for (let i=0; i<this.order.length; i++) {
      b = this.data.buttons[this.order[i]]
      if (!b)
        continue
      if (b.name == "separator")
      {
        if (!parent.length)
          continue        
        parent = []
        buttons.push(parent)
        continue
      }
      // skip invisible buttons - to show nice rounded borders for side buttons
      if (b.level > this.state.level)
        continue
    
      parent.push(this._renderButton(b, i))
      newButtons.push(b.name)
    }
    this.visibleButtons = newButtons

    const buttonGroupClassName = "ui icon buttons animate " + size + " " + "level" + this.state.level + (this.props.config.vertical ? " vertical" : '')
    const buttonGroupStyle = { marginRight: "4px", marginBottom: "2px", marginTop: "2px" }
    const content = buttons.map((b, i) => (<div style={buttonGroupStyle} className={buttonGroupClassName} key={i}>{b}</div>))

    return (
      <div ref="mainElement" className={"Toolbar" + (this.props.config.vertical ? " vertical" : '')}>
        {content}

        <div style={buttonGroupStyle} className={buttonGroupClassName}>
          { this.state.level < this.maxLevel-1 && 
            <div className="ui button hazPopup" 
                style={{borderStyle: "dashed", borderWidth: "thin", opacity: "0.5"}}
                data-position="top center"
                onClick={this.advertizeSlider.bind(this)}
                data-content="More buttons available. Use the slider at the top of the page to show them">
              <i className="ui options icon" />
            </div>
          }
        </div>

        <div className="ui button right floated mini reset" style={{marginRight: "4px", paddingLeft: "4px"}}
             onClick={this.reset.bind(this)}
             title="Reset Toolbar - Any Tool buttons you had drag-rearranged will be moved back to their original locations">
          <i className="level down reset icon"></i>
        </div>
      </div>
    )
  }

  advertizeSlider() {
    utilAdvertizeSlider(this.levelSlider)
  }

  // Reset any moved buttons to their original locations
  reset() {
    this.order.forEach((v, k, o) => {
      o[k] = k
    })
    this.saveState()
    this.forceUpdate()
    this.initPopups()
  }

  /* private methods go here */
  // adds react dom element that represents button
  _addButton(b, index) {
    if (!b)
      return        // TODO(@Stauzs)do I need to remove button here?

    this.buttons[index] = b
  }


  _handleClick(action, e) {
    if (this.hasMoved || this.activeButton == this._extractButton(e.target) )
      return
    
    if (this.props.actions[action])
      this.props.actions[action](e)
    else
      console.error("Cannot find action for button:", action)    
  }


  _extractButton(el) {
    let b = el
    if (this.buttons.indexOf(b) == -1) {
      if (this.buttons.indexOf(b.parentNode) > -1) {
        b = b.parentNode
        return b
      }
      return null
    }
    return b
  }


  _renderButton(b, index) {
    const label = (b.label && (this.state.level <= 2 || this.state.level === b.level)) ? " " + b.label : ''

    if (b.component) {
      const ElComponent = b.component
      return <ElComponent label={label} key={index} />
    }

    const title = this.state.level > 3 ? b.label : ''
    const hidden = b.level > this.state.level ? " invisible" : ' isvisible' // isvisible because visible is reserved
    const active = b.active ? " primary" : ''
    const disabled = b.disabled ? " disabled" : ''
    if (b.shortcut)
      this.registerShortcut(b.shortcut, b.name)
    
    let className = "ui button hazPopup animate " + hidden + active + disabled
    // button is new
    if (this.visibleButtons && this.visibleButtons.indexOf(b.name) === -1)
      className += " new"
    
    return (
      <div className={className}
           style={{position: "relative"}}
           ref={(button) => {this._addButton(button, index)}}
           onClick={this._handleClick.bind(this, b.name)}
           onMouseDown={this._moveButtonStart.bind(this)}
           data-title={title}
           data-content={b.tooltip + (b.shortcut ? " [" + b.shortcut + "]" : '')}
           data-position="top center"
           key={index}
           data-index={index}
        ><i className={(b.icon ? b.icon : b.name) + " icon"}></i>{b.iconText ? b.iconText : ''}
        {label}
      </div>
    )
  }


  // Note that this relies on the slider created by /client/imports/components/Nav/NavBarGadgetUxSlider.js
  _addLevelSlider() {
    // The 1+ is so the last tool will not have it's label shown
    this.maxLevel = 1 + _.maxBy(this.props.config.buttons, 'level').level
    return utilActivateLevelSlider(this.maxLevel, this.lsLevelKey, this.state.level)
  }

  /* Button sorting */
  _moveButtonStart(e) {
    const b = this._extractButton(e.target)
    if (!b || e.buttons != 1)
      return

    this.startPos = {
      x: e.pageX,
      y: e.pageY
    }
    this.activeButton = b
  }


  _moveButton(e) {
    if (!this.activeButton)
      return

    const box = this.activeButton.getBoundingClientRect()
    this.activeButton.style.left = (e.pageX - this.startPos.x)+ "px"
    this.activeButton.style.top = (e.pageY - this.startPos.y)+ "px"

    const index = this.buttons.indexOf(this.activeButton)
    const mainBox = this.refs.mainElement.getBoundingClientRect()

    const row = this.getRow(mainBox, box, true)

    // check back
    for (let i=0; i<index; i++) 
    {
      const ab = this.buttons[i]
      if (!ab || ab.classList.contains("invisible"))
        continue
      
      const rect = ab.getBoundingClientRect()
      if (this.props.config.vertical)
        ab.style.top = (rect.top > box.top) ? box.height + "px"  : 0            
      else
        ab.style.left = (rect.left > box.left && this.getRow(mainBox, rect) == row) ? box.width + "px" : 0  
    }

    for (let i=index+1; i<this.buttons.length; i++) 
    {
      const ab = this.buttons[i]
      if (!ab || ab.classList.contains("invisible"))
        continue

      const rect = ab.getBoundingClientRect()
      if (this.props.config.vertical) 
        ab.style.top = (rect.top < box.top) ? -box.height + "px" : 0
      else
        ab.style.left = (rect.left < box.left && + this.getRow(mainBox, rect) == row) ? -box.width + "px" : 0
    }
  }


  _moveButtonStop(e) {
    if (!this.activeButton)
      return
    
    this.activeButton.classList.add("animate")
    const box = this.activeButton.getBoundingClientRect()
    const index = this.buttons.indexOf(this.activeButton)
    const mainBox = this.refs.mainElement.getBoundingClientRect()
    const row = this.getRow(mainBox, box)

    let mostLeft, mostRight, mostTop, mostBottom
    let left = 0, top = 0

    for (let i=0; i<index; i++) {
      const ab = this.buttons[i]
      // why do we have buttons detached from the dom tree?
      if (!ab || ab == this.activeButton || !ab.parentNode || !ab.parentNode.parentNode || ab.classList.contains("invisible"))
        continue
      
      const rect = ab.getBoundingClientRect()

      if (this.props.config.vertical) {
        if (rect.top > box.top){
          top -= rect.height
          if (!mostTop) 
            mostTop = ab
        }
      }
      else {
        if (rect.left + this.getRow(mainBox, rect) > box.left + row) {
          left -= rect.width
          // set first
          if (!mostLeft)
            mostLeft = ab
        }
      }
    }

    for (let i=index; i<this.buttons.length; i++) {
      const ab = this.buttons[i]
      if (!ab || ab == this.activeButton || !ab.parentNode || !ab.parentNode.parentNode || ab.classList.contains("invisible"))
        continue
      
      const rect = ab.getBoundingClientRect()
      if (this.props.config.vertical) {
        if (rect.top < box.top) {
          top += rect.height
          // set last
          mostBottom = ab
        }
      }
      else {
        if (rect.left + this.getRow(mainBox, rect) < box.left + row) {
          left += rect.width
          // set last
          mostRight = ab
        }
      }
    }
    // position has not changed
    if (
        (!mostLeft && !mostRight && !this.props.config.vertical) ||
        (!mostTop && !mostBottom && this.props.config.vertical)
      ){
      this.activeButton.style.top = 0
      this.activeButton.style.left = 0
      $(this.activeButton).popup('enable')
      this.activeButton = null
      return
    }

    this.hasMoved = true;
    // TODO: make browser compatible
    const active = this.activeButton

    this.activeButton.style.top = top + "px"
    this.activeButton.style.left = left + "px"

    const sort = (e) => 
    {
      e.target.removeEventListener("transitionend", sort)
      this.refs.mainElement.classList.add("no-animate")

      const data = this.order
      const index = parseInt(active.dataset.index, 10)
      const b = data.splice(index, 1)
      if (mostLeft)
        data.splice(parseInt(mostLeft.dataset.index, 10), 0, b[0])      
      else if (mostRight)
        data.splice(parseInt(mostRight.dataset.index, 10), 0, b[0])      
      else if (mostBottom)
        data.splice(parseInt(mostBottom.dataset.index, 10), 0, b[0])    
      else if (mostTop)
        data.splice(parseInt(mostTop.dataset.index, 10), 0, b[0])

      this.saveState()

      this.forceUpdate()
      for (let i=0; i<this.buttons.length; i++) {
        const btn = this.buttons[i]
        if (btn) {
          btn.style.left = 0
          btn.style.top = 0
        }
      }
      window.setTimeout(() => {
        this.refs.mainElement.classList.remove("no-animate")
      }, 1)
    }

    this.activeButton.addEventListener("transitionend", sort)
    this.activeButton = null
  }
  /* End of Button sorting */
}

Toolbar.propTypes = {
  name: PropTypes.string.isRequired, // Name of this toolbar instance. Should be one of toolbarScopeNames
  config: PropTypes.object.isRequired, // Config.. { buttons: {}, vertical: bool }
  levelName: PropTypes.string // Use this if you want to share active level with other toolbars - default = name
}
