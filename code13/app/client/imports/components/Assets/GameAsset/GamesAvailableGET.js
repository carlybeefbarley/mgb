import React, { PropTypes } from 'react'
import reactMixin from 'react-mixin'
import Spinner from '/client/imports/components/Nav/Spinner'
import QLink from '/client/imports/routes/QLink'
import { assetMakeSelector, assetSorters } from '/imports/schemas/assets'
import GameItems from './GameItems'

import { Azzets } from '/imports/schemas'
import { projectMakeFrontPageListSelector, getProjectAvatarUrl } from '/imports/schemas/projects'

export default ProjectsBeingMadeGET = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    scopeToUserId:       PropTypes.string,      // e.g. 987e78dsygwef. Can be undefined/null
    scopeToProjectName:  PropTypes.string       // e.g. foobar. Can be undefined/null. If specified, then scopeToUserId must also be specified
  },

  getMeteorData: function() {
    const { scopeToUserId, scopeToProjectName } = this.props

    const handleForAssets = Meteor.subscribe("assets.public", 
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

    const titleWrapperStyle = {
      width: '100%',
      position: 'relative',
      paddingLeft: '75px',
      left: '-60px',
    }
    const titleStyle = {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }

    if (loading) return <Spinner />

    return (
      <div className='ui items'>
      {
        !games.length ? "(none)" :
          games.map( (g,idx) => (
            <QLink key={idx} className="link item" style={{ whiteSpace: 'nowrap' }} to={`/u/${g.dn_ownerName}/asset/${g._id}`}>
              <img className="ui small middle aligned image" style={{ maxHeight: 60, maxWidth: 60 }} src={g.thumbnail} />
              <div className="content middle aligned" style={titleWrapperStyle}>
                <h3 className="ui header" style={titleStyle}>{g.name}</h3>
                <p><i className="play icon" />00,000 Plays</p>
              </div>
            </QLink>
          ))
      }
      </div>
    )
  }
})
