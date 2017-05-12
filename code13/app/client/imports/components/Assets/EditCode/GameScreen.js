import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { Icon, Button } from 'semantic-ui-react'

import { makeCDNLink } from '/client/imports/helpers/assetFetchers'
import './editcode.css'

const _wrapperHeightPx = '320px'
const _popopButtonsRowStyle = {
  transform:        "translateY(-100%)",              // Move it to be *above* the top of the iFrame part of this Component
  boxShadow:        "0 1px 4px rgba(0, 0, 0, 0.2)",
  position:         "absolute",
  right:            "0",
  left:             "0",
  backgroundColor:  "inherit"
}

export default class GameScreen extends React.Component {

  static propTypes = {
    isPlaying: PropTypes.bool,
    isPopup:   PropTypes.bool,
    asset:     PropTypes.object,
    gameRenderIterationKey: PropTypes.number,
    
    handleStop: PropTypes.func.isRequired,
    handleContentChange: PropTypes.func.isRequired,
    consoleAdd: PropTypes.func.isRequired,
  }

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

  // BEWARE!!! EditCode.js is going to reach-in and call this!!!
  handleMessage(event) {

    // Message receivers like this can receive a lot of crap from malicious windows
    // debug tools etc, so we have to be careful to filter out what we actually care
    // about
    const source = event.source       // TODO: Decide if we really need event.source filtering
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
      mgbSetIframeReady: function() {
        this._isIframeReady = true
      }
    }

    // iframe can be closed, but still receive something
    // console.log(this.iFrameWindow, source === this.iFrameWindow.contentWindow , data.hasOwnProperty("mgbCmd") , commands[data.mgbCmd])
    //source === this.iFrameWindow.contentWindow
    if (this.iFrameWindow && data.hasOwnProperty("mgbCmd") && commands[data.mgbCmd])
      commands[data.mgbCmd].call(this, data)
  }

  // BEWARE!!! EditCode.js is going to reach-in and call this!!!
  // TODO: Replace this with a stateChangeDetect on isPlaying?
  stop() {
    if (this.refs.iFrame1) {
      this.refs.iFrame1.src = makeCDNLink('/codeEditSandbox.html')
      this._isIframeReady = false
    }
    // reset game screen size on stop
    if (this.wrapper) {
      this.wrapper.style.width = this.props.isPopup ? "auto" : '100%'
      this.wrapper.style.height = _wrapperHeightPx
      this.iFrameWindow.setAttribute("width", "100%")
      this.iFrameWindow.setAttribute("height", "100%")
    }
  }

  // BEWARE!!! EditCode.js is going to reach-in and call this!!!
  isIframeReady() {
    const lastVal = this._isIframeReady
    // reset ready status for next stop
    this._isIframeReady = false
    return lastVal
  }

  // BEWARE!!! EditCode.js is going to reach-in and call this!!!
  postMessage(messageObject) {
    if (messageObject.mgbCommand == "startRun")
      this.setState( { isHidden: false } )
    this.getReference()
    this.iFrameWindow.contentWindow.postMessage(messageObject, "*")
  }

  // click handlers for Buttons on this component when in the props.isPopup==true state
  handleMinimizeClick = () => { this.setState( { isMinimized: !this.state.isMinimized } ) }
  handleCloseClick = () => { 
    this.setState( { isHidden: true } )
    this.props.handleStop() 
  }

  // adjust iFrame size. This is initiated by an event
  adjustIframe(size) {
    this.iFrameWindow.setAttribute("width", size.width + "")
    this.iFrameWindow.setAttribute("height", size.height + "")
    const bounds = this.wrapper.getBoundingClientRect()    // TODO: Use or get rid of unused bounds variable
    const w = Math.min(window.innerWidth*0.5, size.width)
    const h = Math.min(window.innerHeight*0.5, size.height)
    if(this.props.isPopup) {
      this.wrapper.style.width = w + "px"
      this.wrapper.style.height = h + "px"
    }
    else
      this.wrapper.style.width = '100%'
    // height will break minimize
    // this.wrapper.style.height = size.height + "px"
    // this.wrapper.style.height = "initial"
  }

  // drag handlers for the 'Move' button on this component when in the props.isPopup==true state
  onDragStart = (e) => {
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

  onDrag = (e) => {
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

  // React render() for this component. 
  render() {
    const { isPopup, isPlaying } = this.props
    const { isHidden, isMinimized } = this.state

    return (
      <div
          ref="wrapper"
          id="gameWrapper"
          className={isPopup ? "popup" : "accordion"}
          style={{
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2)',
            display:   (isHidden && !isPlaying) ? "none" : "block",
            overflow:  isPopup ? 'initial' : "auto",
            width:     isPopup ? window.innerHeight * 0.3 : "100%",
            height:    _wrapperHeightPx,
            minWidth:  "200px",
            minHeight: "160px",
            maxHeight: (window.innerHeight * 0.5) + "px",
            maxWidth:  (window.innerWidth * 0.5) + 'px'
          }}>

        { /* Buttons for this Component when in the isPopup state */ }
        { isPopup &&
          <div style={_popopButtonsRowStyle}>
            <Button
                title='Close'
                icon='close'
                size='mini'
                floated='right'
                onClick={this.handleCloseClick} />

            <Button
                title={isMinimized ? "Maximize" : "Minimize"}
                icon={isMinimized ? "maximize" : "minus"}
                size='mini'
                floated='right'
                onClick={this.handleMinimizeClick} />

            <button
                // Making the a SUIR Button creates some funny drag icon, so clean this up another day
                title="Drag Window"
                className="ui mini right floated icon button"
                draggable={true}
                onDragStart={this.onDragStart}
                onDrag={this.onDrag}
                onTouchStart={this.onDragStart}
                onTouchMove={this.onDrag} >
              <Icon name='move' />
            </button>

          </div>
        }
        <iframe
            style={{
              display:    isMinimized ? "none" : "block",
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
