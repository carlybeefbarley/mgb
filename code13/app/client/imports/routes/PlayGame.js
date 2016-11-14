import _ from 'lodash'
import React, { PropTypes } from 'react'
import reactMixin from 'react-mixin'

import Spinner from '/client/imports/components/Nav/Spinner'
import ThingNotFound from '/client/imports/components/Controls/ThingNotFound'
import Helmet from 'react-helmet'

import { Azzets } from '/imports/schemas'
import { ActivitySnapshots, Activity } from '/imports/schemas'

import { Segment, Message } from 'semantic-ui-react'
import Mage from '/client/imports/components/MapActorGameEngine/Mage'
import { fetchAssetByUri } from '/client/imports/helpers/assetFetchers'
import globals from '/client/imports/SpecialGlobals.js'


const _incrementPlayCount = _.debounce(
  assetId => { Meteor.call('job.gamePlayStats.playGame', assetId) }, 
  globals.gamePlay.playCountDebounceMs, 
  { leading: true } 
)

const PlayCodeGame = ( { gameId, _codeName, owner } ) => 
{
  if (!_codeName || _codeName === '')
    return <ThingNotFound type='CodeGame' id='""' />

  _incrementPlayCount(gameId)

  const colonPlace = _codeName.search(':')
  const [ ownerName, codeName ] = colonPlace == -1 ? [ owner.profile.name, _codeName ] : [ _codeName.slice(0, colonPlace) , _codeName.slice(colonPlace+1)]

  return (
    <Segment basic padded>
      <iframe
        key={ 0 }
        id="iFrame1"
        style={{minWidth:'800px',minHeight:'600px'}}
        sandbox='allow-modals allow-same-origin allow-scripts allow-popups'
        src={`/api/asset/code/bundle/u/${ownerName}/${codeName}`}>
      </iframe>
    </Segment>
  )
}

//         src='/api/asset/code/bundle/AXhwYgg93roEsLCBJ'>

const PlayMageGame = ( { gameId, _mapName, owner } ) => 
{
  if (!_mapName || _mapName === '')
    return <ThingNotFound type='ActorGame' id='""' />

  const colonPlace = _mapName.search(':')
  const [ ownerName, mapName ] = colonPlace == -1 ? [ owner.profile.name, _mapName ] : [ _mapName.slice(0, colonPlace) , _mapName.slice(colonPlace+1)]

  return (
    <Segment basic padded>
      <Mage 
          ownerName={ownerName}
          startMapName={mapName}
          isPaused={false}
          playCountIncFn={() => _incrementPlayCount(gameId)}
          fetchAssetByUri={ uri => fetchAssetByUri(uri) }
      />
    </Segment>
  )
}


export default PlayGame = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    params:           PropTypes.object,      // params.assetId is the ASSET id
    user:             PropTypes.object,
    currUser:         PropTypes.object,
    currUserProjects: PropTypes.array,       // Both Owned and memberOf. Check ownerName / ownerId fields to know which
    isSuperAdmin:     PropTypes.bool,       
    ownsProfile:      PropTypes.bool,        // true IFF user is valid and asset owner is currently logged in user
    showToast:        PropTypes.func         // For user feedback
  },

  getMeteorData: function() {
    let assetId = this.props.params.assetId
    let handleForAsset = Meteor.subscribe("assets.public.byId.withContent2", assetId)

    return {
      asset: Azzets.findOne(assetId),
      loading: !handleForAsset.ready()    // Be aware that 'activitySnapshots' and 'assetActivity' may still be loading
    }
  },

  render: function() {
    if (this.data.loading) 
      return <Spinner />

    if (!this.data.asset)
      return <ThingNotFound type='Game Asset' id={params.assetId} />

    const { params, user, currUser } = this.props
    const game = this.data.asset      // One Asset provided via getMeteorData()

    if (!game.metadata)
      return <Message warning content='This Game Asset does not contain a game definition. Someone should edit it and fix that' />

    switch (game.metadata.gameType) {
    case 'codeGame':
      if (!game.metadata.startCode || game.metadata.startCode === '')
        return <Message warning content='This Game Asset does not contain a link to the starting actorMap. Someone should edit it and fix that' />
      return <PlayCodeGame gameId={game._id} _codeName={game.metadata.startCode} owner={user} />
    case 'actorGame':
      if (!game.metadata.startActorMap || game.metadata.startActorMap === '')
        return <Message warning content='This Game Asset does not contain a link to the starting Game Code file. Someone should edit it and fix that' />
      return <PlayMageGame gameId={game._id} _mapName={game.metadata.startActorMap} owner={user} />
    default:
      return <Message warning content='This Game Asset does not contain a game type definition. Someone should edit it and fix that' />
    }
  }
})
