import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import UploadForm from './UploadForm.js'
import UploadList from './UploadList.js'
import './import.css'

const STATUS_EMPTY = 'empty'
const STATUS_DRAGGED_OVER = 'draggedOver'
const STATUS_UPLOADED = 'uploaded'

export default class ImportGraphic extends Component {
  constructor(props) {
    super(props)

    this.state = {
      status: STATUS_EMPTY, // STATUS_EMPTY or STATUS_DRAGGED_OVER or STATUS_UPLOADING or STATUS_UPLOADED
      graphics: [],
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

  onDrop(event, assetType, prefix, project, assetLicense, isCompleted) {
    event.stopPropagation()
    event.preventDefault()

    this.project = project
    this.assetLicense = assetLicense
    this.isCompleted = isCompleted

    const items = event.dataTransfer.items
    for (let i = 0; i < items.length; i++) {
      // webkitGetAsEntry is where the magic happens
      const item = items[i].webkitGetAsEntry()
      if (item) {
        traverseFileTree(item)
      }
    }

    const self = this
    function traverseFileTree(item, path) {
      path = path || ''
      if (item.isFile) {
        item.file(function(file) {
          // console.log("File:", path + file.name)
          self.readFileUri(file, assetType, path, prefix)
        })
      } else if (item.isDirectory) {
        // Get folder contents
        const dirReader = item.createReader()
        dirReader.readEntries(function(entries) {
          for (let i = 0; i < entries.length; i++) {
            traverseFileTree(entries[i], path + item.name + '/')
          }
        })
      }
    }
  }

  readFileUri(file, assetType, path, prefix) {
    const fileName = (prefix + path + file.name).replace(/\//gi, '.')
    const reader = new FileReader()

    console.log(assetType)

    switch (assetType) {
      case 'graphic':
        reader.onload = e => {
          // console.log(e.target.result)
          const dataUri = e.target.result

          let tmpImg = new Image()
          tmpImg.onload = () => {
            // console.log(tmpImg.width, tmpImg.height)
            this.saveGraphic(tmpImg, fileName, assetType)
          }
          tmpImg.src = dataUri

          // this.setState({ status: STATUS_UPLOADED })
        }
        reader.readAsDataURL(file)
        break

      case 'code':
        reader.onload = e => {
          this.saveGraphic(e.target.result, fileName, assetType)
        }
        reader.readAsText(file)
        break
    }
  }

  saveGraphic(imgObject, fileName, assetType) {
    let content2 = {}
    let thumbnail = null
    switch (assetType) {
      case 'graphic':
        content2 = {
          dataUri: imgObject.src,
          width: imgObject.width,
          height: imgObject.height,
          layerParams: [{ name: 'Layer 1', isHidden: false, isLocked: false }],
          frameNames: ['Frame 1'],
          frameData: [[imgObject.src]],
          spriteData: [imgObject.src],
          tileset: imgObject.src,
          cols: 1,
          rows: 1,
          fps: 10,
          animations: [],
        }

        thumbnail = this.createThumbnail(imgObject)
        // console.log(thumbnail)
        break
      case 'code':
        content2.src = imgObject
        break
    }

    const projectName = this.project ? this.project.name : null
    const projectOwnerId = this.project ? this.project.ownerId : null
    const projectOwnerName = this.project ? this.project.ownerName : null

    this.props.createAsset(
      assetType,
      fileName,
      projectName,
      projectOwnerId,
      projectOwnerName,
      content2,
      thumbnail,
      this.assetLicense,
      this.isCompleted,
    )

    const graphics = _.cloneDeep(this.state.graphics)
    graphics.push({
      fileName,
      content2,
      thumbnail,
    })
    // TODO remake status so it shows also uploading status
    this.setState({ graphics, status: STATUS_UPLOADED })
  }

  createThumbnail(imgObject) {
    const tmpCanvas = document.createElement('canvas')
    const tmpCtx = tmpCanvas.getContext('2d')
    tmpCanvas.width = 290
    tmpCanvas.height = 150
    const wRatio = tmpCanvas.width / imgObject.width
    const hRatio = tmpCanvas.height / imgObject.height
    let ratio = wRatio < hRatio ? wRatio : hRatio
    if (wRatio >= 1 && hRatio >= 1) ratio = 1
    const width = imgObject.width * ratio
    const height = imgObject.height * ratio
    const x = (tmpCanvas.width - width) / 2
    const y = (tmpCanvas.height - height) / 2

    tmpCtx.drawImage(imgObject, x, y, width, height)
    return tmpCanvas.toDataURL('image/png')
  }

  clearImport() {
    this.setState({ graphics: [], status: STATUS_EMPTY })
  }

  render() {
    return (
      <div>
        <UploadForm
          isDragOver={this.state.status === STATUS_DRAGGED_OVER}
          isHidden={this.state.status === STATUS_UPLOADED}
          currUser={this.props.currUser}
          currUserProjects={this.props.currUserProjects}
          onDragOver={this.onDragOver.bind(this)}
          onDragLeave={this.onDragLeave.bind(this)}
          onDrop={this.onDrop.bind(this)}
        />
        <UploadList
          isHidden={this.state.status !== STATUS_UPLOADED}
          graphics={this.state.graphics}
          clearImport={this.clearImport.bind(this)}
        />
      </div>
    )
  }
}

ImportGraphic.propTypes = {
  currUser: PropTypes.object,
  currUserProjects: PropTypes.array,
  createAsset: PropTypes.func.isRequired,
}
