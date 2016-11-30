import React from 'react'
import ReactDOM from 'react-dom'

import './TouchController.css'

export default class TouchController extends React.Component{
  componentDidUpdate(){
    this.node = ReactDOM.findDOMNode(this)

  }
  handleInput(e, up){
    const key = e.target.dataset.key || e.target.parentNode.dataset.key
    const which = parseInt(e.target.dataset.which || e.target.parentNode.dataset.which, 10)
    if(!key){
      return
    }
    var ev = new KeyboardEvent(up ? "keyup": "keydown", {which, key})
    // older chrome requires these to bet directly
    ev.which = which
    ev.key = key
    window.dispatchEvent(ev)
    e.preventDefault()
    e.stopPropagation()
  }
  render(){

    return (
      <div className="ui icon game"
           id="controller"
          onMouseDown={e => this.handleInput(e, false)}
          onTouchStart={e => this.handleInput(e, false)}

          onMouseUp={e => this.handleInput(e, true)}
          onTouchEnd={e => this.handleInput(e, true)}
        >&#xf11b;
        <div className="button up" data-key="ArrowUp" data-which="38"><span>&uarr;</span></div>
        <div className="button left" data-key="ArrowLeft" data-which="37"><span>&larr;</span></div>
        <div className="button right" data-key="ArrowRight" data-which="39"><span>&rarr;</span></div>
        <div className="button down" data-key="ArrowDown" data-which="40"><span>&darr;</span></div>

        <div className="button shoot" data-key="Enter" data-which="13"><span>E</span></div>
        <div className="button melee" data-key="m" data-which="77"><span>M</span></div>
      </div>
    )
  }
}
