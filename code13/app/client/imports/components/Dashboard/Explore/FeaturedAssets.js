import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Header } from 'semantic-ui-react'

import AssetList from '/client/imports/components/Assets/AssetList'

export default class FeaturedAssets extends React.Component {
  static propTypes = {
    assets: PropTypes.array,
    inverted: PropTypes.bool,
  }

  render() {
    const { assets, inverted } = this.props

    if (_.isEmpty(assets)) return null

    return (
      <div>
        <Header as="h3" inverted={inverted} color={!inverted ? 'grey' : null} content="Featured Assets" />
        <AssetList assets={assets} />
      </div>
    )
  }
}
