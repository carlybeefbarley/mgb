"use strict"
import React from "react"
import ReactDOM from 'react-dom'

const CTRL = 1 << 8
const SHIFT = 1 << 9
const ALT = 1 << 10

export default class Toolbar extends React.Component {

  constructor(...args){
    super(...args)
    window.toolbar = this;
    this.keyActions = {}
    this.buttons = window.buttons = []

    if(this.props.name == void(0)){
      console.warn("Every toolbar instance needs name");
    }
    // separate these - and allow some toolbars to share level???
    this.lsDataKey = "toolbar-data-" + this.props.name
    this.lsLevelKey = "toolbar-level-" + this.props.levelName || this.props.name

    this._activeButton = null
    this.startPos = null
    this.hasMoved = false

    this.level = localStorage.getItem(this.lsLevelKey) || this.props.config.level
    this.levelSlider = this._addLevelSlider()

    this.order = new Array(this.props.config.buttons.length)
    // foreach will skip undefined values :/
    this.order.fill(0);
    this.order.forEach((v, k) => {
      this.order[k] = k
    })

    this._onChange = () => {
      this.level = parseInt(levelSlider.value, 10)
      localStorage.setItem(this.lsLevelKey, this.level)
      this.forceUpdate()
    }

    this._onKeyDown = (e) => {
      let keyval = this.getKeyval(e);
      if(this.keyActions[keyval]){
        e.preventDefault();
        // do we need this?
        e.stopPropagation();
      }
    };
    this._onKeyUp = (e) => {
      let keyval = this.getKeyval(e);
      if(this.keyActions[keyval]){
        const b = this.getButtonFromAction(this.keyActions[keyval].action);
        if(!b || b.disabled){
          return;
        }
        e.preventDefault()
        this.keyActions[keyval](e)
      }
    }

    this._onMouseMove = (e) => {
      this._moveButton(e);
    }

    this._onMouseUp = this._moveButtonStop.bind(this)

    this.loadState()
  }
  set activeButton(v){
    if(v) {
      v.classList.remove("animate")
      v.classList.add("main")
      $(v).popup('destroy')
    }
    else{
      this._activeButton.classList.add("animate")
      this._activeButton.classList.remove("main")
      // TODO: dont repeat..
      $(this._activeButton).popup( { delay: {show: 250, hide: 0}} )
    }
    this._activeButton = v
  }
  get activeButton(){
    return this._activeButton
  }

  getRow(mb, b){
    const totRows = Math.round(mb.height / b.height);
    if(totRows == 0){
      return 0
    }
    const relY = (b.top - mb.top)

    const row = Math.round( (relY / mb.height) * totRows )
    return mb.width * row
  }
  getKeyval(e){
    let keyval = e.which
    // TODO: ADD OSX CMD.. threat as CTRL? ASK @dgolds
    e.shiftKey && (keyval |= SHIFT)
    e.ctrlKey && (keyval |= CTRL)
    e.altKey && (keyval |= ALT)
    return keyval;
  }

  componentDidMount(){
    this.levelSlider.addEventListener("input", this._onChange)

    let $a = $(ReactDOM.findDOMNode(this))
    $a.find('.hazPopup').popup( { delay: {show: 250, hide: 0}} )

    window.addEventListener("keyup", this._onKeyUp)
    window.addEventListener("mousemove", this._onMouseMove)
    window.addEventListener("mouseup", this._onMouseUp)

  }
  componentWillUnmount(){
    this.levelSlider.removeEventListener("input", this._onChange)
    window.removeEventListener("keyup", this._onKeyUp)
    window.removeEventListener("mousemove", this._onMouseMove)
    window.removeEventListener("mouseup", this._onMouseUp)
  }

  // we need to keep local order, but update another props
  // probably convert to hashmap (object) and back would be faster
  componentWillReceiveProps(props){
    const len = props.config.buttons.length;
    // add extra buttons spots
    if(this.order.length < len){
      for(let i=this.order.len; i<len; i++){
        this.order[i] = i;
      }
    }
    this.data = props.config;
    /*let p = props.config.buttons
    let o = this.data.buttons

    for(let i=0; i<p.length; i++){
      for(let j=0; j<o.length; j++){
        if(o[j].name == p[i].name){
          //const dataKeys = Object.keys(this.data[j])
          const newKeys = Object.keys(p[i])
          for(let k=0 k<newKeys.length k++){
            o[j][newKeys[k]] = p[i][newKeys[k]]
          }
        }
      }
    }*/
  }
  getButtonFromAction(action){
    return _.find(this.data.buttons, (o) => {
      return o.name == action
    })
  }
  registerShortcut(shortcut, action){
    const keys = shortcut.split("+")
    // create unique index where
    // first 8 bits is keycode
    // 9th bit is Ctrl
    // 10th bit is Shift
    // 11th bit is Alt
    let keyval = 0
    for(let i=0; i<keys.length; i++){
      const key = keys[i].toLowerCase().trim()
      switch(key){
        case "ctrl":
              keyval |= CTRL
              break
        case "alt":
              keyval |= ALT
              break
        case "shift":
              keyval |= SHIFT
              break
        default:
              if(key.length > 1){
                console.error("unknown key: [" + key + "]")
              }
              keyval |= key.toUpperCase().charCodeAt(0)
              break
      }
    }
    // TODO: check duplicate shortcuts?
    if(!this.props.actions[action]){
      console.error("missing action:", action)
      return
    }
    this.keyActions[keyval] = this.props.actions[action].bind(this.props.actions)
    this.keyActions[keyval].action = action;
  }

  saveState(){
    localStorage.setItem(this.lsDataKey, JSON.stringify(this.order))
  }

  loadState(){
    const savedData = localStorage.getItem(this.lsDataKey)
    this.data = this.props.config

    if(savedData){
      const pData = JSON.parse(savedData);
      // ignore old config
      if(pData.length && typeof(pData[0]) == "number" )
      this.order = pData
    }
  }

  render(){
    let size
    // TODO: are 3 levels enough?
    if(this.level < 3){
      size = "big"
    }
    else if(this.level < 6){
      size = "medium"
    }
    else{
      size = "tiny"
    }

    const buttons = []
    let parent = []
    buttons.push(parent)

    let b
    for(let i=0; i<this.order.length; i++){
      b = this.data.buttons[this.order[i]]
      if(!b){
        continue;
      }
      if(b.name == "separator"){
        parent = []
        buttons.push(parent)
        continue
      }
      // ship invisible buttons - to show nice rounded borders for side buttons
      if(b.level > this.level){
        continue;
      }
      parent.push(this._renderButton(b, i))
    }

    const content = []
    buttons.forEach((b, i) => {
      content.push(<div style={{marginRight: "4px"}} className={"ui icon buttons animate " + size + " " + "level" + this.level} key={i}>{b}</div>)
    })

    return (
      <div ref="mainElement" className="Toolbar">
        {content}
        <div className="ui button right floated mini reset"
             onClick={this.reset.bind(this)}
          >Reset<i className="level down reset icon"></i>
        </div>
      </div>
    )
  }

  reset(){
    this.order.forEach((v, k, o) => {
      o[k] = k;
    })
    this.saveState()
    this.forceUpdate()
  }
  /* private methods goes here */

  // adds react dom element that represents button
  _addButton(b, index){
    if(!b){
      // do I need to remove button here?
      return
    }
    this.buttons[index] = b
  }

  _handleClick(action, e){
    if(this.hasMoved || this.activeButton == this._extractButton(e.target) ){
      return
    }
    if(this.props.actions[action]){
      this.props.actions[action](e)
    }
    else{
      console.error("Cannot find action for button:", action)
    }
  }
  _extractButton(el){
    let b = el
    if(this.buttons.indexOf(b) == -1){
      if(this.buttons.indexOf(b.parentNode) > -1){
        b = b.parentNode
        return b
      }
      return null
    }
    return b
  }
  _renderButton(b, index){
    if(b.component){
      return b.component
    }
    const label = this.level <= 3 ? <div >{b.label}</div> : ''
    const title = this.level > 3 ? b.label : ''
    const hidden = b.level > this.level ? " invisible" : ' isvisible' // isvisible because visible is reserved
    const active = b.active ? " primary" : ''
    const disabled = b.disabled ? " disabled" : ''
    if(b.shortcut){
      this.registerShortcut(b.shortcut, b.name)
    }
    return (
      <div className={"ui button hazPopup animate " + hidden + active + disabled}
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

  _addLevelSlider(){
    let levelSlider = document.getElementById("levelSlider")
    if(!levelSlider){
      levelSlider = document.createElement("input")
      levelSlider.setAttribute("id", "levelSlider")
      levelSlider.setAttribute("type", "range")
      levelSlider.setAttribute("min", "1")
      levelSlider.setAttribute("max", "10")
      levelSlider.setAttribute("step", "1")

      levelSlider.style.position = "absolute"
      levelSlider.style.bottom = "0"
      levelSlider.style.left = "0"
      levelSlider.style.zIndex = "666"

      document.body.appendChild(levelSlider)
    }
    levelSlider.value = this.level
    return levelSlider;
  }

  _moveButtonStart(e){
    let b = this._extractButton(e.target)
    if(!b){
      return
    }
    b.getBoundingClientRect()
    this.startPos = {
      x: e.pageX,// + b.left,
      y: e.pageY// + b.top
    }
    this.activeButton = b
  }

  _moveButton(e){
    if(!this.activeButton){
      return
    }

    const box = this.activeButton.getBoundingClientRect()
    this.activeButton.style.left = (e.pageX - this.startPos.x)+ "px"
    this.activeButton.style.top = (e.pageY - this.startPos.y)+ "px"

    const index = this.buttons.indexOf(this.activeButton)
    const mainBox = this.refs.mainElement.getBoundingClientRect()

    const row = this.getRow(mainBox, box, true)

    // check back
    for(let i=0; i<index; i++){
      const ab = this.buttons[i]
      if(!ab || ab.classList.contains("invisible")){
        continue
      }
      const rect = ab.getBoundingClientRect()

      if( rect.left > box.left && this.getRow(mainBox, rect) == row ){
        ab.style.left = box.width + "px"
      }
      else{
        ab.style.left = 0
      }
    }

    for(let i=index +1; i<this.buttons.length; i++){
      const ab = this.buttons[i]
      if(!ab || ab.classList.contains("invisible")){
        continue
      }
      const rect = ab.getBoundingClientRect()
      if(rect.left < box.left && + this.getRow(mainBox, rect) == row){
        ab.style.left = -box.width + "px"
      }
      else{
        ab.style.left = 0
      }
    }
  }

  _moveButtonStop(e){
    if(!this.activeButton) {
      return
    }
    this.activeButton.classList.add("animate")
    const box = this.activeButton.getBoundingClientRect()
    const index = this.buttons.indexOf(this.activeButton)
    const mainBox = this.refs.mainElement.getBoundingClientRect()
    const row = this.getRow(mainBox, box)

    let mostLeft, mostRight
    let left = 0
    for(let i=0; i<index; i++){
      const ab = this.buttons[i]
      if(!ab || !ab.parentNode || ab.classList.contains("invisible")){
        continue
      }
      const rect = ab.getBoundingClientRect()
      if(rect.left + this.getRow(mainBox, rect) > box.left + row){
        left -= rect.width
        // set first
        if(!mostLeft){
          mostLeft = ab
        }
      }
    }

    for(let i=index +1; i<this.buttons.length; i++){
      const ab = this.buttons[i]
      if(!ab || !ab.parentNode || ab.classList.contains("invisible")){
        continue
      }
      const rect = ab.getBoundingClientRect()
      if(rect.left + this.getRow(mainBox, rect) < box.left + row){
        left += rect.width
        // set last
        mostRight = ab
      }
    }

    this.hasMoved = false
    // position has not changed
    if(!mostLeft && !mostRight){
      this.activeButton.style.top = 0
      this.activeButton.style.left = 0
      $(this.activeButton).popup('enable')
      this.activeButton = null
      return
    }
    this.hasMoved = true
    // TODO: make browser compatible
    const active = this.activeButton

    this.activeButton.style.top = 0
    this.activeButton.style.left = left + "px"

    const sort = (e) => {
      e.target.removeEventListener("transitionend", sort)
      this.refs.mainElement.classList.add("no-animate")

      const data = this.order
      const index = parseInt(active.dataset.index, 10)
      const b = data.splice(index, 1)
      if(mostLeft){
        data.splice(parseInt(mostLeft.dataset.index, 10), 0, b[0])
      }
      else if(mostRight){
        data.splice(parseInt(mostRight.dataset.index, 10), 0, b[0])
      }
      this.saveState()

      this.forceUpdate()
      for(let i=0; i<this.buttons.length; i++){
        const btn = this.buttons[i]
        if(btn) {
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
}
