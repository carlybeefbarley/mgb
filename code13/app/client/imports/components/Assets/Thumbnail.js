import React from 'react'
import {makeCDNLink} from '/client/imports/helpers/assetFetchers'

export default class Thumbnail extends React.Component {
  static propTypes = {
    id: React.PropTypes.string.isRequired,
    className: React.PropTypes.string,
    style: React.PropTypes.object,
    expires: React.PropTypes.number // expire time seconds
  }

  render(){
    const expires = typeof this.props.expires === "undefined" ? 3600 : this.props.expires
    const now = Date.now()
    const nextUpdate = now - (now % (expires * 1000))
    return <img className={this.props.className} style={this.props.style} src={makeCDNLink(`/api/asset/cached-thumbnail/png/${expires}/${this.props.id}`, nextUpdate)}></img>
  }
}
