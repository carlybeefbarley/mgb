import _ from 'lodash'
import React, { PropTypes, Component } from 'react'
import ReactDOM from 'react-dom'

// import { Segment, Grid, Header, List, Icon, Image, Button } from 'semantic-ui-react'

import sty from  './import.css'

export default class UploadForm extends React.Component {

  onDragOver(e){ this.props.onDragOver(e) }
  onDragLeave(e){ this.props.onDragLeave(e) }
  onDrop(e){ this.props.onDrop(e) }

  render (){
    return (
      <div className={"uploadForm " + (this.props.isDragOver ? "draggedOver" : "")}
        onDragOver={this.onDragOver.bind(this)}
        onDragLeave={this.onDragLeave.bind(this)}
        onDrop={this.onDrop.bind(this)}>
          <br/><br/><br/><br/><br/>
          <h2>Drop folder here!</h2>
          <p>You can drop folder with graphic assets like .jpg, .png</p>
          <br/><br/><br/><br/><br/>
      </div>
    )
  }
}