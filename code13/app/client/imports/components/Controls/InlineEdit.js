import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'

// This is based on https://github.com/kaivi/ReactInlineEdit/blob/master/index.jsx
// dgolds copied it here August 2016 since the component wasn't being maintained and
// we are using it a lot - also it may benefit from some specialization for MGB.

// See https://github.com/kaivi/ReactInlineEdit/blob/master/README.md for info

function selectInputText(element) {
  element.setSelectionRange(0, element.value.length)
}

export default class InlineEdit extends Component {
  static propTypes = {
    text: PropTypes.string.isRequired,
    paramName: PropTypes.string.isRequired,
    change: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    className: PropTypes.string,
    activeClassName: PropTypes.string,
    minLength: PropTypes.number,
    maxLength: PropTypes.number,
    validate: PropTypes.func,
    style: PropTypes.object,
    editingElement: PropTypes.string,
    staticElement: PropTypes.string,
    tabIndex: PropTypes.number,
    isDisabled: PropTypes.bool,
    editing: PropTypes.bool,
  }

  static defaultProps = {
    minLength: 1,
    maxLength: 256,
    editingElement: 'input',
    staticElement: 'span',
    tabIndex: 0,
    isDisabled: false,
    editing: false,
  }

  state = {
    editing: this.props.editing,
    text: this.props.text,
    minLength: this.props.minLength,
    maxLength: this.props.maxLength,
  }

  componentWillMount() {
    this.isInputValid = this.props.validate || this.isInputValid
  }

  componentWillReceiveProps(nextProps) {
    const isTextChanged = nextProps.text !== this.props.text
    const isEditingChanged = nextProps.editing !== this.props.editing
    let nextState = {}
    if (isTextChanged) nextState.text = nextProps.text
    if (isEditingChanged) nextState.editing = nextProps.editing
    if (isTextChanged || isEditingChanged) this.setState(nextState)
  }

  componentDidUpdate(prevProps, prevState) {
    let inputElem = ReactDOM.findDOMNode(this.refs.input)
    if (this.state.editing && !prevState.editing) {
      inputElem.focus()
      selectInputText(inputElem)
    } else if (this.state.editing && prevProps.text != this.props.text) this.finishEditing()
  }

  startEditing = e => {
    if (this.props.stopPropagation) e.stopPropagation()
    this.setState({ editing: true, text: this.props.text })
  }

  finishEditing = () => {
    if (this.isInputValid(this.state.text) && this.props.text != this.state.text) this.commitEditing()
    else if (this.props.text === this.state.text || !this.isInputValid(this.state.text)) this.cancelEditing()
  }

  cancelEditing = () => {
    this.setState({ editing: false, text: this.props.text })
  }

  commitEditing = () => {
    this.setState({ editing: false, text: this.state.text })
    let newProp = {}
    newProp[this.props.paramName] = this.state.text
    this.props.change(newProp)
  }

  clickWhenEditing = e => {
    if (this.props.stopPropagation) e.stopPropagation()
  }

  isInputValid = text => {
    return text.length >= this.state.minLength && text.length <= this.state.maxLength
  }

  keyDown = event => {
    if (event.keyCode === 13) this.finishEditing()
    else if (event.keyCode === 27) this.cancelEditing()
  }

  textChanged = event => {
    this.setState({
      text: event.target.value.trim(),
    })
  }

  render() {
    const {
      activeClassName,
      className,
      editingElement,
      isDisabled,
      placeholder,
      style,
      staticElement,
      tabIndex,
    } = this.props
    const { text, editing } = this.state

    if (isDisabled) {
      const Element = staticElement
      return (
        <Element className={className} style={style}>
          {text || placeholder}
        </Element>
      )
    }

    if (!editing) {
      const Element = staticElement
      return (
        <Element
          className={className}
          onClick={this.startEditing}
          tabIndex={tabIndex}
          style={{ ...style, cursor: 'pointer' }}
        >
          {text || placeholder}
        </Element>
      )
    }

    const Element = editingElement
    const isValid = this.isInputValid(text)
    return (
      <Element
        onClick={this.clickWhenEditing}
        onKeyDown={this.keyDown}
        onBlur={this.finishEditing}
        className={activeClassName}
        placeholder={placeholder}
        defaultValue={this.state.text}
        onChange={this.textChanged}
        style={{ ...style, color: isValid ? null : 'red' }}
        ref="input"
      />
    )
  }
}
