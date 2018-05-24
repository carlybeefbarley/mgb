import React from 'react'
import _ from 'lodash'
import { joyrideStore } from '/client/imports/stores'

export default class ActorMapProperties extends React.Component {
  constructor(...args) {
    super(...args)
    this.state = {
      width: this.props.data.width,
      height: this.props.data.height,
      // Previous values to reset to when input is empty or ESC is pressed
      prevWidth: this.props.data.width,
      prevHeight: this.props.data.height,
    }
    this.min = 1
    this.max = 300
    this.timeout = null

    // Throttle input and handle input changes and min/max input values
    this.handleChange = e => {
      e.persist()
      var { value, name } = e.target

      this.setState({ [name]: value })
    }
  }

  handleKeyUp = e => {
    const { key, target: { name } } = e

    if (key === 'Enter') {
      this.onFinalChange(e)
      return
    }
    // Reset to previous value when ESC pressed
    if (key === 'Escape') {
      this.setState({ [name]: this._getPrevState(name) })
      e.preventDefault()
      return
    }
  }

  // Save changes made to input and update previous values
  onFinalChange = e => {
    const { value, name } = e.target
    const prevName = this._getPrevStateName(name)
    const newVal = this._fixValue(value, name)
    const prevVal = this._getPrevState(name)
    if (newVal === prevVal) return

    const newState = { ...this.state, [name]: newVal, [prevName]: prevVal }

    this.props.resize(newState)
    this.setState(newState)

    if (name === 'height') {
      joyrideStore.completeTag(`mgbjr-CT-MapTools-properties-resizeHeight`)
    }
  }

  _fixValue(value, name) {
    //if (!value) return this._getPrevState(name)
    return _.clamp(value, this.min, this.max)
  }

  _getPrevStateName(name) {
    return 'prev' + _.capitalize(name)
  }

  _getPrevState(name) {
    return this.state[this._getPrevStateName(name)]
  }

  render() {
    return (
      <div id="mgbjr-MapTools-properties">
        <div className="ui small labeled input">
          <div className="ui small label" title="Map width">
            w:
          </div>
          <input
            className="ui small input"
            id="mgbjr-MapTools-width"
            type="number"
            name="width"
            value={this.state.width}
            style={{ width: '6em' }}
            min={this.min}
            max={this.max}
            disabled={this.props.disabled}
            onBlur={this.onFinalChange}
            onKeyUp={this.handleKeyUp}
            onChange={this.handleChange}
          />
        </div>
        <span>&nbsp;&nbsp;</span>
        <div className="ui small labeled input">
          <div className="ui small label" title="Map width">
            h:
          </div>
          <input
            className="ui small input"
            id="mgbjr-MapTools-height"
            type="number"
            name="height"
            value={this.state.height}
            style={{ width: '6em' }}
            min={this.min}
            max={this.max}
            disabled={this.props.disabled}
            onBlur={this.onFinalChange}
            onKeyUp={this.handleKeyUp}
            onChange={this.handleChange}
          />
        </div>
      </div>
    )
  }
}
