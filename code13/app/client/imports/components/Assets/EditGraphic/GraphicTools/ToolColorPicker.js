import React, { PropTypes } from "react";

let ToolColorPicker;
class ColorPicker extends React.Component {

  static propTypes = {
    // it will show up when button is large enough to fit label
    label: React.PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.string
      ]).isRequired
  }

  render(){
    return (
      <div
        className="ui button animate"
        style={{position: "relative"}}
        data-title={ToolColorPicker.label}
        data-position="bottom left"
        ><i className={ToolColorPicker.icon + " icon"}></i>
        {this.props.label}
      </div>)
  }
}

ToolColorPicker = {
  label: "Color Picker",
  name: "colorPicker",
  tooltip: "Color Picker",
  icon: "block layout icon",        // Semantic-UI icon CSS class
  shortcut: '',
  level: 1,
  simpleTool: true,   // this tool is not selectable, only action is on tool click
  component: ColorPicker
}

export default ToolColorPicker
