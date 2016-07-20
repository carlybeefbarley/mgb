import React, { PropTypes } from 'react';
import MapArea from "./MapArea.js";
import InfoTool from "./Tools/InfoTool.js";
import { snapshotActivity } from '/imports/schemas/activitySnapshots.js';

export default class EditMap extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      tools: {}
    };
  }


  /* This stores a short-term record indicating this user is viewing this Map
   * It provides the data for the 'just now' part of the history navigation and also 
   * the 'viewers' indicator. It helps users know other people are looking at some asset
   * right now
   */
  doSnapshotActivity()
  {
    let passiveAction = {
      isMap: true     // This could in future have info such as which layer is being edited, but not needed yet 
    }
    snapshotActivity(this.props.asset, passiveAction)
  }

  componentDidMount() {
    this.doSnapshotActivity()
  }
  
  handleOnChange(updatedSourceCodeAsString) {
    let newC2 = { src: updatedSourceCodeAsString };
    this.props.handleContentChange( newC2, "" ); // TODO: Thumbnail is second param
  }

  handleSave(reason) {
    // TODO: convert uploaded images to assets
    console.log(reason);
    this.props.handleContentChange(this.refs.mapArea.data, this.refs.mapArea.generatePreview(), reason);
  }

  render() {
    if (!this.props.asset){
      return null
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
          <MapArea asset={asset} parent={this} ref="mapArea">{asset}</MapArea>
        </div>
        <div className="six wide column">
          {tools}
        </div>
      </div>
     );
  }
}
