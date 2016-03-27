import React, { PropTypes } from 'react';
import AceEditor from 'react-ace';
import brace from 'brace';
import SplitPane from 'react-split-pane';

import 'brace/mode/javascript';
import 'brace/theme/github';

export default class EditMap extends React.Component {
  // static PropTypes = {
  //   asset: PropTypes.object
  // }

  constructor(props) {
    super(props);
    this.state = {
    }
  }

  // Map asset - Data format:
  //
  // content2.src                     // String with Tiled Map Editor (mapeditor.org) exported in JSON format
  //
  // We are using the https://www.npmjs.com/package/react-ace control to Edit
  //
  // React Callback: componentDidMount()
  componentDidMount() {
    this.aceEditorDiv = $("#aceEditControl")  // CSS selector for Edit Control
    this.getElementReferences()
  }
  
  handleOnChange(updatedSourceCodeAsString) {
    let newC2 = { src: updatedSourceCodeAsString }
    this.props.handleContentChange( newC2, "" ) // TODO: Thumbnail is second param
  }

  componentDidUpdate() {
    this.getElementReferences()
  }
  
  getElementReferences()
  {
  }


  render() {
    if (!this.props.asset) 
      return null;

    this.gameRenderIterationKey

    let asset = this.props.asset;

        return (       
            <div style={ {"height": "500px"} }>               
                <SplitPane split="vertical" minSize="50">
                    <AceEditor
                        mode="javascript"
                        height="500px"
                        width="100%"
                        theme="github"
                        onChange={this.handleOnChange.bind(this)}
                        name="aceEditControl"
                        editorProps={{$blockScrolling: true}}
                        value={asset.content2.src} 
                      />
                    <div>
                      PREVIEW WILL GO HERE
                    </div>
                </SplitPane>
            </div>
        );
  }
}