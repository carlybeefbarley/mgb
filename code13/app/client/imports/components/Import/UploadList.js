import _ from 'lodash'
import React, { PropTypes, Component } from 'react'
import ReactDOM from 'react-dom'

// import { Segment, Grid, Header, List, Icon, Image, Button } from 'semantic-ui-react'

import UploadItem from  './UploadItem.js'
// import sty from  './import.css'

export default class UploadList extends React.Component {

  render (){
    return (
      <div className={this.props.isHidden ? "mgb-hidden" : ""}>
        <div className="row">
          <button className="ui button" onClick={()=>this.props.clearImport()}>
            Clear import
          </button>
        </div>
        {
          this.props.graphics.map((graphic) =>
            <UploadItem
              key={graphic.fileName}
              graphic={graphic}
            />
          )
        }
      </div>
    )
  }
}