import React, { PropTypes } from 'react';
import AceEditor from 'react-ace';
import brace from 'brace';

import 'brace/mode/javascript';
import 'brace/theme/github';


export default class EditCode extends React.Component {
  static PropTypes = {
    asset: PropTypes.object
  }

  constructor(props) {
    super(props);
  }


  // Graphic asset - Data format:
  //
  // content2.src                     // String with source code

  // We are using the https://www.npmjs.com/package/react-ace control to Edit

  // React Callback: componentDidMount()
  componentDidMount() {
    this.aceEditorDiv = $("#aceEditControl")  // CSS selector for Edit Control
  }
  
  
  handleOnChange(updatedSourceCodeAsString) {
    let newC2 = { src: updatedSourceCodeAsString }
    this.props.handleContentChange( newC2, "" )
  }


  render() {
    if (!this.props.asset) 
      return null;

    let asset = this.props.asset;

        return (<AceEditor
          mode="javascript"
          theme="github"
          onChange={this.handleOnChange.bind(this)}
          name="aceEditControl"
          editorProps={{$blockScrolling: true}}
          value={asset.content2.src}
        />);
  }
}