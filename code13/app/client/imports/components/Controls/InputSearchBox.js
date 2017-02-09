import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Input } from 'semantic-ui-react'

// This is a variant of <Input> which provides a nice default searchIcon and show 
// the icon action area in orange if changes are pending (user needs to push enter or click search)

const _propTypes = {    // These are applied to the class at the bottom of this file
  defaultValue:       PropTypes.string.isRequired,  // The value.
  className:          PropTypes.string,             // Additional classNames
  style:              PropTypes.object,             // Optional style for <input> element
  onFinalChange:      PropTypes.func.isRequired     // Callback param will be a string of length guaranteed to be in range 0...maxLen.
}

class InputSearchBox extends React.Component {

  componentWillReceiveProps(nextProps) {
    if (this.props.defaultValue !== nextProps.defaultValue)
      this.setState( { activeValue: nextProps.defaultValue } )
  }

  state = { activeValue: '' }

  _onKeyUp(event) {
    if (event.key === "Enter")
    {
      this.props.onFinalChange(this.state.activeValue)
      event.preventDefault()
    }
  }

  _onInternalChange (event) {
    this.setState( { activeValue: event.target.value } )
  }

  render() {
    const { defaultValue } = this.props
    const { activeValue } = this.state
    const actionColor = activeValue != defaultValue ? 'orange' : null
    return (
      <Input 
        placeholder='Search...'
        { ..._.omit(this.props, ['onFinalChange','value']) }
        defaultValue={defaultValue}
        onChange={ (e) => this._onInternalChange(e) }
        onKeyUp={ (e) => this._onKeyUp(e) }
        action={{ icon: 'search', color: actionColor, onClick: () => this.props.onFinalChange(activeValue)}}
        />
    )
  }
}

InputSearchBox.propTypes = _propTypes

export default InputSearchBox