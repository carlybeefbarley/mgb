import React, { Component } from 'react'

class InputBox extends Component {
  componentWillUpdate = (nextProps, nextState) => {
    this.refs.input.value = nextProps.defaultValue
  }

  render() {
    const inputProps = {
      id: '',
      type: 'text',
      defaultValue: '',
      defaultChecked: '',
      onChange: '',
      className: 'input-base',
      containerClassName: 'input-container',
      labelClassName: 'input-label-base',
      ...this.props,
    }
    const { containerClassName, labelClassName, label, id, rightFloated } = inputProps

    delete inputProps.containerClassName
    delete inputProps.labelClassName
    delete inputProps.rightFloated

    // console.log(inputProps)

    return (
      <div className={'ui labeled input ' + (rightFloated ? 'right floated' : '')}>
        <div className="ui label">{label}</div>
        <input name={id} ref="input" {...inputProps} />
      </div>
    )
  }
}

export default InputBox
