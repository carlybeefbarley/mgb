import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Input } from 'semantic-ui-react'

// This is a variant of <Input> which provides a nice default searchIcon and show
// the icon action area in orange if changes are pending (user needs to push enter or click search)

class InputSearchBox extends React.Component {
  static propTypes = {
    // These are applied to the class at the bottom of this file
    placeholder: PropTypes.string, // The placeholder. Will be Search... if not specified
    value: PropTypes.string.isRequired, // The value.
    className: PropTypes.string, // Additional classNames
    style: PropTypes.object, // Optional style for <input> element
    onFinalChange: PropTypes.func.isRequired, // Callback param will be a string of length guaranteed to be in range 0...maxLen.
  }

  state = { activeValue: '' }

  componentWillMount() {
    this.setState({ activeValue: this.props.value })
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) this.setState({ activeValue: nextProps.value })
  }

  _onKeyUp = event => {
    if (event.key === 'Enter') {
      this._onActionClick()
      event.preventDefault()
    }
  }

  _onInternalChange = event => {
    this.setState({ activeValue: event.target.value })
  }
  _onActionClick = () => {
    this.props.onFinalChange(this.state.activeValue)
  }

  render() {
    const { value, placeholder } = this.props
    const { activeValue } = this.state
    const actionColor = activeValue != value ? 'orange' : null
    return (
      <Input
        placeholder={placeholder || 'Search...'}
        {..._.omit(this.props, ['onFinalChange', 'value'])}
        value={activeValue}
        onChange={this._onInternalChange}
        onKeyUp={this._onKeyUp}
        action={{
          icon: 'search',
          color: actionColor,
          onClick: this._onActionClick,
        }}
      />
    )
  }
}

export default InputSearchBox
