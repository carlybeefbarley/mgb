import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Icon, Header } from 'semantic-ui-react'

export default class LiveGames extends React.Component {
  static propTypes = {
    games: PropTypes.array,
    limit: PropTypes.number,
  }

  render() {
    if (_.isEmpty(this.props.games)) return null

    const games = _.slice(this.props.games, 0, this.props.limit)
    return (
      <div style={{ overflow: 'hidden' }}>
        <Header as="h3">
          Games being made. <Icon name="circle" size="mini" color="red" />LIVE!
        </Header>
        {games.map(game => (
          <div
            key={game.thumbnail}
            className="ui image"
            style={{
              background: `url(${game.thumbnail}) center 10% / contain no-repeat`,
              backgroundSize: 'contain',
              width: '100px',
              height: '100px',
              float: 'left',
            }}
          />
        ))}
      </div>
    )
  }
}
