import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Card, Segment } from 'semantic-ui-react'
import { ReactMeteorData } from 'meteor/react-meteor-data'

import AssetCard from '/client/imports/components/Assets/AssetCard'
import Spinner from '/client/imports/components/Nav/Spinner'
import { Azzets } from '/imports/schemas'
import { assetMakeSelector, assetSorters } from '/imports/schemas/assets'

const _showLimit = 20
const _nowrapStyle = {
  clear: 'both',
  flexWrap: 'nowrap',
  overflowX: 'auto',
  overflowY: 'hidden',
}

const AssetsAvailableGET = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    scopeToUserId: PropTypes.string, // e.g. 987e78dsygwef. Can be undefined/null
    scopeToProjectName: PropTypes.string, // e.g. foobar. Can be undefined/null. If specified, then scopeToUserId must
    // also be specified
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
      // Note that the subscription we used excludes the content2 field which can get quite large
      assets: Azzets.find(assetSelector, { sort: assetSorter }).fetch(),
      loading: !handleForAssets.ready(),
    }
  },

  render() {
    const { loading, assets } = this.data
    const { scopeToProjectName } = this.props

    // In profile, vertically stacked list view fits better than card view
    if (loading) return <Spinner />

    return (
      <div>
        {_.isEmpty(assets) ? (
          <Segment tertiary style={{ padding: '6vh 0' }} textAlign="center">
            Create some assets to get started.
          </Segment>
        ) : (
          <Card.Group style={_nowrapStyle}>
            {_.map(assets, a => (
              <AssetCard
                classNames="mgb-assetcard-width"
                asset={a}
                key={a._id}
                project={scopeToProjectName}
              />
            ))}
          </Card.Group>
        )}

        {assets.length >= _showLimit && (
          <Segment secondary basic textAlign="center">
            Showing <strong>{_showLimit}</strong> recently edited assets.{' '}
          </Segment>
        )}
      </div>
    )
  },
})

export default AssetsAvailableGET
