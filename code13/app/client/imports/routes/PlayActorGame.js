import React, { PropTypes } from 'react'
import { Segment } from 'semantic-ui-react'
import Mage from '/client/imports/components/MapActorGameEngine/Mage'
import ThingNotFound from '/client/imports/components/Controls/ThingNotFound'

// TODO - I will soon change this to play using the Game asset instead of the startname

const _fetchAssetByUri = uri => {
  var promise = new Promise( function (resolve, reject) {
    var client = new XMLHttpRequest()
    client.open('GET', uri)
    client.send()
    client.onload = function () {
      if (this.status >= 200 && this.status < 300) 
        resolve(this.response)  // Performs the function "resolve" when this.status is equal to 2xx
      else
        reject(this.statusText) // Performs the function "reject" when this.status is different than 2xx
    }
    client.onerror = function () { reject(this.statusText) }
  })
  return promise
}


const PlayActorGame = ( { params, user } ) => 
{
  // const mapName = params.map || 'mechanix2.Classic Three Block Puzzle'
  const _mapName = params.gamename

  if (!_mapName || _mapName === '')
    return <ThingNotFound type='ActorGame' id='""' />

  const colonPlace = _mapName.search(':')
  const [ ownerName, mapName ] = colonPlace == -1 ? [ user.profile.name, _mapName ] : [ _mapName.slice(0, colonPlace) , _mapName.slice(colonPlace+1)]

  return (
    <Segment basic padded>
      <Mage 
          ownerName={ownerName}
          startMapName={mapName}
          isPaused={false}
          fetchAssetByUri={ uri => _fetchAssetByUri(uri) }
      />
    </Segment>
  )
}

PlayActorGame.propTypes = {
  params: PropTypes.object,             // params.id is the USER id  OR  params.username is the username; patrams.gamename is the game starting map NAME.. It may have a colon for username:mapname
  user: PropTypes.object                // This is the related user record. We list the projects for this user
}

export default PlayActorGame