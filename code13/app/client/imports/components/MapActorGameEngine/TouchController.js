import PropTypes from 'prop-types'
import React from 'react'
import ReactDOM from 'react-dom'

import './TouchController.css'

export default class TouchController extends React.Component {
  static propTypes = {
    availableWidth: PropTypes.number, // available horizontal space
  }
  componentDidMount() {
    this.node = ReactDOM.findDOMNode(this)

    // delay opacity for nice (arguably) CSS animation
    setTimeout(() => {
      this.node.style.opacity = 0.5
    }, 100)
  }
  handleInput = (e, up) => {
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
    // key is not supported by android chrome - until then which is there
    const event = new KeyboardEvent(up ? 'keyup' : 'keydown', { which, key })
    window.dispatchEvent(event)
    e.preventDefault()
    e.stopPropagation()
  }
  render() {
    const width = this.props.availableWidth || window.innerWidth
    return (
      <div
        className="ui icon game"
        id="mgb-mage-touch-controller"
        onMouseDown={e => this.handleInput(e, false)}
        onTouchStart={e => this.handleInput(e, false)}
        onMouseUp={e => this.handleInput(e, true)}
        onTouchEnd={e => this.handleInput(e, true)}
        // allow long click - fix #551
        onContextMenu={e => event => {
          event.preventDefault()
          event.stopPropagation()
          return false
        }}
        style={{
          width: width + 'px',
          height: width * 0.35 + 'px',
          fontSize: width * 0.0001 + 'px',
        }}
      >
        <div className="button arrow up" data-key="ArrowUp" data-which="38" />
        <div className="button arrow left" data-key="ArrowLeft" data-which="37" />
        <div className="button arrow right" data-key="ArrowRight" data-which="39" />
        <div className="button arrow down" data-key="ArrowDown" data-which="40" />

        <div className="button shoot" data-key="Enter" data-which="13" />
        <div className="button melee" data-key="m" data-which="77" />

        <div className="button pause" data-key="Control" data-which="17" />
        <div className="button inventory" data-key="i" data-which="73" />
      </div>
    )
  }
}
