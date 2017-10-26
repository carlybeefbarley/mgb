import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { Icon, Button } from 'semantic-ui-react'

import { makeCDNLink } from '/client/imports/helpers/assetFetchers'

import './editcode.css'

import SpecialGlobals from '/imports/SpecialGlobals'

const _wrapperHeightPx = '320px'
const _popopButtonsRowStyle = {
  transform: 'translateY(-100%)', // Move it to be *above* the top of the iFrame part of this Component
  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2)',
  position: 'absolute',
  right: '0',
  left: '0',
  backgroundColor: 'inherit',
}

export default class GameScreen extends React.Component {
  static propTypes = {
    isPlaying: PropTypes.bool,
    isPopup: PropTypes.bool,
    asset: PropTypes.object,
    currUser: PropTypes.object,

    handleStop: PropTypes.func.isRequired,
    handleContentChange: PropTypes.func.isRequired,
    consoleAdd: PropTypes.func.isRequired,
  }
  // keep only one popup per gamescreen instances
  static popup = null

  constructor(props) {
    super(props)

    this.state = {
      isMinimized: false,
      isHidden: true,
    }

    this.screenX = 0
    this.screenY = 0 // px from bottom
    this._isIframeReady = false
  }

  componentDidMount() {
    this.getReference()
  }
  componentWillUnmount() {
    GameScreen.popup && GameScreen.popup.close()
  }

  componentDidUpdate(prevProps, prevState) {
    this.getReference()
    if (!prevProps.isPlaying && this.props.isPlaying && this.state.isMinimized) this.handleMinimizeClick()

    if (!this.state.fullScreen && GameScreen.popup) GameScreen.popup.close()
  }

  componentWillReceiveProps(props) {
    this.requestAdjustIframe()
  }

  getReference() {
    // TODO - change to use the ref={ c => { codestuff } } pattern that is now recommended.
    //        This will also help with the TODO in EditCode:_handle_iFrameMessageReceiver
    this.iFrameWindow =
      this.state.fullScreen && GameScreen.popup ? { contentWindow: GameScreen.popup } : this.refs.iFrame1

    this.wrapper = this.refs.wrapper
  }

  // BEWARE!!! EditCode.js is going to reach-in and call this!!!
  handleMessage(event) {
    // Message receivers like this can receive a lot of crap from malicious windows
    // debug tools etc, so we have to be careful to filter out what we actually care
    // about
    const source = event.source // TODO: Decide if we really need event.source filtering
    const data = event.data

    const commands = {
      mgbConsoleMsg(data) {
        return this.props.consoleAdd(data)
      },
      // In a Phaser game, this is needed to enable screenshots if using WebGL renderer
      //   game.preserveDrawingBuffer = true;
      // OR use Phaser.CANVAS as the renderer
      mgbScreenshotCanvasResponse(data) {
        let asset = this.props.asset
        asset.thumbnail = data.pngDataUrl
        this.props.handleContentChange(null, asset.thumbnail, 'update thumbnail')
      },

      mgbAdjustIframe(data) {
        this.adjustIframe(data.size)
      },
      mgbSetIframeReady() {
        this._isIframeReady = true
      },
      mgbClosed() {
        // interval here because we cannot access popup directly when serving from CDN
        // and therefore we don't have almost any control over popup
        // unload on popup can be called in 2 separate occasions:
        // 1. when it's closed (we are observing this)
        // 2. when it gets reloaded (we are ignoring this - but event will fire anyway
        // so this loop will continue to run until popup window gets closed

        // cleanup just in a case if we were already listening for close
        window.clearInterval(this.onClosePopupObeserverInterval)
        const observePopup = () => {
          // popup can be closed earlier
          if (GameScreen.popup && GameScreen.popup.closed) {
            this.setState({ fullScreen: false }, () => (GameScreen.popup = null))
            window.clearInterval(this.onClosePopupObeserverInterval)
          }
        }
        this.onClosePopupObeserverInterval = window.setInterval(observePopup, 100)
      },
    }

    // iframe can be closed, but still receive something
    // console.log(this.iFrameWindow, source === this.iFrameWindow.contentWindow , data.hasOwnProperty("mgbCmd") , commands[data.mgbCmd])
    //source === this.iFrameWindow.contentWindow
    if (this.iFrameWindow && data.hasOwnProperty('mgbCmd') && commands[data.mgbCmd])
      commands[data.mgbCmd].call(this, data)
  }
  // see handle message mgbClosed why this interval is here
  onClosePopupObeserverInterval = 0

  // BEWARE!!! EditCode.js is going to reach-in and call this!!!
  isIframeReady() {
    const lastVal = this._isIframeReady
    // reset ready status for next stop
    this._isIframeReady = false
    return lastVal
  }

  // BEWARE!!! EditCode.js is going to reach-in and call this!!!
  postMessage(messageObject) {
    if (messageObject.mgbCommand === 'startRun') {
      this.setState({ isHidden: false })
      if (GameScreen.popup) {
        if (this.state.fullScreen) GameScreen.popup.focus()
        else GameScreen.popup.close()
      } else if (this.state.fullScreen) {
        // reopen popup as it got closed before (e.g. user clicked stop button)
        this.popup()
      }
    } else if (messageObject.mgbCommand === 'stop' && messageObject && messageObject.closePopup) {
      // messageObject.closePopup comes from user input on stop button
      // otherwise we are simply reloading game
      GameScreen.popup && GameScreen.popup.close()
    } else if (messageObject.mgbCommand === 'approveIsReady') {
      if ((!GameScreen.popup || GameScreen.popup.closed) && this.state.fullScreen) {
        // reopen popup as it got closed before (e.g. user clicked stop button)
        this.popup()
      }
    }
    this.getReference()
    this.iFrameWindow.contentWindow.postMessage(messageObject, '*')
  }

  // BEWARE!!! EditCode.js is going to reach-in and call this!!!
  popup() {
    if (!GameScreen.popup || GameScreen.popup.closed) {
      GameScreen.popup = window.open(
        makeCDNLink('/codeEditSandbox.html'),
        'edit-code-sandbox',
        'toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=800,height=640',
      )
    }

    GameScreen.popup.focus()
    this.setState({ fullScreen: true })
  }

  // click handlers for Buttons on this component when in the props.isPopup==true state
  handleMinimizeClick = () => {
    this.setState({ isMinimized: !this.state.isMinimized })
    this.requestAdjustIframe()
  }

  handleCloseClick = () => {
    // this.setState( { isHidden: true } )
    this.props.handleStop()
  }

  // this function will tell sandbox to send back message with iframe size
  requestAdjustIframe() {
    if (this.props.isPlaying) this.postMessage({ mgbCommand: 'requestSizeUpdate' })
  }

  // adjust iFrame size. This is initiated by an event
  adjustIframe(size) {
    if (this.state.isMinimized || this.state.fullScreen) {
      return
    }

    this.iFrameWindow.setAttribute('width', size.width + '')
    this.iFrameWindow.setAttribute('height', size.height + '')
    // const bounds = this.wrapper.getBoundingClientRect()
    const w = Math.min(window.innerWidth * SpecialGlobals.editCode.popup.maxWidth, size.width)
    const h = Math.min(window.innerHeight * SpecialGlobals.editCode.popup.maxHeight, size.height)
    if (this.props.isPopup && this.props.isPlaying) {
      this.wrapper.style.width = w + 'px'
      this.wrapper.style.height = h + 'px'
    } else this.wrapper.style.width = '100%'
    // height will break minimize
    // this.wrapper.style.height = size.height + "px"
    // this.wrapper.style.height = "initial"

    const dx = w - this.iFrameWindow.innerWidth
    const dy = h - this.iFrameWindow.innerHeight
    this.clientX += dx
    this.clientY += dy
    this.forceUpdate()
  }

  // drag handlers for the 'Move' button on this component when in the props.isPopup==true state
  onDragStart = e => {
    // empty image so you don't see canvas element drag. Need to see only what is dragged inside canvas
    // don't do this on mobile devices
    // e.preventDefault()
    if (e.dataTransfer) {
      let ghost = e.target.cloneNode(true)
      ghost.style.display = 'none'
      e.dataTransfer.setDragImage(ghost, 0, 0)
    }
    if (e.touches && e.touches[0]) e = e.touches[0]
    this.dragStartX = e.clientX
    this.dragStartY = e.clientY
  }

  onDrag = e => {
    e.preventDefault()
    if (e.touches && e.touches[0]) e = e.touches[0]

    if (e.clientX === 0 && e.clientY === 0) return // avoiding weird glitch when at the end of drag 0,0 coords returned

    this.screenX += this.dragStartX - e.clientX
    this.screenY += this.dragStartY - e.clientY
    this.dragStartX = e.clientX
    this.dragStartY = e.clientY
    this.forceUpdate()
    //this.wrapper.style.right = this.screenX + "px"
    //this.wrapper.style.bottom = this.screenY + "px"
  }

  render() {
    // we have opened popup - so we can hide everything else
    if (this.state.fullScreen || this.state.isMinimized) return null

    const { isPopup, isPlaying } = this.props
    const { isHidden, isMinimized } = this.state
    let urlData = this.props.currUser ? '&hocname=' + this.props.currUser.profile.name : ''

    const wrapStyle = {
      display: 'block',
      overflow: 'auto',
      width: '100%',
      height: _wrapperHeightPx,
      minWidth: '200px',
      minHeight: '160px',
      maxHeight: window.innerHeight * SpecialGlobals.editCode.popup.maxHeight + 'px',
      maxWidth: window.innerWidth * SpecialGlobals.editCode.popup.maxWidth + 'px',
      position: 'relative',
      right: this.screenX + 'px',
      bottom: this.screenY + 'px',
    }

    if (isHidden && !isPlaying) {
      wrapStyle.display = 'none'
    }
    if (isPopup && isPlaying) {
      wrapStyle.width = window.innerHeight * SpecialGlobals.editCode.popup.maxWidth
      wrapStyle.overflow = 'initial'
      wrapStyle.position = 'absolute' // or fixed
    }
    if (isMinimized) {
      wrapStyle.bottom = '0'
      wrapStyle.right = '0'
      wrapStyle.height = 0
      wrapStyle.minHeight = 0
    }

    return (
      <div
        ref="wrapper"
        id="gameWrapper"
        className={isPopup && isPlaying ? 'popup' : 'accordion'}
        style={wrapStyle}
      >
        {isPopup &&
        isPlaying && (
          <div style={_popopButtonsRowStyle}>
            <Button title="Close" icon="close" size="mini" floated="right" onClick={this.handleCloseClick} />

            <Button
              title={isMinimized ? 'Maximize' : 'Minimize'}
              icon={isMinimized ? 'maximize' : 'minus'}
              size="mini"
              floated="right"
              onClick={this.handleMinimizeClick}
            />

            <button
              // Making the a SUIR Button creates some funny drag icon, so clean this up another day
              title="Drag Window"
              className="ui mini right floated icon button"
              draggable
              onDragStart={this.onDragStart}
              onDrag={this.onDrag}
              onTouchStart={this.onDragStart}
              onTouchMove={this.onDrag}
            >
              <Icon name="move" />
            </button>
          </div>
        )}
        <div style={{ overflow: 'auto', position: 'absolute', width: '100%', height: '100%' }}>
          <iframe
            style={{
              display: this.state.isMinimized ? 'none' : 'block',
              minWidth: '100%',
              minHeight: '95%', // 100% creates scrollbars
            }}
            ref="iFrame1"
            sandbox="allow-modals allow-same-origin allow-scripts allow-popups allow-pointer-lock allow-forms"
            src={makeCDNLink('/codeEditSandbox.html') + urlData}
            frameBorder="0"
            id="mgbjr-EditCode-sandbox-iframe"
          />
        </div>
      </div>
    )
  }
}
