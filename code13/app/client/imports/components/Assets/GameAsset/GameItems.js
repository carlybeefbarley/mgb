import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'
import { Item, Button } from 'semantic-ui-react'

export const GameItem = ( { game } ) => (
	<Item>
    <Item.Image style={{ maxHeight: 90, maxWidth: 90 }} src={game.thumbnail} />
    <Item.Content>
      <Item.Header content={game.name} />
      <Item.Description content={(game.content2.playCount || 0) + ' Plays'} />
      <Item.Extra>
      { game.content2.gameType === 'codeGame' && game.content2.startCode && game.content2.startCode !== '' && 
        <QLink to={`/u/${game.dn_ownerName}/play/codeGame/${game.content2.startCode}`}><Button size='small' compact icon='play' content='Play' /></QLink>
      }
      { game.content2.gameType === 'actorGame' && game.content2.startActorMap && game.content2.startActorMap !== '' && 
        <QLink to={`/u/${game.dn_ownerName}/play/actorGame/${game.content2.startActorMap}`}><Button size='small' compact icon='play' content='Play' /></QLink>
      }
        <Button size='small' compact icon='edit' active={false} content='Edit' />
      </Item.Extra>
    </Item.Content>
  </Item>
)

const GameItems = ( { games } ) => (
  <Item.Group divided>
    { games.map( g => <GameItem game={g} key={g._id} /> ) }
  </Item.Group>
)

GameItems.propTypes = {
  games:    PropTypes.object      // an array of game assets
}

export default GameItems
