import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Input } from 'semantic-ui-react'

// This is a variant of <Input> which provides a nice default searchIcon and show 
// the icon action area in orange if changes are pending (user needs to push enter or click search)

const _propTypes = {    // These are applied to the class at the bottom of this file
  value:       PropTypes.string.isRequired,  // The value.
  className:          PropTypes.string,             // Additional classNames
  style:              PropTypes.object,             // Optional style for <input> element
  onFinalChange:      PropTypes.func.isRequired     // Callback param will be a string of length guaranteed to be in range 0...maxLen.
}

class InputSearchBox extends React.Component {

  componentWillMount() {
    this.setState( { activeValue: this.props.value } )
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value)
      this.setState( { activeValue: nextProps.value } )
  }

  state = { activeValue: '' }

  _onKeyUp = (event) => {
    if (event.key === "Enter")
    {
      this._onActionClick()
      event.preventDefault()
    }
  }

  _onInternalChange = (event) => { this.setState( { activeValue: event.target.value } ) }
  _onActionClick = () => { this.props.onFinalChange(this.state.activeValue) }

  render() {
    const { value } = this.props
    const { activeValue } = this.state
    const actionColor = activeValue != value ? 'orange' : null
    return (
      <Input 
        placeholder='Search...'
        { ..._.omit(this.props, ['onFinalChange','value']) }
        value={activeValue}
        onChange={ this._onInternalChange }
        onKeyUp={ this._onKeyUp }
        action={ { 
          icon: { name: 'search', fitted: true }, 
          color: actionColor, 
          onClick: this._onActionClick
        }} />
    )
  }
}

InputSearchBox.propTypes = _propTypes

export default InputSearchBox