/* simple redirect */
import React from 'react'
import { getAssetBySelector } from '/client/imports/helpers/assetFetchers'
import { utilReplaceTo } from '../QLink'

export default class extends React.Component {
  componentDidMount() {
    const { params } = this.props
    const selector = {
      dn_ownerName: params.user,
      name: params.name,
      isDeleted: false,
    }
    if (params.kind) selector.kind = params.kind

    getAssetBySelector(selector, asset => {
      if (asset) utilReplaceTo(this.props.location.query, '/u/' + asset.dn_ownerName + '/asset/' + asset._id)
    })
  }

  render() {
    return null
  }
}
