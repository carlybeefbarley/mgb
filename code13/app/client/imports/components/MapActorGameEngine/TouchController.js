import React from 'react'
import ReactDOM from 'react-dom'

import './TouchController.css'

export default class TouchController extends React.Component{
  componentDidMount(){
    const node = ReactDOM.findDOMNode(this).firstChild
    this.mousemove = e => {
      const key = e.target.dataset.key || e.target.parentNode.dataset.key
      if(!key)
        return

      e.preventDefault()
      e.stopPropagation()
    }
    // fix: #670
    node.addEventListener('mousemove', this.mousemove, {passive: false})
    node.addEventListener('touchmove', this.mousemove, {passive: false})


    setTimeout(() => {
      node.style.opacity = 0.5
    }, 100)
  }
  componentWillUnmount(){
    const node = ReactDOM.findDOMNode(this).firstChild
    node.removeEventListener('mousemove', this.mousemove)
    node.removeEventListener('touchmove', this.mousemove)
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
    const ev = new KeyboardEvent(up ? "keyup": "keydown", {which, key})
    // older chrome requires these to be set directly
    ev.which = which
    ev.key = key
    window.dispatchEvent(ev)
    e.preventDefault()
    e.stopPropagation()
  }
  render(){

    return (
      <div style={{marginLeft: '-1.5em' /* wrapper padding */}}>
        <div id="controller"
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
      </div>
    )
  }
}
