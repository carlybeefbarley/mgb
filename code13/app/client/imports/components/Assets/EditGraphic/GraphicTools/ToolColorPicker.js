import React, { PropTypes } from "react"
import ReactDOM from 'react-dom'

let ToolColorPicker;
class ColorPicker extends React.Component {

  static propTypes = {
    // it will show up when button is large enough to fit label
    label: React.PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.string
      ]).isRequired
  }

  _getActivitingJqElement() {
    const $a = $(ReactDOM.findDOMNode(this))
    return $a.find('.mgbColorPickerIcon.icon').parent()
  }

  componentDidMount() {
    const $cp = this._getActivitingJqElement()
    $cp.popup({
      on: 'click',
      popup: '.mgbColorPickerWidget.popup',
      position: 'right center',
      lastResort: 'right center',               // forces it to always show: https://github.com/Semantic-Org/Semantic-UI/issues/3004
      hoverable: true
    })
  }

  componentWillUnmount() {
    const $cp = this._getActivitingJqElement()
    $cp.popup('destroy')
  }

  render() {
    return (
      <div
        className="ui button animate"
        style={{position: "relative"}}
        data-title={ToolColorPicker.label}
        ><i className={ToolColorPicker.icon + " icon"}></i>
        {this.props.label}
      </div>)
  }
}

ToolColorPicker = {
  label: "Color Picker",
  name: "colorPicker",
  tooltip: "Color Picker",
  //mgbColorPickerIcon is used to find this on the page for some popups. See main page.
  icon: "mgbColorPickerIcon block layout icon",        // Semantic-UI icon CSS class
  shortcut: '',
  level: 1,
  simpleTool: true,   // this tool is not selectable, only action is on tool click
  component: ColorPicker
}

export default ToolColorPicker
