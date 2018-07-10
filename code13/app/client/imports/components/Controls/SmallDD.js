import React, { Component } from 'react'
import { Dropdown } from 'semantic-ui-react'

export default class SmallDD extends Component {
  handleChange = (e, { value }) => {
    this.props.onChange && this.props.onChange(value)
  }

  render() {
    let options

    if (Array.isArray(this.props.options)) {
      options = this.props.options
    } else {
      options = []
      Object.keys(this.props.options).forEach(k => {
        options.push({ text: k, value: this.props.options[k] })
      })
    }

    return (
      <Dropdown
        fluid
        selection
        placeholder="Select..."
        onChange={this.handleChange}
        options={_.map(options, ({ text, value }, i) => ({
          key: value,
          text,
          value: value || text,
        }))}
      />
    )
  }
}
