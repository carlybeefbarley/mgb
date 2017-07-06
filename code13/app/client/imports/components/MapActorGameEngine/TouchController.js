import React from 'react'
import ReactDOM from 'react-dom'
import {Portal } from 'semantic-ui-react'

import './TouchController.css'

export default class TouchController extends React.Component {
  static propTypes = {
    availableWidth: React.PropTypes.number // available horizontal space
  }

  componentDidMount() {
    this.node = this.refs.controller
    if(!this.node)
      return
    // delay opacity for nice (arguably) CSS animation
    setTimeout(() => {
      this.node.style.opacity = 0.5
    }, 100)

    this.mousemove = e => {
      const key = e.target.dataset.key || e.target.parentNode.dataset.key
      if (!key)
        return

      e.preventDefault()
      e.stopPropagation()
    }

    // fix: #670
    this.node.addEventListener('mousemove', this.mousemove, {passive: false})
    this.node.addEventListener('touchmove', this.mousemove, {passive: false})
  }

  componentWillUnmount() {
    const node = this.refs.controller
    if(!node)
      return
    node.removeEventListener('mousemove', this.mousemove)
    node.removeEventListener('touchmove', this.mousemove)
  }

  handleInput(e, up) {
    const key = e.target.dataset.key || e.target.parentNode.dataset.key
    const which = parseInt(e.target.dataset.which || e.target.parentNode.dataset.which, 10)

    if (!key) {
      // fix: #670 - probably too annoying - as it allows to click through gamepad's body
      const t = e.target
      t.style.pointerEvents = 'none'
      window.setTimeout(() => {
        t.style.pointerEvents = ''
      }, 0)
      return
    }
    const ev = new KeyboardEvent(up ? "keyup" : "keydown", {which, key})
    // older chrome requires these to be set directly
    ev.which = which
    ev.key = key
    window.dispatchEvent(ev)
    e.preventDefault()
    e.stopPropagation()
  }

  // Do not access document when server side rendering
  getMountNode = () => typeof window !== 'undefined'
    ? this.props.mountNode || document.body
    : null

  render() {

    const width = this.props.availableWidth || window.innerWidth
    return (
      <Portal
        open={true}
        mountNode={document.body}
      >
        <div className="ui icon game" id="mgb-mage-touch-controller"
             onMouseDown={e => this.handleInput(e, false)}
             onTouchStart={e => this.handleInput(e, false)}

             ref='controller'
             onMouseUp={e => this.handleInput(e, true)}
             onTouchEnd={e => this.handleInput(e, true)}
          // allow long click - fix #551
             onContextMenu={e => event => {
               event.preventDefault()
               event.stopPropagation()
               return false;
             }}
             style={{
               width: width + 'px',
               height: (width * 0.35) + 'px',
               fontSize: (width * 0.0001) + 'px',
               left: 0
             }}
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
      </Portal>
    )
  }
}
