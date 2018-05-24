import PropTypes from 'prop-types'
import React from 'react'
import { ReactMeteorData } from 'meteor/react-meteor-data'
import { assetMakeSelector, assetSorters } from '/imports/schemas/assets'
import GameItems from '/client/imports/components/Assets/GameAsset/GameItems'

import { Azzets } from '/imports/schemas'

/**
 * Note that this Component will return null while loading, or if there are no games.
 * This allows the container to decide whether to show a header etc for it
 */
const GamesAvailableGet = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    header: PropTypes.node,
    currUser: PropTypes.object, // Currently Logged in user. Can be null
    scopeToUserId: PropTypes.string, // e.g. 987e78dsygwef. Can be undefined/null
    scopeToProjectName: PropTypes.string, // e.g. foobar. Can be undefined/null. If specified, then scopeToUserId must also be specified
  },

  getMeteorData() {
    const { scopeToUserId, scopeToProjectName } = this.props

    const handleForAssets = Meteor.subscribe(
      'assets.public', // ALSO NEED CONTENT2
      scopeToUserId,
      ['game'],
      null,
      scopeToProjectName,
      false, // deleted
      false, // stable & unstable
      'edited',
    )
    const assetSorter = assetSorters['edited']
    const assetSelector = assetMakeSelector(
      scopeToUserId,
      ['game'],
      null,
      scopeToProjectName,
      false, // deleted
      false,
    ) // stable & unstable
    return {
      games: Azzets.find(assetSelector, { sort: assetSorter }).fetch(), // Note that the subscription we used excludes the content2 field which can get quite large
      loading: !handleForAssets.ready(),
    }
  },

  render() {
    const { loading, games } = this.data
    const { currUser, header } = this.props
    return loading || games.length === 0 ? null : (
      <div>
        {header}
        <GameItems currUser={currUser} games={games} wrap={false} />
      </div>
    )
  },
})

export default GamesAvailableGet
