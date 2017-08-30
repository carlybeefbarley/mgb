import React, { PropTypes } from 'react'
import { List, Header, Image } from 'semantic-ui-react'

export default class FeaturedGames extends React.Component {
  static propTypes = {
    games: PropTypes.array,
    limit: PropTypes.number,
  }

  render() {
    if (_.isEmpty(this.props.games)) return null

    return (
      <div>
        <Header as="h3">Featured games</Header>
        <List>
          {this.props.games.map((game, i) => (
            <List.Item key={i}>
              <a href={'/u/' + game.dn_ownerName + '/play/' + game._id}>
                <div className="exploreItem">
                  <Image width={70} height={70} floated="left" src={game.thumbnail} />
                  {game.name}
                </div>
              </a>
            </List.Item>
          ))}
        </List>
      </div>
    )
  }
}
