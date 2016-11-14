import _ from 'lodash'
import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'

export default class GameScreen extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      isMinimized: false
      , isHidden: true
    }
    this.screenX = 0
    this.screenY = 0 // px from bottom
  }

  componentDidMount() {
    this.getReference()
    this.adjustIframe()
  }

  componentDidUpdate(prevProps, prevState){
    if(!prevProps.isPlaying && this.props.isPlaying && this.state.isMinimized){
      this.minimize()
    }
  }

  getReference(){
    this.iFrameWindow = ReactDOM.findDOMNode(this.refs.iFrame1)
    this.wrapper = ReactDOM.findDOMNode(this.refs.wrapper)
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
        asset.thumbnail = data.pngDataUrl
        this.props.handleContentChange(null, asset.thumbnail, "update thumbnail")
      },

      mgbAdjustIframe: function(){
        this.adjustIframe()
      }
    }

    // iframe can be closed, but still receive something
    // console.log(this.iFrameWindow, source === this.iFrameWindow.contentWindow , data.hasOwnProperty("mgbCmd") , commands[data.mgbCmd])
    //source === this.iFrameWindow.contentWindow
    if (this.iFrameWindow && data.hasOwnProperty("mgbCmd") && commands[data.mgbCmd]) {
      commands[data.mgbCmd].call(this, data)
    }
  }

  postMessage(messageObject){
    // console.log(messageObject)
    if(messageObject.mgbCommand == "startRun") this.setState({ isHidden: false })
    this.getReference()
    this.iFrameWindow.contentWindow.postMessage(messageObject, "*")
  }

  minimize(){
    this.setState({ isMinimized: !this.state.isMinimized })
  }

  close(){
    this.props.handleStop()
  }

  adjustIframe() {
    if(this.props.isPlaying) {

      window.setTimeout(() => {
        if(!this.props.isPlaying || !this.iFrameWindow || !this.iFrameWindow.contentWindow || !this.iFrameWindow.contentWindow.document.body){
          return
        }
        this.iFrameWindow.contentWindow.document.body.style.overflow = "hidden"

          const gameDiv = this.iFrameWindow.contentWindow.document.querySelector("#game")

          const newWidth = gameDiv ? gameDiv.offsetWidth : 0
          const newHeight = gameDiv ? gameDiv.offsetHeight : 0

        if (parseInt(this.iFrameWindow.getAttribute("width")) == newWidth
              && parseInt(this.iFrameWindow.getAttribute("height")) == newHeight
          ) {
          return
        }
        // console.log(newWidth, newHeight)
        this.iFrameWindow.setAttribute("width", newWidth + "")
        this.iFrameWindow.setAttribute("height", newHeight + "")
        this.wrapper.style.width = newWidth + "px"
        // keep adjusting
        this.adjustIframe()
      }, 1000)

    }
  }

  render(){
    return (
      <div ref="wrapper" style={{position:"absolute"
      , zIndex: 100, bottom:"0px", backgroundColor:"white", padding: 0
      , display: this.state.isHidden || !this.props.isPlaying ? "none" : "block"
      }}>
        <div style={{height:"20px"}}>
          <button title="Close" className="ui mini right floated icon button"
          onClick={this.close.bind(this)}
          >
            <i className="remove icon"></i>
          </button>
          <button className="ui mini right floated icon button"
          title={this.state.isMinimized ? "Maximize" : "Minimize"}
          onClick={this.minimize.bind(this)}
          >
            <i className={"icon " +(this.state.isMinimized ? "maximize" : "minus")}></i>
          </button>
          <button title="Drag Window" className="ui mini right floated icon button">
            <i className="move icon"></i>
          </button>
        </div>
        <iframe
          style={{ display: this.state.isMinimized ? "none" : "block" }}
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