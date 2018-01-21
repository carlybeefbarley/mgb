import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Dropdown, Icon } from 'semantic-ui-react'
import ReactDOM from 'react-dom'
import DragNDropHelper from '/client/imports/helpers/DragNDropHelper'
import '../editGraphic.css'

const _layerCanvasStyle = {
  maxWidth: '256px',
  maxHeight: '256px',
  overflow: 'auto',
}

export default class Layer extends React.Component {
  static propTypes = {
    idx: PropTypes.number.isRequired,
    layer: PropTypes.object.isRequired,
    layerCount: PropTypes.number.isRequired,
    frameNames: PropTypes.array.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    copyLayerID: PropTypes.number,
    isSelected: PropTypes.bool.isRequired,
    selectedFrame: PropTypes.number.isRequired,
    isCanvasLayersVisible: PropTypes.bool.isRequired,

    selectLayer: PropTypes.func.isRequired,
    moveLayerUp: PropTypes.func.isRequired,
    moveLayerDown: PropTypes.func.isRequired,
    copyLayer: PropTypes.func.isRequired,
    pasteLayer: PropTypes.func.isRequired,
    selectFrame: PropTypes.func.isRequired,
    deleteLayer: PropTypes.func.isRequired,
    handleSave: PropTypes.func.isRequired,

    handleDragStart: PropTypes.func.isRequired,
    handleDragEnd: PropTypes.func.isRequired,
  }

  state = {
    editName: false,
  }

  toggleVisibility = () => {
    this.props.layer.isHidden = !this.props.layer.isHidden
    this.props.handleSave('Layer visibility')
  }

  toggleLocking = () => {
    // TODO: This operation has very high UX latency. Figure out why.
    this.props.layer.isLocked = !this.props.layer.isLocked
    this.props.handleSave('Layer locking')
  }

  selectLayer = event => {
    const clickedDiv = event.target
    // don't invoke select if remove layer
    // INSANITY: this relies on the icon name class !!! watch out
    if (clickedDiv.className.search('trash') !== -1) return
    if (
      clickedDiv.firstChild &&
      clickedDiv.firstChild.className &&
      clickedDiv.firstChild.className.search('trash') !== -1
    )
      return

    this.props.selectLayer(this.props.idx)
  }

  selectFrame = frameID => {
    this.props.selectFrame(frameID)
  }

  editName = () => {
    ReactDOM.findDOMNode(this.refs.nameInput).value = ReactDOM.findDOMNode(this.refs.nameText).textContent
    ReactDOM.findDOMNode(this.refs.nameInput).select()
    ReactDOM.findDOMNode(this.refs.nameInput).focus()
    this.setState({ editName: true })
  }

  changeName = event => {
    event.preventDefault()
    this.setState({ editName: false })
    this.props.layer.name = ReactDOM.findDOMNode(this.refs.nameInput).value
    this.props.handleSave('Changed layer name')
  }

  moveLayerUp = () => {
    this.props.moveLayerUp(this.props.idx)
  }
  moveLayerDown = () => {
    this.props.moveLayerDown(this.props.idx)
  }
  copyLayer = () => {
    this.props.copyLayer(this.props.idx)
  }
  pasteLayer = () => {
    this.props.pasteLayer(this.props.idx)
  }
  deleteLayer = () => {
    this.props.deleteLayer(this.props.idx)
  }

  // Note: it's not possible to extend arrow methods - works same-ish as this.registerPreviewCanvas.bind(this)
  registerPreviewCanvas = element => {
    if (element && !element.hasRegisteredDragStart) {
      element.addEventListener('touchstart', DragNDropHelper.startSyntheticDrag)
      element.hasRegisteredDragStart = true
    }
  }

  render() {
    const {
      width,
      height,
      isSelected,
      selectedFrame,
      frameNames,
      layer,
      idx,
      layerCount,
      copyLayerID,
      isCanvasLayersVisible,
      handleDragStart,
      handleDragEnd,
    } = this.props

    return (
      <tr className={(isSelected ? 'active' : '') + ' layer' + idx} onClick={this.selectLayer} key={idx}>
        <td onClick={this.toggleVisibility} className={'hide' + idx}>
          <Icon name={layer.isHidden ? 'hide' : 'unhide'} />
        </td>
        <td onClick={this.toggleLocking}>
          <Icon name={layer.isLocked ? 'lock' : 'unlock'} />
        </td>
        <td onDoubleClick={this.editName} onSubmit={this.changeName}>
          <div ref="nameText" className={this.state.editName ? 'mgb-hidden' : 'visible'}>
            {layer.name}
          </div>
          <form className={'ui input ' + (this.state.editName ? 'visible' : 'mgb-hidden')}>
            <input ref="nameInput" type="text" />
          </form>
        </td>
        <td>
          <Dropdown className="upward" icon="setting">
            <Dropdown.Menu>
              <Dropdown.Header content={`Layer #${idx + 1}: "${layer.name}"`} />
              <Dropdown.Item
                content="Move Up"
                onClick={this.moveLayerUp}
                disabled={idx === 0}
                icon="arrow up"
              />
              <Dropdown.Item
                onClick={this.moveLayerDown}
                disabled={layerCount - 1 === idx}
                icon="arrow down"
                content="Move Down"
              />
              <Dropdown.Divider />
              <Dropdown.Item onClick={this.editName} icon="edit" content="Rename" />
              <Dropdown.Divider />
              <Dropdown.Item onClick={this.copyLayer} icon="copy" content="Copy" />
              <Dropdown.Item
                onClick={this.pasteLayer}
                disabled={copyLayerID === null}
                icon="paste"
                content="Paste"
              />
              <Dropdown.Divider />
              <Dropdown.Item onClick={this.deleteLayer} icon="trash" content="Delete" />
            </Dropdown.Menu>
          </Dropdown>
        </td>
        {_.map(frameNames, (frameName, frameID) => {
          const isActiveCell = isSelected && selectedFrame === frameID
          return (
            <td
              onClick={this.selectFrame.bind(this, frameID)}
              key={`${idx}_${frameID}`}
              title={
                isActiveCell ? (
                  `This is the current edit focus: Layer "${layer.name}" of Frame #${selectedFrame + 1}`
                ) : (
                  'click here to edit this frame/layer'
                )
              }
              className={isActiveCell ? 'selectable highlight' : 'selectable'}
              id={'mgb_edit_graphics_frame_cell_' + frameID}
            >
              {isActiveCell ? (
                <div style={{ textAlign: 'center' }}>
                  <Icon name="check" />
                </div>
              ) : null}
            </td>
          )
        })}
        <td className="layerCanvas">
          <div
            className={'ui image ' + (isCanvasLayersVisible ? '' : 'hidden')}
            title={`Preview for Layer "${layer.name}" of Frame #${selectedFrame + 1}`}
            /* onDragStart={this.handlePreviewDragStart.bind(this, idx)} */
            style={_layerCanvasStyle}
          >
            <canvas
              width={width}
              height={height}
              ref={this.registerPreviewCanvas}
              draggable="true"
              onDragStart={handleDragStart.bind(this, idx)}
              onDragEnd={handleDragEnd}
            />
          </div>
        </td>
        <td>
          <Icon
            onClick={this.deleteLayer}
            // INSANITY: this.selectLayer() relies on the icon name class !!! watch out
            name="trash"
          />
        </td>
      </tr>
    )
  }
}
