import React from 'react'
import ReactDOM from 'react-dom'

import './TouchController.css'

export default class TouchController extends React.Component{
  componentDidMount(){
    this.node = ReactDOM.findDOMNode(this)
    setTimeout(() => {
      this.node.style.opacity = 0.5
    }, 100)
  }
  handleInput(e, up){
    const key = e.target.dataset.key || e.target.parentNode.dataset.key
    const which = parseInt(e.target.dataset.which || e.target.parentNode.dataset.which, 10)
    if(!key){
      // fix: #670 - probably too annoying - as it allows to click through gamepad's body
      const t = e.target
      t.style.pointerEvents = 'none'
      window.setTimeout(() => {
        t.style.pointerEvents = ''
      }, 0)
      return
    }
    var ev = new KeyboardEvent(up ? "keyup": "keydown", {which, key})
    // older chrome requires these to be set directly
    ev.which = which
    ev.key = key
    window.dispatchEvent(ev)
    e.preventDefault()
    e.stopPropagation()
  }
  render(){

    return (
      <div className="ui icon game" id="controller"
          onMouseDown={e => this.handleInput(e, false)}
          onTouchStart={e => this.handleInput(e, false)}

          onMouseUp={e => this.handleInput(e, true)}
          onTouchEnd={e => this.handleInput(e, true)}
        >
        <div className="button arrow up" data-key="ArrowUp" data-which="38"></div>
        <div className="button arrow left" data-key="ArrowLeft" data-which="37"></div>
        <div className="button arrow right" data-key="ArrowRight" data-which="39"></div>
        <div className="button arrow down" data-key="ArrowDown" data-which="40"></div>

        <div className="button shoot" data-key="Enter" data-which="13"></div>
        <div className="button melee" data-key="m" data-which="77"></div>

        <div className="button pause" data-key="Control" data-which="17"></div>
        <div className="button inventory" data-key="i" data-which="73"></div>
      </div>
    )
  }
}
