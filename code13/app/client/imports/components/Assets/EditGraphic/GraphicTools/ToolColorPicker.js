import React from "react";

let ToolColorPicker;
class ColorPicker extends React.Component {
  render(){
    return (
      <div
        className="ui button hazPopup animate"
        style={{position: "relative"}}
        data-title={ToolColorPicker.label}
        data-position="bottom left"
        ><i className={ToolColorPicker.icon + " icon"}></i>
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
  component: <ColorPicker key="ColorPicker" />
}

export default ToolColorPicker
