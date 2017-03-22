import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'
import { Card, Segment } from 'semantic-ui-react'
import Thumbnail from '/client/imports/components/Assets/Thumbnail'

const FittedImage = ({ src, height = '140px', ...rest}) => (
  // This is <div> instead of <img> so that it won't have the border that chrome puts on if src has no content
  <div 
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
	<Card className='link' style={{minWidth: '200px', maxWidth: '200px'}}>
    <QLink 
        className='image'
        to={`/u/${game.dn_ownerName}/play/${game._id}`} 
        >
    {
      Thumbnail.getLink(game)
      ?
      <FittedImage src={Thumbnail.getLink(game)} />
      :
      <div style={{ display: 'block', height: '140px' }}/>
    }
    </QLink>
    <Card.Content extra>
      <p style={{color: 'black', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}>{game.name}</p>
      <p>{((game.metadata && game.metadata.playCount) || 0) + ' Plays'}</p>
    </Card.Content>
  </Card>
)

const _wrapStyle = { clear: 'both', flexWrap: 'wrap' }
const _nowrapStyle = { clear: 'both', flexWrap: 'nowrap', overflowX: 'auto', overflowY: 'hidden'}

const GameItems = ( { games, wrap } ) => (
  <Card.Group  style={ wrap ? _wrapStyle : _nowrapStyle }>
    { (!games || games.length === 0) &&
      <Segment basic>No matching games</Segment>}
    { games.map( g => { 
      if ( g.metadata && 
        (g.metadata.gameType === 'codeGame' && g.metadata.startCode && g.metadata.startCode !== '') ||
        (g.metadata.gameType === 'actorGame' && g.metadata.startActorMap && g.metadata.startActorMap !== '' )) 
        return <GameItem game={g} key={g._id} /> 
    })}
  </Card.Group>
)

GameItems.propTypes = {
  games:    PropTypes.array,      // an array of game assets
  wrap:     PropTypes.bool        // if false, then lay this out as a flexWrap:nowrap scrolling row
}

export default GameItems