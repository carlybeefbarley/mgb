import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'

import { makeCDNLink } from '/client/imports/helpers/assetFetchers'

import './editcode.css'

export default class GameScreen extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      isMinimized: false,
      isHidden:    true
    }

    this.screenX = 0
    this.screenY = 0 // px from bottom
    this._isIframeReady = false
  }

  componentDidMount() {
    this.getReference()
  }

  componentDidUpdate(prevProps, prevState) {
    this.getReference()
    if (!prevProps.isPlaying && this.props.isPlaying && this.state.isMinimized)
      this.minimize()
  }

  componentWillReceiveProps(props){
    this.postMessage({mgbCommand: "requestSizeUpdate"})
  }

  getReference() {
    // TODO - change to use the ref={ c => { codestuff } } pattern that is now recommended.
    //        This will also help with the TODO in EditCode:_handle_iFrameMessageReceiver
    this.iFrameWindow = ReactDOM.findDOMNode(this.refs.iFrame1)
    this.wrapper = ReactDOM.findDOMNode(this.refs.wrapper)
  }

  handleMessage(event) {

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

      mgbAdjustIframe: function(data) {
        this.adjustIframe(data.size)
      },
      mgbSetIframeReady: function(){
        this._isIframeReady = true
      }
    }

    // iframe can be closed, but still receive something
    // console.log(this.iFrameWindow, source === this.iFrameWindow.contentWindow , data.hasOwnProperty("mgbCmd") , commands[data.mgbCmd])
    //source === this.iFrameWindow.contentWindow
    if (this.iFrameWindow && data.hasOwnProperty("mgbCmd") && commands[data.mgbCmd])
      commands[data.mgbCmd].call(this, data)
  }

  stop(){
    if(this.refs.iFrame1) {
      this.refs.iFrame1.src = makeCDNLink('/codeEditSandbox.html')
      this._isIframeReady = false
    }
    // reset game screen size on stop
    if(this.wrapper){
      this.wrapper.style.width = this.props.isPopup ? "auto" : '100%'
      this.wrapper.style.height = "320px"
      this.iFrameWindow.setAttribute("width", "100%")
      this.iFrameWindow.setAttribute("height", "100%")
    }
  }

  isIframeReady(){
    const lastVal = this._isIframeReady
    // reset ready status for next stop
    this._isIframeReady = false
    return lastVal
  }
  postMessage(messageObject) {
    if (messageObject.mgbCommand == "startRun")
      this.setState( { isHidden: false } )
    this.getReference()
    this.iFrameWindow.contentWindow.postMessage(messageObject, "*")
  }

  minimize() {
    this.setState( { isMinimized: !this.state.isMinimized } )
  }

  close() {
    this.props.handleStop()
  }

  adjustIframe(size) {

    this.iFrameWindow.setAttribute("width", size.width + "")
    this.iFrameWindow.setAttribute("height", size.height + "")
    const bounds = this.wrapper.getBoundingClientRect()
    const w = Math.min(window.innerWidth*0.5, size.width)
    const h = Math.min(window.innerHeight*0.5, size.height)
    if(this.props.isPopup){
      this.wrapper.style.width = w + "px"
      this.wrapper.style.height = h + "px"
    }
    else
      this.wrapper.style.width = '100%'
    // height will break minimize
    // this.wrapper.style.height = size.height + "px"
    // this.wrapper.style.height = "initial"
  }

  onDragStart (e) {
    // empty image so you don't see canvas element drag. Need to see only what is dragged inside canvas
    // don't do this on mobile devices
    // e.preventDefault()
    if (e.dataTransfer) {
      let ghost = e.target.cloneNode(true)
      ghost.style.display = "none"
      e.dataTransfer.setDragImage(ghost, 0, 0)
    }
    if (e.touches && e.touches[0])
      e = e.touches[0]
    this.dragStartX = e.clientX
    this.dragStartY = e.clientY
  }

  onDrag (e) {
    e.preventDefault()
    if (e.touches && e.touches[0])
      e = e.touches[0]

    if (e.clientX == 0 && e.clientY == 0)
      return   // avoiding weird glitch when at the end of drag 0,0 coords returned

    this.screenX += this.dragStartX - e.clientX
    this.screenY += this.dragStartY - e.clientY
    this.dragStartX = e.clientX
    this.dragStartY = e.clientY
    this.wrapper.style.right = this.screenX + "px"
    this.wrapper.style.bottom = this.screenY + "px"
  }

  render() {
    return (
      <div
          ref="wrapper"
          id="gameWrapper"
          className={this.props.isPopup ? "popup" : "accordion"}
          style={{
            display: (this.state.isHidden && !this.props.isPlaying) ? "none" : "block",
            overflow: this.props.isPopup ? 'initial' : "auto",
            width: this.props.isPopup ? window.innerHeight * 0.3 : "100%",
            height: "320px",
            minWidth: "200px",
            minHeight: "160px",
            maxHeight: (window.innerHeight * 0.5) + "px",
            maxWidth: (window.innerWidth * 0.5) + 'px'
          }}>
        { this.props.isPopup &&
          <div style={{
            transform:        "translateY(-100%)",
            position:         "absolute",
            right:            "0",
            left:             "0",
            backgroundColor:  "inherit"
          }}>
            <button
                title="Close"
                className="ui mini right floated icon button"
                onClick={this.close.bind(this)} >
              <i className="remove icon" />
            </button>

            <button
                title={this.state.isMinimized ? "Maximize" : "Minimize"}
                className="ui mini right floated icon button"
                onClick={this.minimize.bind(this)} >
              <i className={"icon " +(this.state.isMinimized ? "maximize" : "minus")} />
            </button>

            <button
                title="Drag Window"
                className="ui mini right floated icon button"
                draggable={true}
                onDragStart={this.onDragStart.bind(this)}
                onDrag={this.onDrag.bind(this)}
                onTouchStart={this.onDragStart.bind(this)}
                onTouchMove={this.onDrag.bind(this)} >
              <i className="move icon" />
            </button>

          </div>
        }
        <iframe
            style={{
              display:    this.state.isMinimized ? "none" : "block",
              minWidth:   "100%",
              minHeight: window.innerHeight * 0.3
            }}
            // key={ this.props.gameRenderIterationKey }
            ref="iFrame1"
            sandbox='allow-modals allow-same-origin allow-scripts allow-popups allow-pointer-lock'
            src={makeCDNLink('/codeEditSandbox.html')}
            frameBorder="0"
            id="mgbjr-EditCode-sandbox-iframe"
            >
        </iframe>
      </div>
    )
  }
}
