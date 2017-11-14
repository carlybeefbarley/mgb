import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import ReactDOM from 'react-dom'
import { showToast } from '/client/imports/modules'

import Layer from './Layer.js'

import DragNDropHelper from '/client/imports/helpers/DragNDropHelper'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'

import '../editGraphic.css'

// TODO - see if we can avoid forceUpdate() in addLayer() and addFrame()        [DG]
// TODO - see if we can avoid using props.EditGraphic                           [DG]

const emptyPixel = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
const _maxFrameDimension = 64

export default class SpriteLayers extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      allLayersHidden: false,
      allLayersLocked: false,
      isCanvasFramesVisible: true,
      isCanvasLayersVisible: false,
      isPlaying: false,
      copyFrameID: null,
      copyLayerID: null,
    }
  }

  componentWillUnmount() {
    // Stop any playAnimation() cycles. However, we CANNOT use this.setState() in this callback!
    this.cancelNextAnimationTimeout()
  }

  /************************** FRAMES ******************************/

  selectFrame(frameID) {
    this.props.handleSelectFrame(frameID)
  }

  // Append frame at end of frame list
  addFrame() {
    if (!this.hasPermission()) return

    let fN = this.props.content2.frameNames
    let newFrameName = 'Frame ' + (fN.length + 1).toString()
    fN.push(newFrameName)
    this.props.content2.frameData.push([])
    // small hack. we need to save actual spriteData frame count which depends from previewCanvases. And those are updated only after callback from server
    this.props.content2.doResaveTileset = true
    this.handleSave('Append frame to graphic')
    this.forceUpdate() // Force react to update.. needed since we need render() to create new canvasses
  }

  toggleCanvasFramesVisibility() {
    this.setState({ isCanvasFramesVisible: !this.state.isCanvasFramesVisible })
  }

  insertFrameAfter(frameID, doCopy) {
    if (!this.hasPermission()) return

    let c2 = this.props.content2
    c2.frameNames.splice(frameID + 1, 0, 'Frame ' + (frameID + 1))
    c2.frameData.splice(frameID + 1, 0, [])
    for (let i = 0; i < c2.layerParams.length; i++) {
      let tmp = doCopy ? c2.frameData[frameID][i] : emptyPixel
      c2.frameData[frameID + 1].push(tmp)
    }
    this.handleSave('Insert frame', true)
    this.forceUpdate() // Force react to update.. needed since we need render() to create new canvasses
    joyrideCompleteTag('mgbjr-CT-editGraphic-insertFrameAfter-invoke')
  }

  copyFrame(frameID) {
    if (!this.hasPermission()) return
    this.setState({ copyFrameID: frameID })
  }

  pasteFrame(frameID) {
    if (!this.hasPermission()) return

    let c2 = this.props.content2
    if (this.state.copyFrameID === null) return
    if (!c2.frameData[this.state.copyFrameID]) return

    // TODO? Is this copying references or values?
    c2.frameData[frameID] = c2.frameData[this.state.copyFrameID].slice(0)
    this.handleSave('Paste frame #' + this.state.copyFrameID + ' to #' + frameID, true)
  }

  frameMoveLeft(frameID) {
    if (!this.hasPermission()) return

    if (frameID <= 0) return

    let c2 = this.props.content2

    // TODO -- aren't frameNames a dead concept?  kill this code if so...
    let tmpName = c2.frameNames[frameID]
    c2.frameNames[frameID] = c2.frameNames[frameID - 1]
    c2.frameNames[frameID - 1] = tmpName

    let tmpData = c2.frameData[frameID]
    c2.frameData[frameID] = c2.frameData[frameID - 1]
    c2.frameData[frameID - 1] = tmpData

    this.props.forceDraw()
    this.handleSave(`Move frame ${frameID} left`, true)
  }

  frameMoveRight(frameID) {
    if (!this.hasPermission()) return

    let c2 = this.props.content2
    if (frameID >= c2.frameNames.length - 1) return

    // TODO -- aren't frameNames a dead concept?  kill this code if so...
    let tmpName = c2.frameNames[frameID]
    c2.frameNames[frameID] = c2.frameNames[frameID + 1]
    c2.frameNames[frameID + 1] = tmpName

    let tmpData = c2.frameData[frameID]
    c2.frameData[frameID] = c2.frameData[frameID + 1]
    c2.frameData[frameID + 1] = tmpData

    this.props.forceDraw()
    this.handleSave(`Move frame ${frameID} right`, true)
  }

  deleteFrame(frameID) {
    if (!this.hasPermission()) return

    let c2 = this.props.content2
    if (c2.frameData.length === 1) {
      showToast.error('You cannot delete the only frame')
      return
    }

    this.deleteAnimationFrame(frameID)

    // this.doSaveStateForUndo("Delete Frame");

    c2.frameNames.splice(frameID, 1)
    c2.frameData.splice(frameID, 1)
    if (this.props.selectedFrameIdx > c2.frameNames.length - 1)
      this.props.handleSelectFrame(c2.frameNames.length - 1)
    this.props.forceDraw()
    this.handleSave('Delete frame', true)
  }

  /************************** ANIMATIONS ******************************/

  deleteAnimationFrame(frameID) {
    const c2 = this.props.content2
    c2.animations.forEach((anim, idx) => {
      // remove frame from animation
      for (let i = 0; i < anim.frames.length; i++) {
        if (anim.frames[i] == frameID) {
          anim.frames.splice(i, 1)
        }
      }
      // all other frames are now -1
      for (let i = 0; i < anim.frames.length; i++) {
        if (anim.frames[i] > frameID) {
          anim.frames[i]--
        }
      }
      // if animation has no frames then remove it completely
      if (anim.frames.length == 0) {
        c2.animations.splice(idx, 1)
      }
    })

    // console.log(c2.animations)
  }

  cancelNextAnimationTimeout() {
    if (this._playAnimationTimeoutId) {
      clearTimeout(this._playAnimationTimeoutId)
      this._playAnimationTimeoutId = null
      this._playLoopRange = null
    }
  }

  togglePlayAnimation() {
    let isPlaying = !this.state.isPlaying
    this.setState({ isPlaying })

    if (isPlaying) this.playAnimation(this.props.selectedFrameIdx)
    else this.cancelNextAnimationTimeout()
  }

  togglePartialAnimation(frameID, endFrameID, animationName) {
    if (this.state.isPlaying && this._playLoopRange && animationName === this._playLoopRange.name) {
      this.cancelNextAnimationTimeout()
      this.setState({ isPlaying: false })
    } else {
      this.cancelNextAnimationTimeout()
      this.playAnimation(frameID, endFrameID, animationName)
      this.setState({ isPlaying: true })
    }
  }

  playAnimation(frameID, endFrameID, animationName) {
    this.selectFrame(frameID)
    //
    if (!this._playLoopRange)
      this._playLoopRange = {
        startIdx: endFrameID ? frameID - 1 : 0,
        endIdx: endFrameID ? endFrameID - 1 : this.props.content2.frameNames.length - 1,
        name: animationName,
      }

    let nextFrameID = frameID + 1
    if (nextFrameID > this._playLoopRange.endIdx) nextFrameID = this._playLoopRange.startIdx
    let self = this
    this._playAnimationTimeoutId = setTimeout(function() {
      if (self.state.isPlaying) self.playAnimation(nextFrameID)
    }, Math.round(1000 / this.props.content2.fps))
  }

  stepFrame(isForward) {
    let selectedID = this.props.selectedFrameIdx
    let frameID = isForward ? selectedID + 1 : selectedID - 1
    if (frameID >= 0 && frameID < this.props.content2.frameNames.length) this.selectFrame(frameID)
  }

  rewindFrames(isForward) {
    let frameID = isForward ? this.props.content2.frameNames.length - 1 : 0
    this.selectFrame(frameID)
  }

  changeFps(event) {
    if (!this.hasPermission()) return

    this.props.content2.fps = event.target.value
    this.handleSave('Changed FPS')
  }

  getAnimIdByFrame(frameID) {
    let c2 = this.props.content2
    let animID = false
    if (c2.animations) {
      for (let i = 0; i < c2.animations.length; i++) {
        let animation = c2.animations[i]
        if (frameID >= animation.frames[0] && frameID <= animation.frames[animation.frames.length - 1]) {
          animID = i
          break
        }
      }
    }
    return animID
  }

  addAnimation(frameID) {
    if (!this.hasPermission()) return

    let c2 = this.props.content2
    let animID = this.getAnimIdByFrame(frameID)

    if (animID === false) {
      c2.animations.push({
        name: 'Anim ' + c2.animations.length,
        frames: [frameID],
        fps: 10,
      })
    }
    this.handleSave('Add animation')
  }

  getAnimationsTH() {
    let colors = ['orange', 'green', 'blue', 'violet']
    let colorID = 0

    let c2 = this.props.content2
    let animTH = []
    for (let frameID = 0; frameID < c2.frameNames.length; frameID++) {
      let animID = this.getAnimIdByFrame(frameID)

      if (animID === false) {
        animTH.push({ name: '', colspan: 1, color: '' })
      } else {
        let animation = c2.animations[animID]
        animTH.push({
          animID,
          name: animation.name,
          fps: animation.fps,
          colspan: animation.frames.length,
          color: colors[colorID % colors.length],
          startFrame: animation.frames[0] + 1,
          endFrame: animation.frames[animation.frames.length - 1] + 1,
        })
        colorID++
        frameID += animation.frames.length - 1
      }
    }
    return animTH
  }

  changeAnimStart(animID, e) {
    if (!this.hasPermission()) return

    let c2 = this.props.content2
    let animation = c2.animations[animID]
    let endFrame = animation.frames[animation.frames.length - 1]
    let startFrame = e.target.value - 1 // value is -1, because user sees frames from 1 instead of 0
    if (endFrame < startFrame) return

    animation.frames = [] // clear frames and add then in for loop
    for (let i = endFrame; i >= startFrame && i >= 0; i--) {
      let tmpID = this.getAnimIdByFrame(i)
      if (tmpID === false || tmpID === animID) {
        // everything ok, this frame can be added to animation
        animation.frames.unshift(i)
      } else {
        // overlaps with next animation
        break
      }
    }
    this.handleSave('Changed animation start')
  }

  changeAnimEnd(animID, e) {
    if (!this.hasPermission()) return

    let c2 = this.props.content2
    let animation = c2.animations[animID]
    let startFrame = animation.frames[0]
    let endFrame = e.target.value - 1 // value is -1, because user sees frames from 1 instead of 0
    if (endFrame < startFrame) return

    animation.frames = [] // clear frames and add then in for loop
    for (let i = startFrame; i <= endFrame && i < c2.frameNames.length; i++) {
      let tmpID = this.getAnimIdByFrame(i)
      if (tmpID === false || tmpID === animID) {
        // everything ok, this frame can be added to animation
        animation.frames.push(i)
      } else {
        // overlaps with next animation
        break
      }
    }
    this.handleSave('Changed animation end')
  }

  changeAnimFPS(animID, e) {
    if (!this.hasPermission()) return

    let newFPS = e.target.value
    if (newFPS < 1 || newFPS > 60) return
    this.props.content2.animations[animID].fps = newFPS
    this.handleSave('Change animation FPS')
  }

  renameAnimation(animID, e) {
    if (!this.hasPermission()) return

    let newName = e.target.value
    if (newName === '') return
    this.props.content2.animations[animID].name = newName
    this.handleSave('Rename animation')
  }

  deleteAnimation(animID) {
    if (!this.hasPermission()) return

    this.props.content2.animations.splice(animID, 1)
    this.handleSave('Delete animation')
  }

  /************************** LAYERS ******************************/

  toggleAllVisibility() {
    let isVisible = !this.state.allLayersHidden
    this.setState({ allLayersHidden: isVisible })
    let layerParams = this.props.content2.layerParams
    for (let i = 0; i < layerParams.length; i++) layerParams[i].isHidden = isVisible
    this.handleSave('All layers visibility')
  }

  toggleAllLocking() {
    if (!this.hasPermission()) return
    let isLocked = !this.state.allLayersLocked
    this.setState({ allLayersLocked: isLocked })
    let layerParams = this.props.content2.layerParams
    for (let i = 0; i < layerParams.length; i++) layerParams[i].isLocked = isLocked
    this.handleSave('All layers locking')
  }

  toggleCanvasLayersVisibility() {
    this.setState({ isCanvasLayersVisible: !this.state.isCanvasLayersVisible })
  }

  selectLayer(layerID) {
    this.props.handleSelectLayer(layerID) // TODO: Cleaner to just have a prop.callback for this
  }

  addLayer() {
    if (!this.hasPermission()) return

    // TODO this.doSaveStateForUndo("Add Layer")
    let c2 = this.props.content2
    let newLayerName = 'Layer ' + (c2.layerParams.length + 1).toString()
    c2.layerParams.push({ name: newLayerName, isHidden: false, isLocked: false })
    let fD = c2.frameData
    let lN = this.props.content2.layerParams
    for (let i; i < fD.length; i++) {
      fD[i][lN.length - 1] = emptyPixel // BUGBUG? What is lN? let lN = this.props.content2.layerParams
    }

    this.props.forceUpdate() // Force react to update.. needed since some of this state was direct (not via React.state/React.props)
    this.handleSave('Add layer to graphic')
  }

  copyLayer(layerID) {
    if (!this.hasPermission()) return
    this.setState({ copyLayerID: layerID })
  }

  pasteLayer(layerID) {
    if (!this.hasPermission()) return
    if (this.state.copyLayerID === null) return

    let c2 = this.props.content2
    for (let i = 0; i < c2.frameNames.length; i++) {
      let frame = c2.frameData[i]
      frame[layerID] = frame[this.state.copyLayerID]
    }

    this.handleSave(`Paste layer #${this.state.copyLayerID} to #${layerID}`, true)
  }

  deleteLayer(layerID) {
    if (!this.hasPermission()) return

    let c2 = this.props.content2
    if (c2.layerParams.length === 1) {
      showToast.error('You cannot delete the only layer')
      return
    }

    // TODO this.doSaveStateForUndo("Delete Layer")

    c2.layerParams.splice(layerID, 1)
    // change selectedLayer if it is last and beeing removed
    if (this.props.selectedLayerIdx > c2.layerParams.length - 1)
      this.props.handleSelectLayer(c2.layerParams.length - 1)

    for (let frameID = 0; frameID < c2.frameNames.length; frameID++) c2.frameData[frameID].splice(layerID, 1)

    this.handleSave('Delete layer', true)
  }

  moveLayerUp(layerID) {
    if (!this.hasPermission()) return

    let c2 = this.props.content2

    let tmpParam = c2.layerParams[layerID]
    c2.layerParams[layerID] = c2.layerParams[layerID - 1]
    c2.layerParams[layerID - 1] = tmpParam

    for (let i = 0; i < c2.frameNames.length; i++) {
      let frame = c2.frameData[i]
      let tmpData = frame[layerID]
      frame[layerID] = frame[layerID - 1]
      frame[layerID - 1] = tmpData
    }
    this.handleSave('Layer moved up', true)
  }

  moveLayerDown(layerID) {
    if (!this.hasPermission()) return

    let c2 = this.props.content2

    let tmpParam = c2.layerParams[layerID]
    c2.layerParams[layerID] = c2.layerParams[layerID + 1]
    c2.layerParams[layerID + 1] = tmpParam

    for (let i = 0; i < c2.frameNames.length; i++) {
      let frame = c2.frameData[i]
      let tmpData = frame[layerID]
      frame[layerID] = frame[layerID + 1]
      frame[layerID + 1] = tmpData
    }
    this.handleSave('Layer moved down', true)
  }

  handleSave(changeText = 'change graphic', dontSaveFrameData) {
    this.props.handleSave(changeText, dontSaveFrameData)
  }

  hasPermission() {
    return this.props.hasPermission()
  }

  registerPreviewCanvas(idx, element) {
    if (element && !element.hasRegisteredDragStart) {
      element.addEventListener('touchstart', DragNDropHelper.startSyntheticDrag)
      element.hasRegisteredDragStart = true
    }
  }
  handleDragStart(frameId, e) {
    // allow to drop on graphics canvas
    try {
      e.dataTransfer.setData('mgb/image', this.props.getFrameData(frameId))
    } catch (e) {
      // IE will throw an error here.. just ignore
    }
    // IE needs this!!!
    // e.dataTransfer.effectAllowed = "copy"
    $(document.body).addClass('dragging')
  }
  handleDragStartForLayer(layerId, e) {
    // allow to drop on graphics canvas
    try {
      e.dataTransfer.setData('mgb/image', this.props.getLayerData(layerId))
    } catch (e) {
      // IE will throw an error here.. just ignore
    }
    // IE needs this!!!
    // e.dataTransfer.effectAllowed = "copy"
    $(document.body).addClass('dragging')
  }
  handleDragEnd = () => {
    $(document.body).removeClass('dragging')
  }

  renderLayers() {
    const c2 = this.props.content2
    return c2.layerParams.map((layer, idx) => (
      <Layer
        key={idx}
        idx={idx}
        layer={layer}
        layerCount={c2.layerParams.length}
        frameNames={c2.frameNames}
        selectedFrame={this.props.selectedFrameIdx}
        isSelected={this.props.selectedLayerIdx === idx}
        width={c2.width}
        height={c2.height}
        isCanvasLayersVisible={this.state.isCanvasLayersVisible}
        copyLayerID={this.state.copyLayerID}
        selectLayer={this.selectLayer.bind(this)}
        moveLayerUp={this.moveLayerUp.bind(this)}
        moveLayerDown={this.moveLayerDown.bind(this)}
        copyLayer={this.copyLayer.bind(this)}
        pasteLayer={this.pasteLayer.bind(this)}
        selectFrame={this.selectFrame.bind(this)}
        deleteLayer={this.deleteLayer.bind(this)}
        handleSave={this.handleSave.bind(this)}
        handleDragStart={this.handleDragStartForLayer.bind(this)}
        handleDragEnd={this.handleDragEnd}
      />
    ))
  }

  render() {
    const c2 = this.props.content2
    const buttonDivClass = 'ui mini icon button'

    let frameWidth = c2.width
    let frameHeight = c2.height

    if (frameWidth > _maxFrameDimension || frameHeight > _maxFrameDimension) {
      const maxDimension = frameWidth > frameHeight ? frameWidth : frameHeight
      const scale = _maxFrameDimension / maxDimension
      frameWidth *= scale
      frameHeight *= scale
    }

    return (
      <div
        id="framesView"
        className={this.props.isMinimized ? 'mgb-minimized' : 'mgb-maximized'}
        style={{ width: this.props.availableWidth + 'px' }}
      >
        <div className="animHeader row">
          <div onClick={this.rewindFrames.bind(this, false)} className={buttonDivClass}>
            <i className="icon step backward" />
          </div>
          <div onClick={this.stepFrame.bind(this, false)} className={buttonDivClass}>
            <i className="icon backward" />
          </div>
          <div
            id="mgbjr-editGraphic-playButton"
            onClick={this.togglePlayAnimation.bind(this)}
            className={buttonDivClass + (this.state.isPlaying ? ' black' : '')}
          >
            <i className={'icon ' + (this.state.isPlaying ? 'pause' : 'play')} />
          </div>
          <div onClick={this.stepFrame.bind(this, true)} className={buttonDivClass}>
            <i className="icon forward" />
          </div>
          <div onClick={this.rewindFrames.bind(this, true)} className={buttonDivClass}>
            <i className="icon step forward" />
          </div>
          <div className="ui mini labeled input">
            <div className="ui mini label" title="Animation Frames Per Second">
              FPS
            </div>
            <input
              className="ui small input"
              type="number"
              style={{ width: '6em' }}
              min="1"
              max="60"
              value={this.props.content2.fps}
              onChange={this.changeFps.bind(this)}
            />
          </div>
          <div
            className={
              'ui ' + (this.state.isCanvasFramesVisible ? 'primary' : '') + ' right floated mini button'
            }
            onClick={this.toggleCanvasFramesVisibility.bind(this)}
          >
            <i className={'icon ' + (this.state.isCanvasFramesVisible ? 'unhide' : 'hide')} /> Frames
          </div>
          <div
            id="mgb_edit_graphic_toggleLayerVisibility"
            className={
              'ui ' + (this.state.isCanvasLayersVisible ? 'primary' : '') + ' right floated mini button'
            }
            onClick={this.toggleCanvasLayersVisibility.bind(this)}
          >
            <i className={'icon ' + (this.state.isCanvasLayersVisible ? 'unhide' : 'hide')} /> Layers
          </div>
        </div>

        <table className="ui celled small padded table spriteLayersTable">
          <thead id="mgbjr-editGraphic-frames">
            {/** Animation tabs **/}

            <tr className={'animTR ' + (!c2.animations || c2.animations.length === 0 ? 'mgb-hidden' : '')}>
              <th />
              <th />
              <th />
              <th />
              {_.map(this.getAnimationsTH(), (item, idx) => {
                return (
                  <th key={'thAnim_' + idx} colSpan={item.colspan} className="animTH">
                    <div className={'ui ' + (item.color ? 'simple tiny dropdown label ' + item.color : '')}>
                      <span
                        onClick={() => {
                          this.togglePartialAnimation(item.startFrame, item.endFrame, item.name)
                        }}
                      >
                        {item.name}
                      </span>
                      {item.name ? (
                        <div className="ui menu">
                          <div className="item">
                            <div className="ui input">
                              <span className="text">Animation Name:&ensp;</span>
                              <input
                                type="text"
                                value={item.name}
                                onChange={this.renameAnimation.bind(this, item.animID)}
                              />
                            </div>
                          </div>

                          <div className="item">
                            <div className="ui input">
                              <span className="text">From:&ensp;</span>
                              <input
                                onChange={this.changeAnimStart.bind(this, item.animID)}
                                type="number"
                                value={item.startFrame}
                                min="1"
                                max={c2.frameNames.length}
                              />
                              <span className="text">&nbsp;To:&nbsp;</span>
                              <input
                                onChange={this.changeAnimEnd.bind(this, item.animID)}
                                type="number"
                                value={item.endFrame}
                                min="1"
                                max={c2.frameNames.length}
                              />
                            </div>
                          </div>

                          <div className="item">
                            <div className="ui input">
                              <span className="text">FPS:&ensp;</span>
                              <input
                                type="number"
                                value={item.fps}
                                min="1"
                                max="60"
                                onChange={this.changeAnimFPS.bind(this, item.animID)}
                              />
                            </div>
                          </div>

                          <div className="divide" />

                          <div
                            className="item"
                            onClick={this.deleteAnimation.bind(this, item.animID)}
                            title="Deletes the Animation data, but not the frames."
                          >
                            <i className="remove icon" />Delete Animation
                          </div>
                        </div>
                      ) : (
                        ''
                      )}
                    </div>
                  </th>
                )
              })}
              <th />
              <th />
            </tr>
            {/* animations end */}

            <tr className="framesHeader">
              <th width="32px">
                <i
                  className={'icon ' + (this.state.allLayersHidden ? 'hide' : 'unhide')}
                  onClick={this.toggleAllVisibility.bind(this)}
                />
              </th>
              <th width="32px">
                <i
                  className={'icon ' + (this.state.allLayersLocked ? 'lock' : 'unlock')}
                  onClick={this.toggleAllLocking.bind(this)}
                />
              </th>
              <th width="180px">
                <a
                  id="mgb_edit_graphics_add_layer"
                  className="ui small label"
                  onClick={this.addLayer.bind(this)}
                >
                  <i className="add circle icon" /> Add Layer
                </a>
              </th>
              <th width="32px" />
              {/* Tools drop down */
              _.map(c2.frameNames, (frameName, idx) => {
                return (
                  <th key={'th_' + idx} width="32px" className={'frameTH ' + 'frame' + idx}>
                    <div
                      className="ui dropdown"
                      ref={c => {
                        c && $(ReactDOM.findDOMNode(c)).dropdown({ on: 'hover', direction: 'upward' })
                      }}
                      id={'mgb_edit_graphics_frame_options_' + idx}
                    >
                      <span className="ui circular label">{idx + 1}</span>
                      <div className="ui vertical menu">
                        <div className="header item">Frame #{idx + 1}</div>
                        <div onClick={this.insertFrameAfter.bind(this, idx, true)} className="item">
                          <i className="add circle icon" />
                          Duplicate Frame
                        </div>
                        <div onClick={this.insertFrameAfter.bind(this, idx, false)} className="item">
                          <i className="circle icon outline" />
                          New Empty Frame
                        </div>
                        <div onClick={this.addAnimation.bind(this, idx)} className="item">
                          <i className="wait icon" />
                          Add animation
                        </div>

                        <div className="divider" />

                        <div onClick={this.copyFrame.bind(this, idx)} className="item">
                          <i className="copy icon" />
                          Copy
                        </div>
                        <div
                          onClick={this.pasteFrame.bind(this, idx)}
                          className={'item ' + (this.state.copyFrameID === null ? 'disabled' : '')}
                        >
                          <i className="paste icon" />
                          Paste
                        </div>

                        <div className="divider" />

                        <div
                          onClick={this.frameMoveLeft.bind(this, idx)}
                          className={'item ' + (idx === 0 ? 'disabled' : '')}
                        >
                          <i className="arrow left icon" />
                          Move Left
                        </div>
                        <div
                          onClick={this.frameMoveRight.bind(this, idx)}
                          className={
                            'item ' + (idx === this.props.content2.frameNames.length - 1 ? 'disabled' : '')
                          }
                        >
                          <i className="arrow right icon" />
                          Move Right
                        </div>

                        <div className="divider" />

                        <div
                          className={'item ' + (this.props.content2.frameData.length === 1 ? 'disabled' : '')}
                          onClick={this.deleteFrame.bind(this, idx)}
                        >
                          <i className="remove icon" />
                          Delete
                        </div>
                      </div>
                    </div>
                  </th>
                )
              })}
              <th>
                <div className="row">
                  <a
                    className="ui small label"
                    id="mgb_edit_graphics_add_frame"
                    onClick={this.addFrame.bind(this)}
                  >
                    <i className="add circle icon" /> Add Frame
                  </a>
                </div>
              </th>
              <th width="32px" />
            </tr>

            {/** Previews for frames **/}
            <tr className={'frameCanvases ' + (this.state.isCanvasFramesVisible ? '' : 'mgb-hidden')}>
              <th className="minimizeHide" />
              <th className="minimizeHide" />
              <th className="minimizeHide" />
              <th className="minimizeSmall">
                <div
                  onClick={this.togglePlayAnimation.bind(this)}
                  className={'miniPlay ' + buttonDivClass + (this.state.isPlaying ? ' black' : '')}
                  style={{ margin: '5px' }}
                >
                  <i className={'icon ' + (this.state.isPlaying ? 'pause' : 'play')} />
                </div>
              </th>
              {// TODO: change from frameNames[] to frameData[] ?
              _.map(c2.frameNames, (frameName, idx) => {
                return (
                  <th
                    key={'thCanvas_' + idx}
                    width="32px"
                    className={idx == this.props.selectedFrameIdx ? 'active' : ''}
                  >
                    <div
                      className="ui image "
                      // replace onClick wit mouseUp / touchEnd - to prevent conflict with mobile drag
                      onMouseUp={this.selectFrame.bind(this, idx)}
                      onTouchEnd={this.selectFrame.bind(this, idx)}
                      style={{
                        maxWidth: '256px',
                        maxHeight: '256px',
                        width: `${frameWidth}px`,
                        display: 'block',
                        margin: '0px auto',
                        overflow: 'auto',
                      }}
                      title={`Preview for combined visible layers of Frame #${idx + 1}`}
                    >
                      <canvas
                        width={c2.width}
                        height={c2.height}
                        style={{ width: frameWidth, height: frameHeight }}
                        onDragStart={this.handleDragStart.bind(this, idx)}
                        onDragEnd={this.handleDragEnd}
                        ref={this.registerPreviewCanvas.bind(this, idx)}
                        draggable="true"
                      />
                    </div>
                  </th>
                )
              })}
              <th>
                <div className={'row miniAddFrames'} style={{ marginLeft: '10px' }}>
                  <a className="ui small label" onClick={this.addFrame.bind(this)}>
                    <i className="add circle icon" /> Add Frame
                  </a>
                </div>
              </th>
              <th className="minimizeHide" />
            </tr>
          </thead>

          <tbody className="layers">{this.renderLayers()}</tbody>
        </table>
      </div>
    )
  }
}

SpriteLayers.propTypes = {
  content2: PropTypes.object.isRequired,
  hasPermission: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
  selectedFrameIdx: PropTypes.number.isRequired,
  selectedLayerIdx: PropTypes.number.isRequired,
  forceDraw: PropTypes.func,
  forceUpdate: PropTypes.func,
  getFrameData: PropTypes.func.isRequired, // used for drag and dopd frame on the main canvas
  getLayerData: PropTypes.func.isRequired, // used for drag and drop layer on the main canvas
  handleSelectLayer: PropTypes.func.isRequired,
  handleSelectFrame: PropTypes.func.isRequired,
}
