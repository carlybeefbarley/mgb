import _ from 'lodash'
import React, { PropTypes, Component } from 'react'
import ReactDOM from 'react-dom'

// import { Segment, Grid, Header, List, Icon, Image, Button } from 'semantic-ui-react'

// import sty from  './import.css'

export default class UploadItem extends React.Component {
  render() {
    const graphic = this.props.graphic
    return (
      <div>
        <img src={graphic.thumbnail} />
        {graphic.fileName}
      </div>
    )
  }
}