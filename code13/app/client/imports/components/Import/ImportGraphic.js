import _ from 'lodash'
import React, { PropTypes, Component } from 'react'
import ReactDOM from 'react-dom'

// import { Segment, Grid, Header, List, Icon, Image, Button } from 'semantic-ui-react'


const STATUS_EMPTY = "empty"
const STATUS_DRAGGED_OVER = "draggedOver"
const STATUS_UPLOADING = "uploading"        // TODO: Confirm with @shmicikus that this was not an intended state (it is never used)
const STATUS_UPLOADED = "uploaded"

export default class ImportGraphic extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      status: STATUS_EMPTY,     // STATUS_EMPTY or STATUS_DRAGGED_OVER or STATUS_UPLOADING or STATUS_UPLOADED 
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

    const items = event.dataTransfer.items
    for (let i=0; i<items.length; i++) {
      // webkitGetAsEntry is where the magic happens
      const item = items[i].webkitGetAsEntry()
      if (item) {
        traverseFileTree(item)
      }
    }

    const self = this
    function traverseFileTree(item, path) {
      path = path || ""
      if (item.isFile) {
        item.file(function(file) {
          // console.log("File:", path + file.name)
          self.readFileUri(file, path)
        })
      } else if (item.isDirectory) {
        // Get folder contents
        const dirReader = item.createReader()
        dirReader.readEntries(function(entries) {
          for (let i=0; i<entries.length; i++) {
            traverseFileTree(entries[i], path + item.name + "/")
          }
        })
      }
    }
  }

  readFileUri (file, path) {
    const reader = new FileReader()
    reader.onload = (e) => {
      // console.log(e.target.result)
      const dataUri = e.target.result
      if(!dataUri.startsWith('data:image/')){
        // file is not an image
        return;
      }
      const fileName = (path+file.name).replace('/', '.')
      let tmpImg = new Image()
      tmpImg.onload = () => {
        // console.log(tmpImg.width, tmpImg.height)
        this.saveGraphic(tmpImg, fileName)
      }
      tmpImg.src = dataUri
      // this.setState({ status: STATUS_UPLOADED })
    }
    reader.readAsDataURL(file)
  }

  saveGraphic(imgObject, fileName){
    const content2 = {
      dataUri: imgObject.src,
      width: imgObject.width,
      height: imgObject.height,
      layerParams: [{name:"Layer 1", isHidden: false, isLocked: false}],
      frameNames: ["Frame 1"],
      frameData: [ [ imgObject.src ] ],
      spriteData: [ imgObject.src ],
      tileset: imgObject.src,
      cols: 1,
      rows: 1,
      fps: 10,
      animations: []
    }

    this.props.createAsset(
      "graphic", 
      fileName, 
      null, // projectName
      null, // projectOwnerId
      null, // projectOwnerName
      content2,
    )

  }


  render(){
    return (
      
      <div className={"a"} style={{backgroundColor:"#ccc"}}
        onDragOver={this.onDragOver.bind(this)}
        onDragLeave={this.onDragLeave.bind(this)}
        onDrop={this.onDrop.bind(this)}>
          <br/><br/><br/><br/><br/>
          <h2>Drop folder here!</h2>
          <p>You can folder with graphic assets like .jpg, .png</p>
          <br/><br/><br/><br/><br/>
      </div>
    )
  }
}


ImportGraphic.propTypes = {
  createAsset: PropTypes.func.isRequired,
}