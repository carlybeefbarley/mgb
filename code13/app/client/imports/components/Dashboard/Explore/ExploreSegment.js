import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Divider } from 'semantic-ui-react'

import { mgbAjax } from '/client/imports/helpers/assetFetchers'

import FeaturedGames from './FeaturedGames'
import FeaturedAssets from './FeaturedAssets'
import FeaturedUsers from './FeaturedUsers'
import LiveGames from './LiveGames'
import { makeExpireTimestamp } from '../../../helpers/assetFetchers'

const MAX_AGE = 600 // 10 minutes

export default class ExploreSegment extends React.Component {
  static propTypes = {
    inverted: PropTypes.bool,
  }

  state = {
    featuredUsers: [],
    featuredGames: [],
    featuredAssets: [],
    liveGames: [],
  }

  componentDidMount() {
    // TODO (@team): figure out how to use cache globally: get latest version when it's required and use hashed when latest version is not changed
    const expireHash = `?hash=${makeExpireTimestamp(MAX_AGE)}`
    mgbAjax(`/api/asset/code/!vault/dashboard.featured${expireHash}`, (err, str) => {
      if (err) return console.log('error', err)

      const data = JSON.parse(str)

      _.map(data.liveGames, item => {
        mgbAjax('/api/asset/withoutC2/' + item.id + expireHash, (err, re) => {
          // TODO set state liveGameDataError
          if (err) return console.log(err)

          const record = { ...JSON.parse(re), url: item.url }
          this.setState(prevState => ({ liveGames: [...prevState.liveGames, record] }))
        })
      })

      _.map(data.games, item => {
        mgbAjax('/api/asset/withoutC2/' + item.id + expireHash, (err, re) => {
          if (err) return console.log(err)

          const record = JSON.parse(re)
          this.setState(prevState => ({ featuredGames: [...prevState.featuredGames, record] }))
        })
      })

      _.map(data.assets, item => {
        mgbAjax('/api/asset/withoutC2/' + item.id + expireHash, (err, re) => {
          if (err) return console.log(err)

          const record = JSON.parse(re)
          this.setState(prevState => ({ featuredAssets: [...prevState.featuredAssets, record] }))
        })
      })

      _.map(data.users, item => {
        mgbAjax('/api/user/name/' + item.name + expireHash, (err, re) => {
          if (err) return console.log(err)

          const record = JSON.parse(re)
          this.setState(prevState => ({ featuredUsers: [...prevState.featuredUsers, record] }))
        })
      })
    })
  }

  render() {
    const { inverted } = this.props
    const { liveGames, featuredGames, featuredAssets, featuredUsers } = this.state

    const hasLiveGames = !_.isEmpty(liveGames)
    const hasFeaturedGames = !_.isEmpty(featuredGames)
    const hasFeaturedAssets = !_.isEmpty(featuredAssets)
    const hasFeaturedUsers = !_.isEmpty(featuredUsers)

    if (!hasLiveGames && !hasFeaturedGames && !hasFeaturedAssets && !hasFeaturedUsers) {
      return null
    }

    return (
      <div>
        <LiveGames inverted={inverted} games={liveGames} />
        {hasLiveGames && <Divider hidden section />}

        <FeaturedGames inverted={inverted} games={featuredGames} />
        {hasFeaturedGames && <Divider hidden section />}

        <FeaturedAssets inverted={inverted} assets={featuredAssets} />
        {hasFeaturedAssets && <Divider hidden section />}

        <FeaturedUsers inverted={inverted} users={featuredUsers} />
        {hasFeaturedUsers && <Divider hidden section />}
      </div>
    )
  }
}
