import React from 'react'
import { makeCDNLink, makeExpireThumbnailLink } from '/client/imports/helpers/assetFetchers'
import { genetag } from '/imports/helpers/generators'


export default class Thumbnail extends React.Component {
  static propTypes = {
    id: React.PropTypes.string,
    asset: React.PropTypes.object, // if known - we can create proper hash based on etag - and invalidate right on time
    className: React.PropTypes.string,
    style: React.PropTypes.object,
    expires: React.PropTypes.number // expire time seconds
  }

  render() {
    const expires = typeof this.props.expires === "undefined" ? 3600 : this.props.expires
    const {asset, style, className, onDragStart, onDragEnd} = this.props
    const src = Thumbnail.getLink((asset || this.props.id), expires)

    return <img crossOrigin="anonymous" className={className} style={style} src={src} onDragStart={onDragStart} onDragEnd={onDragEnd}></img>
  }
}

Thumbnail.getLink = makeExpireThumbnailLink
