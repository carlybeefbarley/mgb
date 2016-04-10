import React, { PropTypes } from 'react';

export default class EditMap extends React.Component {
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
    let newC2 = { src: updatedSourceCodeAsString }
    this.props.handleContentChange( newC2, "" ) // TODO: Thumbnail is second param
  }


  render() {
    if (!this.props.asset) 
      return null;

    let asset = this.props.asset;

        return (       
            <div style={ {"minHeight": "500px"} }>  
            disabled             
                    
            </div>
        );
  }
}