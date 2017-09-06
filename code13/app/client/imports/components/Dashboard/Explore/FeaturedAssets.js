import React, { PropTypes } from 'react'
import { List, Header, Image } from 'semantic-ui-react'

export default class FeaturedAssets extends React.Component {
  static propTypes = {
    assets: PropTypes.array,
    limit: PropTypes.number,
  }

  render() {
    if (_.isEmpty(this.props.assets)) return null

    return (
      <div>
        <Header as="h3">Featured assets</Header>
        <List horizontal>
          {this.props.assets.map(asset => (
            <List.Item key={asset._id}>
              <a href={'/u/' + asset.dn_ownerName + '/asset/' + asset._id}>
                <Image width={70} height={70} src={asset.thumbnail} />
              </a>
            </List.Item>
          ))}
        </List>
      </div>
    )
  }
}
