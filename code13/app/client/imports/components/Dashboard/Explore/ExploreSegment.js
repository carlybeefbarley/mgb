import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Segment } from 'semantic-ui-react'
import FeaturedGames from './FeaturedGames'
import FeaturedAssets from './FeaturedAssets'
import FeaturedUsers from './FeaturedUsers'
import LiveGames from './LiveGames'

import { mgbAjax } from '/client/imports/helpers/assetFetchers'

// console.log(assetViewChoices, defaultAssetViewChoice)

export default class ExploreSegment extends React.Component {
  state = {
    featuredUsers: [],
    featuredGames: [],
    featuredAssets: [],
    liveGames: [],
  }

  componentDidMount() {
    mgbAjax(`/api/asset/code/!vault/dashboard.featured`, (err, str) => {
      if (err) console.log('error', err)
      else {
        const data = JSON.parse(str)

        if (!_.isEmpty(data['liveGames'])) {
          const liveGameData = []
          data.liveGames.map(item => {
            mgbAjax('/api/asset/withoutC2/' + item.id, (err, re) => {
              // TODO set state liveGameDataError
              if (err) console.log(err)
              else {
                const liveGame = JSON.parse(re)
                liveGame.url = item.url
                liveGameData.push(liveGame)
                if (liveGameData.length == data.liveGames.length) {
                  this.setState({ liveGames: liveGameData })
                }
              }
            })
          })
        }

        if (!_.isEmpty(data['games'])) {
          const gameData = []
          data.games.map(item => {
            mgbAjax('/api/asset/withoutC2/' + item.id, (err, re) => {
              if (err) console.log(err)
              else {
                gameData.push(JSON.parse(re))
                if (gameData.length == data['games'].length) {
                  this.setState({ featuredGames: gameData })
                }
              }
            })
          })
        }

        if (!_.isEmpty(data['assets'])) {
          const assetData = []
          data['assets'].map(item => {
            mgbAjax('/api/asset/withoutC2/' + item.id, (err, re) => {
              if (err) console.log(err)
              else {
                assetData.push(JSON.parse(re))
                if (assetData.length == data['assets'].length) {
                  this.setState({ featuredAssets: assetData })
                }
              }
            })
          })
        }

        if (!_.isEmpty(data['users'])) {
          const userData = []
          data['users'].map(item => {
            mgbAjax('/api/user/name/' + item.name, (err, re) => {
              if (err) console.log(err)
              else {
                userData.push(JSON.parse(re))
                if (userData.length == data['users'].length) {
                  this.setState({ featuredUsers: userData })
                }
              }
            })
          })
        }
      }
    })
  }

  /* Just has fake data */
  render() {
    return (
      <Segment>
        <LiveGames games={this.state.liveGames} limit={2} />

        <FeaturedGames games={this.state.featuredGames} limit={4} />

        <FeaturedAssets assets={this.state.featuredAssets} limit={10} />

        <FeaturedUsers users={this.state.featuredUsers} limit={4} />
      </Segment>
    )
  }
}
