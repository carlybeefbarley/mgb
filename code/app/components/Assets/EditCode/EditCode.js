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
    this.state = {
      gameRenderIterationKey: 0,
      isPlaying: false
    }

    this.iframeScript = 
 `
 <!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>MyGameBuilder Sandbox Frame</title>
  <style type="text/css">
    body {
      margin: 0;
    }
  </style>
  <script src="//cdn.jsdelivr.net/phaser/2.4.4/phaser.min.js"></script>
</head>

<body>
  <div id="game"></div>

  <script type="text/javascript">

    var _isAlive = false;

    window.onload = function() {
      _isAlive = true;
    }

    window.addEventListener('message', function (e) {
      var mainWindow = e.source;
      if (e.data === 'ping')
      {
        mainWindow.postMessage(_isAlive, e.origin);
      }
      else
      {
        try {
            eval(e.data);
        } catch (err) {
          console.log(err);
          //  This could probably be displayed in a modal of some kind in the main page
          mainWindow.postMessage(err.message, e.origin);
        }
      }

    });

  </script>

</body>
</html>
 `
  }


  // Graphic asset - Data format:
  //
  // content2.src                     // String with source code
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
    this.props.handleContentChange( newC2, "" )
  }

  componentDidUpdate() {
    this.getElementReferences()
  }
  
  getElementReferences()
  {
    this.iFrameWindow = document.getElementById("iFrame1")    
  }

  handleRun()
  {
    this.setState( {isPlaying: true } )
    this.iFrameWindow.contentWindow.postMessage(this.props.asset.content2.src, "*")    
  }

  handleStop()
  {
    this.setState( { gameRenderIterationKey: this.state.gameRenderIterationKey+1,
                     isPlaying: false
                   } )
//    this.iFrameWindow.contentWindow.location.reload(true)
  }

  render() {
    if (!this.props.asset) 
      return null;

    this.gameRenderIterationKey

    let asset = this.props.asset;

        return (
          <div className="ui grid">
            <div className="ui eight wide column">
              <AceEditor
              mode="javascript"
              theme="github"
              onChange={this.handleOnChange.bind(this)}
              name="aceEditControl"
              editorProps={{$blockScrolling: true}}
              value={asset.content2.src}
            />
            </div>
            <div className="ui seven wide column">
              <div className="ui row">
                <div className="ui icon buttons">
                { !this.state.isPlaying ? 
                  <a className={"ui icon button"} onClick={this.handleRun.bind(this)}>
                    <i className={"play icon"}></i>
                  </a>
                  :
                  <a className={"ui icon button"} onClick={this.handleStop.bind(this)}>
                    <i className={"stop icon"}></i>
                  </a>
                }
                </div>
              </div>
              <iframe key={ this.state.gameRenderIterationKey } id="iFrame1" width="610" height="460" sandbox='allow-modals allow-scripts' srcDoc={this.iframeScript}>
              </iframe>
            </div>
          </div>
        );
  }
}