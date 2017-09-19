import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Card, Segment } from 'semantic-ui-react'
import { ReactMeteorData } from 'meteor/react-meteor-data'
import AssetCard from '/client/imports/components/Assets/AssetCard'
import Spinner from '/client/imports/components/Nav/Spinner'
import { assetMakeSelector, assetSorters } from '/imports/schemas/assets'

import { Azzets } from '/imports/schemas'

const _showLimit = 12
const _nowrapStyle = {
  clear: 'both',
  flexWrap: 'nowrap',
  overflowX: 'auto',
  overflowY: 'hidden',
}

const AssetItems = ({ assets }) => (
  <Card.Group style={_nowrapStyle}>
    {(!assets || assets.length === 0) && <Segment basic>No assets yet</Segment>}
    {_.map(assets, a => <AssetCard classNames="mgb-assetcard-width" asset={a} key={a._id} />)}
    {assets &&
    assets.length > 0 && (
      <div
        data-tooltip={`Only the ${_showLimit} most recently edited assets are shown here`}
        style={{ minWidth: '8em', textAlign: 'center', margin: 'auto' }}
      >
        . . .
      </div>
    )}
  </Card.Group>
)

AssetItems.propTypes = {
  assets: PropTypes.array, // an array of game assets
}

const AssetsAvailableGET = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    scopeToUserId: PropTypes.string, // e.g. 987e78dsygwef. Can be undefined/null
    scopeToProjectName: PropTypes.string, // e.g. foobar. Can be undefined/null. If specified, then scopeToUserId must also be specified
  },

  getMeteorData() {
    const { scopeToUserId, scopeToProjectName } = this.props

    const handleForAssets = Meteor.subscribe(
      'assets.public', // ALSO NEED CONTENT2
      scopeToUserId,
      null, // all kinds (could exclude game?)
      null, // all names
      scopeToProjectName,
      false, // not-deleted
      false, // stable & unstable
      'edited',
      _showLimit,
    )
    const assetSorter = assetSorters['edited']
    const assetSelector = assetMakeSelector(
      scopeToUserId,
      null, // all kinds (could exclude game?)
      null,
      scopeToProjectName,
      false, // deleted
      false,
    ) // stable & unstable
    return {
      assets: Azzets.find(assetSelector, { sort: assetSorter }).fetch(), // Note that the subscription we used excludes the content2 field which can get quite large
      loading: !handleForAssets.ready(),
    }
  },

  render() {
    const { loading, assets } = this.data
    // In profile, vertically stacked list view fits better than card view
    return loading ? <Spinner /> : <AssetItems assets={assets} wrap={false} />
  },
})

export default AssetsAvailableGET
