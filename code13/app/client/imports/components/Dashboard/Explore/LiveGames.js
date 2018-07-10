import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Icon, Header } from 'semantic-ui-react'

export default class LiveGames extends React.Component {
  static propTypes = {
    inverted: PropTypes.bool,
    games: PropTypes.array,
  }

  render() {
    const { games, inverted } = this.props

    if (_.isEmpty(games)) return null

    return (
      <div style={{ overflow: 'hidden' }}>
        <Header as="h3" inverted={inverted} color={!inverted ? 'grey' : null}>
          Game being made <Icon name="circle" size="mini" color="red" />LIVE!
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
