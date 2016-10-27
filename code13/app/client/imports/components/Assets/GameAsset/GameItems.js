import React, { PropTypes } from 'react'

import { Item, Button } from 'semantic-ui-react'

const GameItem = ( { game } ) => (
	<Item>
    <Item.Image style={{ maxHeight: 60, maxWidth: 60 }} src={game.thumbnail} />
    <Item.Content>
      <Item.Header content={game.name} />
      <Item.Description content={game.playCount + ' Plays'} />
      <Item.Extra>
        <Button icon='play' content='Play' />
        <Button icon='edit' content='Edit' />
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