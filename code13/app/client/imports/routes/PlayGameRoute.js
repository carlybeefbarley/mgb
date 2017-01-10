import _ from 'lodash'
import React, { PropTypes } from 'react'
import reactMixin from 'react-mixin'

import Spinner from '/client/imports/components/Nav/Spinner'
import ThingNotFound from '/client/imports/components/Controls/ThingNotFound'
import Helmet from 'react-helmet'

import { Azzets } from '/imports/schemas'
import { ActivitySnapshots, Activity } from '/imports/schemas'

import { Segment, Message, Header } from 'semantic-ui-react'
import Mage from '/client/imports/components/MapActorGameEngine/Mage'
import { fetchAssetByUri } from '/client/imports/helpers/assetFetchers'
import QLink from '/client/imports/routes/QLink'
import SpecialGlobals from '/imports/SpecialGlobals'

import { getAssetWithContent2, makeCDNLink } from '/client/imports/helpers/assetFetchers'

const _incrementPlayCount = _.debounce(
  assetId => { Meteor.call('job.gamePlayStats.playGame', assetId) }, 
  SpecialGlobals.gamePlay.playCountDebounceMs, 
  { leading: true } 
)

const PlayCodeGame = ( { _codeName, owner, incrementPlayCountCb } ) => 
{
  if (!_codeName || _codeName === '')
    return <ThingNotFound type='CodeGame' id='""' />

  // TODO: Use this once we implement stop/start for Code Games
  //  incrementPlayCountCb()

  const colonPlace = _codeName.search(':')
  const [ ownerName, codeName ] = colonPlace == -1 ? [ owner.profile.name, _codeName ] : [ _codeName.slice(0, colonPlace) , _codeName.slice(colonPlace+1)]
  // is it safe to use cdn here?
  return (
    <iframe
      key={ 0 }
      id="iFrame1"
      style={{ minWidth:'800px', minHeight:'600px', borderStyle: 'none' }}
      sandbox='allow-modals allow-same-origin allow-scripts allow-popups allow-pointer-lock'
      src={makeCDNLink(`/api/asset/code/bundle/u/${ownerName}/${codeName}`)}>
    </iframe>
  )
}

//         src='/api/asset/code/bundle/AXhwYgg93roEsLCBJ'>

const PlayMageGame = ( { _mapName, owner, incrementPlayCountCb } ) => 
{
  if (!_mapName || _mapName === '')
    return <ThingNotFound type='ActorGame' id='""' />

  const colonPlace = _mapName.search(':')
  const [ ownerName, mapName ] = colonPlace == -1 ? [ owner.profile.name, _mapName ] : [ _mapName.slice(0, colonPlace) , _mapName.slice(colonPlace+1)]

  return (
    <Mage 
        ownerName={ownerName}
        startMapName={mapName}
        isPaused={false}
        playCountIncFn={incrementPlayCountCb}
        fetchAssetByUri={ uri => fetchAssetByUri(uri) }
    />
  )
}

const PlayGame = ( { game, user, incrementPlayCountCb } ) => {
  if (!game.metadata)
    return <Message warning content='This Game Asset does not contain a game definition. Someone should edit it and fix that' />

  switch (game.metadata.gameType) {
  case 'codeGame':
    if (!game.metadata.startCode || game.metadata.startCode === '')
      return <Message warning content='This Game Asset does not contain a link to the starting actorMap. Someone should edit it and fix that' />
    return <PlayCodeGame _codeName={game.metadata.startCode} owner={user} incrementPlayCountCb={incrementPlayCountCb}/>
  case 'actorGame':
    if (!game.metadata.startActorMap || game.metadata.startActorMap === '')
      return <Message warning content='This Game Asset does not contain a link to the starting Game Code file. Someone should edit it and fix that' />
    return <PlayMageGame _mapName={game.metadata.startActorMap} owner={user} incrementPlayCountCb={incrementPlayCountCb}/>
  default:
    return <Message warning content='This Game Asset does not contain a game type definition. Someone should edit it and fix that' />
  }
}


export default PlayGameRoute = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    params:           PropTypes.object,      // params.assetId is the ASSET id
    user:             PropTypes.object
  },

  getMeteorData: function() {
    let assetId = this.props.params.assetId
    let handleForAsset = getAssetWithContent2(assetId, () => {
      // while ticking - send changes :) (this is - isMounted check actually)
      this.isMounted && this.forceUpdate()
    })
    return {
      get asset(){ return handleForAsset.asset },
      get loading(){ return !handleForAsset.isReady }
    }
  },

  incrementPlayCount: function() {
    const game = this.data.asset      // One Asset provided via getMeteorData()
    if (game && game._id)
      _incrementPlayCount(game._id)
  },

  //
  checkForImplicitIncrementPlayCount() {
    const game = this.data.asset      // One Asset provided via getMeteorData()    
    if (game && game._id && game.metadata.gameType === 'codeGame'  && !this.autoUpdateHasBeenHandled)
    { 
      this.incrementPlayCount()
      this.autoUpdateHasBeenHandled = true
    }
  },

  componentDidMount: function () {
    this.isMounted = true
    this.checkForImplicitIncrementPlayCount()

  },

  componentWillUnmount: function () {
    this.isMounted = false
  },

  componentDidUpdate () {
    this.checkForImplicitIncrementPlayCount()
  },

  render: function() {
    if (this.data.loading) 
      return <Spinner />

    if (!this.data.asset)
      return <ThingNotFound type='Game Asset' id={params.assetId} />

    const { params, user } = this.props
    const game = this.data.asset      // One Asset provided via getMeteorData()

    return (
      <Segment basic padded>
        <QLink to={`/u/${game.dn_ownerName}/asset/${game._id}`}>
          <Header content={game.name} />
        </QLink>
        <small style={{ float: 'right'}} >{((game.metadata && game.metadata.playCount) || 0) + ' Plays'}</small>
        <PlayGame game={game} user={user} incrementPlayCountCb={this.incrementPlayCount}/>
      </Segment>
    )
  }
})
