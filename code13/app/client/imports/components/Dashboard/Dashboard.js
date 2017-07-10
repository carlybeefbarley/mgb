import React, { PropTypes } from 'react'
import { Azzets } from '/imports/schemas'
import { assetMakeSelector } from '/imports/schemas/assets'
import { createContainer } from 'meteor/react-meteor-data'
import DashboardUI from './DashboardUI'

const _assetKindsToGet = ['graphic']
const _numAssetsToGet = 6

/**
 * For currentUser, get most recent _numAssetsToGet assets of kind _assetKindsToGet
 * and then pass onto wrapped component (DashboardUI)
 */
const Dashboard = createContainer(({ currUser }) => {
  if (!currUser) return <span>Not Logged In...</span>

  const handleForAssets = Meteor.subscribe(
    'assets.public',
    currUser._id, // userId (null = all)
    _assetKindsToGet,
    null,
    false, // Project Name.
    false, // Show Only Deleted
    false, // Show only Stable
    undefined, // Use default sort order
    _numAssetsToGet, // Limit
  )

  const assetSorter = { updatedAt: -1 }
  const assetSelector = assetMakeSelector(currUser._id, _assetKindsToGet, '', null)
  return {
    assets: Azzets.find(assetSelector, { sort: assetSorter, limit: _numAssetsToGet }).fetch(),
    loading: !handleForAssets.ready(),
  }
}, DashboardUI)

export default Dashboard
