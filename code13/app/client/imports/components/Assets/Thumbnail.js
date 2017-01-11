import React from 'react'
import {makeCDNLink} from '/client/imports/helpers/assetFetchers'

export default class Thumbnail extends React.Component {
  static propTypes = {
    id: React.PropTypes.string.isRequired,
    className: React.PropTypes.string,
    style: React.PropTypes.object
  }


  render(){
    const expires = this.props.expires || 3600
    return <img className={this.props.className} style={this.props.style} src={makeCDNLink(`/api/asset/cached-thumbnail/png/${this.props.id}/${expires}`)}></img>
  }
}
