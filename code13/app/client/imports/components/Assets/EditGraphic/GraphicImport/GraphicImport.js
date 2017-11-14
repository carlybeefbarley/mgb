import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Button, Header, Icon, Message } from 'semantic-ui-react'
import { showToast } from '/client/imports/modules'
import ReactDOM from 'react-dom'
import GifParser from './GifParser.js'
import './graphicImport.css'
import SpecialGlobals from '/imports/SpecialGlobals'

const STATUS_EMPTY = 'empty'
const STATUS_DRAGGED_OVER = 'draggedOver'
const STATUS_UPLOADING = 'uploading' // TODO: Confirm with @shmicikus that this was not an intended state (it is never used)
const STATUS_UPLOADED = 'uploaded'

const MIN_FRAME_WIDTH = 1 // Note that there is work to on the input handler to make this a value other than 1
const MIN_FRAME_HEIGHT = 1 // Note that there is work to on the input handler to make this a value other than 1
const MAX_IMPORTED_FRAMES = 64

const SUGGESTED_FRAME_WIDTH = 64
const SUGGESTED_FRAME_HEIGHT = 64

export default class GraphicImport extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      status: STATUS_EMPTY, // STATUS_EMPTY or STATUS_DRAGGED_OVER or STATUS_UPLOADING or STATUS_UPLOADED
      tileWidth: SUGGESTED_FRAME_WIDTH,
      tileHeight: SUGGESTED_FRAME_HEIGHT,
      imgWidth: null,
      imgHeight: null,
      importName: '',
    }
  }

  componentDidMount() {
    this.canvas = ReactDOM.findDOMNode(this.refs.uploadCanvas)
    this.ctx = this.canvas.getContext('2d')
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.status === STATUS_UPLOADED && this.loadedImg) {
      this.drawImage()
      this.drawGrid()
    }
  }

  onDragOver(event) {
    event.stopPropagation()
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
    this.setState({ status: STATUS_DRAGGED_OVER })
  }

  onDragLeave(event) {
    this.setState({ status: STATUS_EMPTY })
  }

  onDrop(event) {
    event.stopPropagation()
    event.preventDefault()

    let self = this
    const files = event.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      const maxUpload = SpecialGlobals.assets.maxUploadSize
      const maxUploadMB = (maxUpload / 1024 / 1024).toFixed(1)
      // console.log(file, maxUpload)
      if (file.size > maxUpload) {
        showToast.error("You can't upload a file more than " + maxUploadMB + ' MB')
        this.setState({ status: STATUS_EMPTY })
        return
      }
      var reader = new FileReader()
      reader.onload = ev => {
        let theUrl = ev.target.result
        let tmpImg = new Image()
        tmpImg.onload = function(e) {
          // image is uploaded to browser
          self.setState({ status: STATUS_UPLOADED, importName: file.name })
          if (tmpImg.src.startsWith('data:image/gif;base64,')) self.gifLoaded(tmpImg)
          else self.spriteSheetLoaded(tmpImg) // TODO: Make sure we don't get confused by non-image stuff like .ogg etc
        }
        tmpImg.src = theUrl
      }
      reader.readAsDataURL(file)
    }
  }

  // Decode GIF. See https://en.wikipedia.org/wiki/GIF#File_format for details on the GIF file format
  gifLoaded(img) {
    let self = this
    let parser = new GifParser({ gif: img })
    parser.load(function() {
      let frames = parser.getFrames()
      let cols = Math.ceil(Math.sqrt(frames.length))
      let rows = Math.ceil(frames.length / cols)
      self.setState({ tileWidth: img.width, tileHeight: img.height })
      self.setState({ imgWidth: cols * img.width, imgHeight: rows * img.height })
      self.canvas.width = cols * img.width
      self.canvas.height = rows * img.height
      let importedSoFar = 0

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          let i = row * cols + col
          if (frames[i]) self.ctx.putImageData(frames[i].data, col * img.width, row * img.height)
        }
      }

      let newImage = new Image()
      newImage.onload = function(e) {
        self.loadedImg = newImage
        self.drawImage()
        self.drawGrid()
      }
      newImage.src = self.canvas.toDataURL('image/png')
    })
  }

  // Decode PNG/JPG etc as if it were a spritesheet
  spriteSheetLoaded(img) {
    this.loadedImg = img
    this.setState({ imgWidth: img.width, imgHeight: img.height })
    this.canvas.width = img.width
    this.canvas.height = img.height

    if (this.state.tileWidth > img.width) this.setState({ tileWidth: img.width })
    if (this.state.tileHeight > img.height) this.setState({ tileHeight: img.height })

    this.drawImage()
    this.drawGrid()
  }

  drawImage() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.drawImage(this.loadedImg, 0, 0)
  }

  // Draw the grid of how the tiles will be extracted from the spriteSheet
  drawGrid() {
    let self = this
    this.ctx.lineWidth = 1
    this.ctx.strokeStyle = '#000000'

    let cols = Math.ceil(this.canvas.width / this.state.tileWidth)
    for (let col = 0; col < cols; col++) {
      let x = (col + 1) * this.state.tileWidth - 0.5
      drawLine(x, -0.5, x, this.canvas.height + 0.5)
    }

    let rows = Math.ceil(this.canvas.height / this.state.tileHeight)
    for (let row = 0; row < rows; row++) {
      let y = (row + 1) * this.state.tileHeight - 0.5
      drawLine(-0.5, y, this.canvas.width + 0.5, y)
    }

    function drawLine(x1, y1, x2, y2) {
      self.ctx.beginPath()
      self.ctx.moveTo(x1, y1)
      self.ctx.lineTo(x2, y2)
      self.ctx.stroke()
    }
  }

  changeTileWidth(event) {
    const maxWidth = Math.min(this.state.imgWidth, this.props.maxTileWidth)
    const clampedWidth = _.clamp(parseInt(event.target.value), MIN_FRAME_WIDTH, maxWidth)
    this.setState({ tileWidth: clampedWidth })
  }

  changeTileHeight(event) {
    const maxHeight = Math.min(this.state.imgHeight, this.props.maxTileHeight)
    const clampedHeight = _.clamp(parseInt(event.target.value), MIN_FRAME_HEIGHT, maxHeight)
    this.setState({ tileHeight: clampedHeight })
  }

  calcNumFramesThisWouldImport() {
    const state = this.state
    if (!state.imgWidth || !state.imgWidth) return 0

    const cols = Math.floor(state.imgWidth / state.tileWidth)
    const rows = Math.floor(state.imgHeight / state.tileHeight)
    return cols * rows
  }

  setOneFrame = () => {
    this.setState({ tileWidth: this.state.imgWidth, tileHeight: this.state.imgHeight })
  }

  // Do the actual import
  performImport = () => {
    let tmpCanvas = document.createElement('canvas')
    tmpCanvas.width = this.canvas.width
    tmpCanvas.height = this.canvas.height
    let tmpCtx = tmpCanvas.getContext('2d')
    tmpCtx.drawImage(this.loadedImg, 0, 0)
    let thumbCanvas = null

    let imgDataArr = []

    const cols = Math.floor(this.canvas.width / this.state.tileWidth)
    const rows = Math.floor(this.canvas.height / this.state.tileHeight)
    let importedSoFar = 0

    for (let row = 0; row < rows && importedSoFar < MAX_IMPORTED_FRAMES; row++) {
      for (let col = 0; col < cols && importedSoFar < MAX_IMPORTED_FRAMES; col++) {
        let imgData = tmpCtx.getImageData(
          col * this.state.tileWidth,
          row * this.state.tileHeight,
          this.state.tileWidth,
          this.state.tileHeight,
        )
        let canvas = document.createElement('canvas')
        canvas.width = this.state.tileWidth
        canvas.height = this.state.tileHeight
        let ctx = canvas.getContext('2d')
        ctx.putImageData(imgData, 0, 0)
        imgDataArr.push(canvas.toDataURL('image/png'))
        if (row == 0 && col == 0) thumbCanvas = canvas
        importedSoFar++
      }
    }

    this.props.importTileset(this.state.tileWidth, this.state.tileHeight, imgDataArr, thumbCanvas) // TODO: Check that this sets W,H correctly
  }

  clearAll = () => {
    this.setState({
      status: STATUS_EMPTY,
      tileWidth: SUGGESTED_FRAME_WIDTH,
      tileHeight: SUGGESTED_FRAME_HEIGHT,
      imgWidth: null,
      imgHeight: null,
      importName: '',
    })
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.loadedImg = null
  }

  render() {
    const { status, tileWidth, tileHeight, imgHeight, imgWidth, importName } = this.state
    const { maxTileWidth, maxTileHeight } = this.props
    const divClass =
      'uploadForm ' +
      (status === STATUS_UPLOADED ? 'mgb-hidden ' : ' ') +
      (status === STATUS_DRAGGED_OVER ? 'draggedOver' : '')
    const framesYielded = this.calcNumFramesThisWouldImport()
    const tooManyFramesWarning =
      framesYielded <= MAX_IMPORTED_FRAMES
        ? null
        : `This exceeds the limit of ${MAX_IMPORTED_FRAMES} frames per import`

    const tooBigWarning =
      (tileWidth <= maxTileWidth) & (tileHeight <= maxTileHeight)
        ? null
        : `Tile size exceeds maximum allowed size of ${maxTileWidth}x${maxTileHeight} pixels`
    const buttonSty = { marginRight: '4px', marginBottom: '4px' } // So they wrap nicely on narrow screen

    const isInvalid = !!tooBigWarning || !!tooManyFramesWarning

    const framesWord = `frame${framesYielded > 1 ? 's' : ''}`
    return (
      <div className="content">
        <Header as="h2" content="Slice & import image" />

        {/*** upload form ***/}
        <div
          className={divClass}
          onDragOver={this.onDragOver.bind(this)}
          onDragLeave={this.onDragLeave.bind(this)}
          onDrop={this.onDrop.bind(this)}
        >
          <br />
          <br />
          <br />
          <br />
          <br />
          <h2>Drop image here!</h2>
          <p>You can drag files such as .PNG, .GIF, .JPG here so they may be split into animation frames</p>
          <br />
          <br />
          <br />
          <br />
          <br />
        </div>

        {/*** uploaded image ***/}
        <div className={status === STATUS_UPLOADED ? '' : 'mgb-hidden'}>
          <div className="row">
            <div className="ui small labeled input" style={buttonSty}>
              <div
                className="ui small label"
                title={`Choose the width of each frame to import. Maximum permitted width is ${maxTileWidth} pixels`}
              >
                Frame width
              </div>
              <input
                className="ui small input"
                type="number"
                min={MIN_FRAME_WIDTH}
                max={imgWidth}
                value={tileWidth}
                onChange={this.changeTileWidth.bind(this)}
              />
            </div>
            &nbsp;
            <div className="ui small labeled input" style={buttonSty}>
              <div
                className="ui small label"
                title={`Choose the height of each frame to import. Maximum permitted height is ${maxTileHeight} pixels`}
              >
                Frame height
              </div>
              <input
                className="ui small input"
                type="number"
                min={MIN_FRAME_HEIGHT}
                max={imgHeight}
                value={tileHeight}
                onChange={this.changeTileHeight.bind(this)}
              />
            </div>
            &emsp;
            <div
              onClick={this.setOneFrame}
              className="ui small labeled icon button"
              title={`Set to one frame (${tileWidth}px x ${tileHeight}px)`}
              style={buttonSty}
            >
              <Icon name="expand" />Size as one frame
            </div>
          </div>

          <Message
            info={!isInvalid}
            error={isInvalid}
            icon="info circle"
            list={_.compact([
              `Import image '${importName}' is ${imgWidth} pixels wide, ${imgHeight} pixels high`,
              tooBigWarning,
              `This import operation would create ${framesYielded} ${framesWord}`,
              tooManyFramesWarning,
            ])}
          />

          <Button.Group style={{ marginBottom: '8px' }}>
            <Button
              onClick={this.performImport}
              disabled={isInvalid}
              primary
              title={`Import ${framesYielded} (${tileWidth}px x ${tileHeight}px) ${framesWord}`}
              icon="save"
              content={`Import as ${framesYielded} ${framesWord}`}
              style={buttonSty}
            />
            <Button.Or />
            <Button
              onClick={this.clearAll}
              size="small"
              title="Cancel this import and choose a different image to import instead"
              style={buttonSty}
              content="Select a different image"
            />
          </Button.Group>

          <div style={{ overflow: 'auto', maxHeight: '600px' }}>
            <canvas ref="uploadCanvas" className="uploadCanvas" />
          </div>
        </div>
      </div>
    )
  }
}
