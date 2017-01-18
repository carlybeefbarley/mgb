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
    return <img className={this.props.className} style={this.props.style} src={Thumbnail.getLink(this.props.id, expires)}></img>
  }
}

Thumbnail.getLink = (assetId, expires) => {
  // we need server time here !!!!
  const now = Date.now()
  const nextUpdate = now - (now % (expires * 1000))
  return makeCDNLink(`/api/asset/cached-thumbnail/png/${expires}/${assetId}`, nextUpdate)
}
