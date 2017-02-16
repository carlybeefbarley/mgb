/* simple redirect */
import React from 'react'
import { getAssetBySelector } from '/client/imports/helpers/assetFetchers'
import { utilReplaceTo } from '../QLink'

export default class extends React.Component{
  componentDidMount(){
    const {params} = this.props
    getAssetBySelector({
      dn_ownerName: params.user,
      name: params.name,
      kind: params.kind,
      isDeleted: false
    }, (asset) => {
      if(asset)
        utilReplaceTo(this.props.location.query, "/u/" + asset.dn_ownerName + "/asset/" + asset._id)
    })
  }

  render(){
    return null
  }
}
