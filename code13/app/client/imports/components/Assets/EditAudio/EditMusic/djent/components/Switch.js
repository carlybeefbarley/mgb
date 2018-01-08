import React, { Component } from 'react'

class Switch extends Component {
  shouldComponentUpdate = nextProps => this.props.isActive !== nextProps.isActive

  render() {
    const inputProps = {
      id: '',
      type: 'checkbox',
      defaultChecked: '',
      onChange: '',
      className: 'switch-input__input',
      containerClassName: 'switch-input',
      labelClassName: 'input-label',
      ...this.props,
    }
    const { containerClassName, labelClassName, customStyle, label, id } = inputProps

    delete inputProps.customStyle

    // console.log(customStyle)

    return (
      <div className={'ui toggle checkbox '} style={customStyle ? customStyle : {}}>
        <input
          type="checkbox"
          name={id}
          checked={this.props.isActive ? 'checked' : ''}
          onChange={this.props.onChange}
        />
        <label>{label}</label>
      </div>
    )
  }
}

export default Switch
