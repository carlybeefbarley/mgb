import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Header } from 'semantic-ui-react'

import GameItems from '/client/imports/components/Assets/GameAsset/GameItems'

export default class FeaturedGames extends React.Component {
  static propTypes = {
    inverted: PropTypes.bool,
    games: PropTypes.array,
  }

  render() {
    const { games, inverted } = this.props

    if (_.isEmpty(games)) return null

    return (
      <div>
        <Header as="h3" inverted={inverted} color={!inverted ? 'grey' : null} content="Featured Games" />
        <GameItems games={games} wrap />
      </div>
    )
  }
}
