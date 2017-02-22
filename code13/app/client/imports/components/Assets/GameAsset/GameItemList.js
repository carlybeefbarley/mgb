import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'
import { Item, Button } from 'semantic-ui-react'
import Thumbnail from '/client/imports/components/Assets/Thumbnail'


export const GameItem = ( { game } ) => (
	<Item>
    <Item.Image className='mgb-pixelated' style={{ height: 90, maxWidth: 90, overflow: 'hidden' }} src={Thumbnail.getLink(game)} />
    <Item.Content>
      <Item.Header content={game.name} />
      <Item.Description content={((game.metadata && game.metadata.playCount) || 0) + ' Plays'} />
      <Item.Extra>
      { game.metadata &&
        (
          (game.metadata.gameType === 'codeGame' && game.metadata.startCode && game.metadata.startCode !== '') ||
          (game.metadata.gameType === 'actorGame' && game.metadata.startActorMap && game.metadata.startActorMap !== '' )
        ) &&
        <QLink to={`/u/${game.dn_ownerName}/play/${game._id}`}><Button size='small' compact icon='play' content='Play' /></QLink>
      }
      <QLink to={`/u/${game.dn_ownerName}/asset/${game._id}`}>
        <Button size='small' compact icon='edit' active={false} content='Edit' />
      </QLink>
      </Item.Extra>
    </Item.Content>
  </Item>
)

const GameItemList = ( { games } ) => (
  <Item.Group divided>
    { (!games || games.length === 0) &&
      <p>No matching games</p>}
    { games.map( g => <GameItem game={g} key={g._id} /> ) }
  </Item.Group>
)

GameItemList.propTypes = {
  games:    PropTypes.array      // an array of game assets
}

export default GameItemList