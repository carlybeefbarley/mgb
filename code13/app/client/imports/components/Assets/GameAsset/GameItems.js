import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'
import { Card, Image } from 'semantic-ui-react'
import Thumbnail from '/client/imports/components/Assets/Thumbnail'

export const GameItem = ( { game } ) => (
	<Card 
    style={{backgroundColor: 'white'}}
  >
  {console.log(this)}
    <QLink to={`/u/${game.dn_ownerName}/play/${game._id}`}>
    {
      Thumbnail.getLink(game)
      ?
      <Image centered 
        src={Thumbnail.getLink(game)}
        style={{ height: '155px', margin: '0px auto', imageRendering: 'pixelated', width: 'initial', overflow: 'hidden' }} 
      />
      :
      <div style={{ display: 'block', height: '155px' }}/>
    }
    </QLink>
    <Card.Content extra>
      <p style={{color: 'black', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}>{game.name}</p>
      <p>{((game.metadata && game.metadata.playCount) || 0) + ' Plays'}</p>
    </Card.Content>
  </Card>
)

const GameItems = ( { games } ) => (
  <Card.Group style={{clear: 'both'}}>
    { (!games || games.length === 0) &&
      <p>No matching games</p>}
    { games.map( g => { 
      if ( g.metadata && 
        (g.metadata.gameType === 'codeGame' && g.metadata.startCode && g.metadata.startCode !== '') ||
        (g.metadata.gameType === 'actorGame' && g.metadata.startActorMap && g.metadata.startActorMap !== '' )) 
        return <GameItem game={g} key={g._id} /> 
    })}
  </Card.Group>
)

const _resolveOwner = (implicitOwnerName, assetName) => {
  const parts = assetName.split(':')
  const isImplicit = (parts.length === 1 || parts[0].includes('/'))
  return {
    ownerName: isImplicit ? implicitOwnerName : parts[0],
    assetName: isImplicit ? assetName : assetName.slice(parts[0].length + 1)
  }
}

const _mkMapUri = (ownerName, assetName, gameType) => { 
  const p = _resolveOwner(ownerName, assetName)
  // make sure we have ALWAYS latest map
  return `/api/asset/${gameType}/${p.ownerName}/${p.assetName}?hash=${Date.now()}`
}

GameItems.propTypes = {
  games:    PropTypes.array      // an array of game assets
}

export default GameItems