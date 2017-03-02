import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'
import { Card, Image } from 'semantic-ui-react'
import Thumbnail from '/client/imports/components/Assets/Thumbnail'


const FittedImage = ({ src, height = '180px', ...rest}) => (
  <img 
    className='mgb-pixelated'
    style={{
      background: `url(${src}) no-repeat center`,
      height: height,
      backgroundSize: 'contain'
    }} 
    {...rest}
    />
)
export const GameItem = ( { game } ) => (
	<Card className='link' style={{width: "200px"}}>
    <QLink 
        className='image'
        to={`/u/${game.dn_ownerName}/play/${game._id}`} 
        >
    {
      Thumbnail.getLink(game)
      ?
      <FittedImage src={Thumbnail.getLink(game)} />
      :
      <div style={{ display: 'block', height: '180px' }}/>
    }
    </QLink>
    <Card.Content extra>
      <p style={{color: 'black', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}>{game.name}</p>
      <p>{((game.metadata && game.metadata.playCount) || 0) + ' Plays'}</p>
    </Card.Content>
  </Card>
)

const GameItems = ( { games } ) => (
  <Card.Group  style={{clear: 'both', flexWrap: 'wrap'}}>
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

GameItems.propTypes = {
  games:    PropTypes.array      // an array of game assets
}

export default GameItems