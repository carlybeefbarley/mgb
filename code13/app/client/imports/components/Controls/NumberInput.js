import _ from 'lodash'
import React, { PropTypes } from 'react'


// This is a variant of <input> which handles the problems of enforcing val being between min & max
// but allowing temporary typing.. for example if min=1, max=10, how to type 9 (since blank can get set to 1)

// This component should also isolate a lot of browser and touch/mouse/kb depedent behaviours

// Replace this in fpFeatureLevels, in EditGraphic. Maybe in other places... sounds/graphic?

const _propTypes = {    // These are applied to the class at the bottom of this file
  value:              PropTypes.number.isRequired,
  min:                PropTypes.number.isRequired,
  max:                PropTypes.number.isRequired,
  className:          PropTypes.string,
  style:              PropTypes.object,
  dottedBorderStyle:  PropTypes.bool,               // True for the convenient built-in dotted style instead of the default
  placeholder:        PropTypes.number,
  onValidChange:      PropTypes.func.isRequired     // Callback param will be an integer guranteed to be in range min...max
}

export default class NumberInput extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      internalValue: props.value
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      internalValue: nextProps.value
    })
  }

  _calcValidatedValue(event) {
    const { min, max } = this.props
    const parsedVal = parseInt(event.target.value, 10) || min
    return _.clamp(parsedVal, min, max)
  }

  _exposeChangedVal(event) {
    const { value, onValidChange } = this.props
    const clampedVal = this._calcValidatedValue(event)
    this.setState({ internalValue: clampedVal })

    if (value !== clampedVal)
      onValidChange(clampedVal)
  }

  _onBlur(event) {
    this._exposeChangedVal(event)
  }

  _onKeyUp(event) {
    if (event.key === "Enter")
      this._exposeChangedVal(event)
    
    if (event.key === 27) {
      this.setState({ internalValue: this.props.value })
      event.preventDefault()
    }
  }

  // This will update the internal value. 
  // If the current (internal) value is valid (i.e. a number between min and max), this function will
  // also send the current (valid) value up to the calling Component via props.onValidChange()
  _onInternalChange(event)
  {
    this.setState( { internalValue: event.target.value } )  // Note that this is a string and can be null or ""
    const enteredValAsNum = parseInt(event.target.value, 10)
    if (this._calcValidatedValue(event) === enteredValAsNum)
      this.props.onValidChange(enteredValAsNum) //Looks good enough to do something with (i.e. it it in range)
  }

  render() {
    const { value, min, max, className, style, placeholder, dottedBorderStyle } = this.props
    const colorSty = this.state.internalValue != value ? { color: "orange" } : {}
    const borderSty = dottedBorderStyle ? { borderStyle: "dotted", borderColor: "rgba(0,0,0,0.3)", backgroundColor: "rgba(255,255,255,0)" } : {}
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
        onChange={ (e) => {this._onInternalChange(e)} }
        onBlur={ (e) => {this._onBlur(e)} }
        onKeyUp={ (e) => {this._onKeyUp(e)} }
        />
    )
  }
}

NumberInput.propTypes = _propTypes