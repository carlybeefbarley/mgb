import _ from 'lodash'
import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'

export default class GameScreen extends React.Component {

  constructor(props) {
    super(props)

  }

  componentDidMount() {
    this.iFrameWindow = ReactDOM.findDOMNode(this.refs.iFrame1)
    this.adjustIframe()
  }

  handleMessage(event){
    // console.log('handle message', event)
    // Message receivers like this can receive a lot of crap from malicious windows
    // debug tools etc, so we have to be careful to filter out what we actually care 
    // about
    const source = event.source
    const data = event.data

    const commands = {
      mgbConsoleMsg: function (data) {
        return this.props.consoleAdd(data)
      },
      // In a Phaser game, this is needed to enable screenshots if using WebGL renderer
      //   game.preserveDrawingBuffer = true;
      // OR use Phaser.CANVAS as the renderer
      mgbScreenshotCanvasResponse: function (data) {
        let asset = this.props.asset
        // asset.thumbnail = data.pngDataUrl
        // this.handleContentChange(null, asset.thumbnail, "update thumbnail")
      },

      mgbAdjustIframe: function(){
        this.adjustIframe()
      }
    }

    // iframe can be closed, but still receive something
    // console.log(this.iFrameWindow, source === this.iFrameWindow.contentWindow , data.hasOwnProperty("mgbCmd") , commands[data.mgbCmd])
    //source === this.iFrameWindow.contentWindow
    if (this.iFrameWindow && data.hasOwnProperty("mgbCmd") && commands[data.mgbCmd]) {
      commands[data.mgbCmd].call(this, data);
      console.log('call to iframe')
    }
  }

  postMessage(messageObject){
    this.iFrameWindow.contentWindow.postMessage(messageObject, "*")
  }

  adjustIframe() {
    console.log('adjust iframe')
    if(this.props.isPlaying) {

      window.setTimeout(() => {

        if(!this.props.isPlaying || !this.iFrameWindow || !this.iFrameWindow.contentWindow || !this.iFrameWindow.contentWindow.document.body){
          return
        }
        this.iFrameWindow.contentWindow.document.body.style.overflow = "hidden"

          const canvas = this.iFrameWindow.contentWindow.document.querySelector("#game")

          const newWidth = canvas ? canvas.offsetWidth : 0
          const newHeight = canvas ? canvas.offsetHeight : 0

        if (parseInt(this.iFrameWindow.getAttribute("width")) == newWidth
              && parseInt(this.iFrameWindow.getAttribute("height")) == newHeight
          ) {
          return
        }
        console.log(newWidth, newHeight)
        this.iFrameWindow.setAttribute("width", newWidth + "")
        this.iFrameWindow.setAttribute("height", newHeight + "")
        // keep adjusting
        this.adjustIframe()
      }, 1000)
    }
  }

  render(){
    return (
      <div style={{position:"absolute"
      , zIndex: 100, bottom:"0px", backgroundColor:"white"
      }}>
        <div style={{height:"20px"}}>
          <button className="ui mini right floated icon button">
            <i className="remove icon"></i>
          </button>
          <button className="ui mini right floated icon button">
            <i className="minus icon"></i>
          </button>
          <button className="ui mini right floated icon button">
            <i className="move icon"></i>
          </button>
        </div>
        <iframe
          key={ this.props.gameRenderIterationKey }
          ref="iFrame1"
          sandbox='allow-modals allow-same-origin allow-scripts allow-popups'
          src="/codeEditSandbox.html"
          frameBorder="0">
        </iframe>
      </div>
    )
  }

}