import React from 'react'
import AssetCard from './AssetCard'
import { createContainer } from 'meteor/react-meteor-data'
import { Azzets } from '/imports/schemas'

const AssetCardLoading = props =>
  props.loading ? <div>Loading Asset Info...</div> : <AssetCard {...props} />

export default (AssetCardGET = createContainer(({ assetId }) => {
  const handle = Meteor.subscribe('assets.public.byId', assetId)

  return {
    asset: Azzets.findOne(assetId),
    loading: !handle.ready(),
  }
}, AssetCardLoading))
