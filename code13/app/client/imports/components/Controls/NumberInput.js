import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'

// This is a variant of <input> which handles the problems of enforcing val being between min & max
// but allowing temporary typing.. for example if min=1, max=10, how to type 9 (since blank can get set to 1)

// This component should also isolate a lot of browser and touch/mouse/kb depedent behaviours

// Replace this in fpFeatureLevels, in EditGraphic. Maybe in other places... sounds/graphic?

const _propTypes = {
  // These are applied to the class at the bottom of this file
  value: PropTypes.number.isRequired, // The value. See comment on //placeholder below.
  min: PropTypes.number.isRequired, // min value. Should be an integer...
  max: PropTypes.number.isRequired, // max value. Should be an integer...
  className: PropTypes.string,
  style: PropTypes.object, // Optional style for <input> element
  dottedBorderStyle: PropTypes.bool, // True for the convenient built-in dotted style instead of the default
  //placeholder:        PropTypes.number,             // No placeholder value supported. We are only supporting the 'controlled input' pattern in order to reduce the compat/test matrix
  onValidChange: PropTypes.func, // Callback param will be an integer guaranteed to be in range min...max. Called whenever input value is valid
  onFinalChange: PropTypes.func, // Callback param will be an integer guaranteed to be in range min...max
}

export default class NumberInput extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      internalValue: props.value,
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      internalValue: nextProps.value,
    })
  }

  _calcValidatedValue(event) {
    const { min, max } = this.props
    const parsedVal = parseInt(event.target.value, 10) || min
    return _.clamp(parsedVal, min, max)
  }

  _exposeChangedVal(event, callFinalAlso = false) {
    const { value, onValidChange, onFinalChange } = this.props
    const clampedVal = this._calcValidatedValue(event)
    this.setState({ internalValue: clampedVal })

    if (value !== clampedVal && onValidChange) onValidChange(clampedVal)

    if (callFinalAlso && value !== clampedVal && onFinalChange) onFinalChange(clampedVal)
  }

  _onBlur(event) {
    this._exposeChangedVal(event, true)
  }

  _onKeyUp(event) {
    if (event.key === 'Enter') this._exposeChangedVal(event, true)

    if (event.key === 27) {
      this.setState({ internalValue: this.props.value })
      event.preventDefault()
    }
  }

  // This will update the internal value.
  // If the current (internal) value is valid (i.e. a number between min and max), this function will
  // also send the current (valid) value up to the calling Component via props.onValidChange()
  _onInternalChange(event) {
    const { onValidChange } = this.props
    this.setState({ internalValue: event.target.value }) // Note that this is a string and can be null or ""
    const enteredValAsNum = parseInt(event.target.value, 10)
    if (this._calcValidatedValue(event) === enteredValAsNum && onValidChange) onValidChange(enteredValAsNum) //Looks good enough to do something with (i.e. it it in range)
  }

  render() {
    const { value, min, max, className, style, placeholder, dottedBorderStyle } = this.props
    const colorSty = this.state.internalValue != value ? { color: 'orange' } : {}
    const borderSty = dottedBorderStyle
      ? {
          borderStyle: 'dotted',
          borderWidth: '1px',
          borderColor: 'rgba(0,0,0,0.25)',
          backgroundColor: 'rgba(255,255,255,0)',
        }
      : {}
    const newStyle = { ...style, ...colorSty, ...borderSty }
    return (
      <input
        className={className}
        type="number"
        style={newStyle}
        placeholder={placeholder}
        value={this.state.internalValue}
        min={min}
        max={max}
        disabled={this.props.disabled}
        onChange={e => {
          this._onInternalChange(e)
        }}
        onBlur={e => {
          this._onBlur(e)
        }}
        onKeyUp={e => {
          this._onKeyUp(e)
        }}
      />
    )
  }
}

NumberInput.propTypes = _propTypes
