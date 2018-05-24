import PropTypes from 'prop-types'
import React from 'react'

// These MUST match the paths defined in RestApi.addRoute() calls
const _generateUrlOptions = asset => {
  let retval = []
  switch (asset.kind) {
    case 'graphic':
      retval.push({ msg: 'as PNG by ID', url: '/api/asset/png/' + asset._id })
      retval.push({ msg: 'as PNG by ID and frame', url: '/api/asset/png/' + asset._id + '?frame=0' })
      retval.push({ msg: 'as PNG by name', url: '/api/asset/png/' + asset.dn_ownerName + '/' + asset.name })
      retval.push({
        msg: 'as PNG by name and frame',
        url: '/api/asset/png/' + asset.dn_ownerName + '/' + asset.name + '?frame=0',
      })
      retval.push({ msg: 'as Tileset', url: '/api/asset/tileset/' + asset._id })
      retval.push({ msg: 'as Tileset-info', url: '/api/asset/tileset-info/' + asset._id })
      break
    case 'code':
      retval.push({ msg: 'as standalone .html bundle', url: '/api/asset/code/bundle/' + asset._id })
      retval.push({ msg: 'as raw source code (assetId)', url: '/api/asset/code/' + asset._id })
      if (!asset.isDeleted && asset.name && asset.name !== '')
        retval.push({
          msg: 'as raw source code (user:name)',
          url: '/api/asset/code/' + asset.dn_ownerName + ':' + asset.name,
        })
      break
    case 'tutorial':
      retval.push({ msg: 'as raw tutorial JSON (assetId)', url: '/api/asset/tutorial/' + asset._id })
      if (!asset.isDeleted && asset.name && asset.name !== '')
        retval.push({
          msg: 'as raw tutorial JSON (user:name)',
          url: '/api/asset/tutorial/' + asset.dn_ownerName + ':' + asset.name,
        })
      break
    case 'map':
      retval.push({ msg: 'as JSON map', url: '/api/asset/map/' + asset._id })
      retval.push({
        msg: 'as JSON map by name',
        url: '/api/asset/map/' + asset.dn_ownerName + '/' + asset.name,
      })
      break
    case 'sound':
      retval.push({ msg: 'as sound.mp3', url: '/api/asset/sound/' + asset._id + '/sound.mp3' })
      break
    case 'music':
      retval.push({ msg: 'as music.mp3', url: '/api/asset/music/' + asset._id + '/music.mp3' })
      break
    // guntis: not sure if it is a good idea to put user in assets. Please advice where should I do that?
    case 'user':
      retval.push({ msg: 'as user object', url: '/api/user/name/' + asset._id })
      break
    default:
      break
  }
  retval.push({ msg: 'as thumbnail PNG', url: '/api/asset/thumbnail/png/' + asset._id })

  return retval
}

const AssetUrlGenerator = props => {
  const { asset, showBordered } = props
  // Build the list of 'Create New Asset' Menu choices
  let urlOptions = _generateUrlOptions(asset)

  let choices = urlOptions.map(opt => (
    <a className="item" href={opt.url} target="_blank" data-value={opt.url} key={opt.msg}>
      URL to get asset {opt.msg}
    </a>
  ))

  return (
    <div className="ui simple dropdown item">
      <i className={`cloud ${showBordered ? 'bordered' : ''} download icon`} />
      <div className="menu">
        <div
          className="header item"
          title="These links can be used to load your assets into your games, or to load this asset as a standalone item"
        >
          Direct URLs
        </div>
        {choices}
      </div>
    </div>
  )
}

AssetUrlGenerator.propTypes = {
  asset: PropTypes.object,
  showBordered: PropTypes.bool,
}

export default AssetUrlGenerator
