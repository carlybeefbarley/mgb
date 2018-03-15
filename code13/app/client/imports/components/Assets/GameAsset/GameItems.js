import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import QLink from '/client/imports/routes/QLink'
import { Card, Segment } from 'semantic-ui-react'
import Thumbnail from '/client/imports/components/Assets/Thumbnail'
import FittedImage from '/client/imports/components/Controls/FittedImage'
import UserLikes from '/client/imports/components/Controls/UserLikes'
import { isValidCodeGame, isValidActorMapGame } from '/imports/schemas/assets'

const _cardStyle = { minWidth: '300px', maxWidth: '300px' }

export const GameItem = ({ game, currUser }) => (
  <Card color={isValidCodeGame(game) ? 'green' : 'blue'} className="link" style={_cardStyle}>
    <QLink className="image" to={`/u/${game.dn_ownerName}/play/${game._id}`}>
      {Thumbnail.getLink(game) ? (
        <FittedImage src={Thumbnail.getLink(game)} />
      ) : (
        <div style={{ display: 'block', height: '140px' }} />
      )}
    </QLink>
    <Card.Content extra>
      <p
        style={{
          color: 'black',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        {game.name}
      </p>
      <p>
        <span>{((game.metadata && game.metadata.playCount) || 0) + ' Plays'}</span>
        {/*<span style={{ float: 'right' }}>
          <UserLikes size="small" currUser={currUser} asset={game} seeLikers={false} />
      </span>*/}
      </p>
    </Card.Content>
  </Card>
)

const _wrapStyle = { clear: 'both', flexWrap: 'wrap' }
const _nowrapStyle = {
  clear: 'both',
  flexWrap: 'nowrap',
  overflowX: 'auto',
  overflowY: 'hidden',
}

const GameItems = ({ games, wrap, currUser }) => (
  <Card.Group style={wrap ? _wrapStyle : _nowrapStyle}>
    {(!games || games.length === 0) && <Segment basic>No matching games</Segment>}
    {games.map(
      g =>
        isValidCodeGame(g) || isValidActorMapGame(g) ? (
          <GameItem currUser={currUser} game={g} key={g._id} />
        ) : null,
    )}
  </Card.Group>
)

GameItems.propTypes = {
  currUser: PropTypes.object, // Currently Logged in user. Can be null
  games: PropTypes.array, // an array of game assets
  wrap: PropTypes.bool, // if false, then lay this out as a flexWrap:nowrap scrolling row
}

export default GameItems
