import React, { PropTypes } from 'react';
import MapArea from "./MapArea.js";
import InfoTool from "./Tools/InfoTool.js";


export default class EditMap extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      tools: {}
    };
  }

  // static PropTypes = {
  //   asset: PropTypes.object
  // }


  // Map asset - Data format:
  //
  // content2.src                     // String with Tiled Map Editor (mapeditor.org) exported in JSON format
  //
  // We are using the https://www.npmjs.com/package/react-ace control to Edit
  //
  // React Callback: componentDidMount()
  componentDidMount() {

  }
  
  handleOnChange(updatedSourceCodeAsString) {
    let newC2 = { src: updatedSourceCodeAsString };
    this.props.handleContentChange( newC2, "" ); // TODO: Thumbnail is second param
  }

  handleSave(e){
    // TODO: save stored images
    const changeText = "Changing Map:" + this.props.asset.name;
    this.props.handleContentChange(this.props.asset.content2, "", changeText);
  }

  render() {
    if (!this.props.asset){
      return null;
    }

    const asset = this.props.asset;
    let tools = [];
    // TODO: separate tools by type - and fallback to InfoTool
    Object.keys(this.state.tools).forEach((tool) => {
      const Element = this.state.tools[tool].type || InfoTool;

      tools.push(<Element asset={asset} info={this.state.tools[tool]} key={tool} />)
    });

    return (
      <div className="ui grid">
        <div className="ten wide column">
          <MapArea asset={asset} parent={this}>{asset}</MapArea>
        </div>
        <div className="six wide column">
          {tools}
        </div>
      </div>
     );
  }
}
