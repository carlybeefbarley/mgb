import React, { PropTypes } from 'react'
import reactMixin from 'react-mixin'
import Spinner from '/client/imports/components/Nav/Spinner'
import QLink from '/client/imports/routes/QLink'
import { assetMakeSelector, assetSorters } from '/imports/schemas/assets'
import GameItems from '/client/imports/components/Assets/GameAsset/GameItems'

import { Azzets } from '/imports/schemas'
import { projectMakeFrontPageListSelector } from '/imports/schemas/projects'

import { getProjectAvatarUrl } from '/client/imports/helpers/assetFetchers'

export default GamesAvailableGet = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    scopeToUserId:       PropTypes.string,      // e.g. 987e78dsygwef. Can be undefined/null
    scopeToProjectName:  PropTypes.string       // e.g. foobar. Can be undefined/null. If specified, then scopeToUserId must also be specified
  },

  getMeteorData: function() {
    const { scopeToUserId, scopeToProjectName } = this.props

    const handleForAssets = Meteor.subscribe("assets.public",       // ALSO NEED CONTENT2
                              scopeToUserId, 
                              ['game'], 
                              null, 
                              scopeToProjectName, 
                              false,  // deleted 
                              false,  // stable & unstable
                              'edited')
    const assetSorter = assetSorters['edited']
    const assetSelector = assetMakeSelector(
                              scopeToUserId, 
                              ['game'], 
                              null, 
                              scopeToProjectName, 
                              false,  // deleted 
                              false)  // stable & unstable
    return {
      games:  Azzets.find(assetSelector, {sort: assetSorter}).fetch(),      // Note that the subscription we used excludes the content2 field which can get quite large
      loading: !handleForAssets.ready()
    }
  },

  render: function() {
    const { loading, games } = this.data  
    // In profile, vertically stackeded list view fits better than card view
    return loading ? <Spinner /> :  <GameItems games={games} wrap={false}/>
  }
})