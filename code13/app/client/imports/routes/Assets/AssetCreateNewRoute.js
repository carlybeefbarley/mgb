import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import Helmet from 'react-helmet'
import AssetCreateNew from '/client/imports/components/Assets/NewAsset/AssetCreateNew'
import { Container, Segment } from 'semantic-ui-react'
import Hotjar from '/client/imports/helpers/hotjar.js'

// Default params we will accept in ? params on url
const suggestedParamNames = 'projectName,assetName,assetKind'.split(',')

const AssetCreateNewRoute = React.createClass({
  propTypes: {
    params: PropTypes.object, // .id (LEGACY /user/:id routes), or .username (current /u/:username routes) Maybe absent if route is /assets
    user: PropTypes.object, // Maybe absent if route is /assets
    currUser: PropTypes.object, // Currently Logged in user
    currUserProjects: PropTypes.array,
    ownsProfile: PropTypes.bool,
    location: PropTypes.object, // We get this from react-router
  },

  componentDidMount() {
    // setTimeou just to be sure that everything is loaded
    setTimeout(() => Hotjar('trigger', 'asset-create-new', this.props.currUser), 200)
  },

  render() {
    return (
      <Segment basic>
        <Helmet title="Create a new Asset" meta={[{ name: 'description', content: 'Assets' }]} />
        <Container>
          <AssetCreateNew
            currUser={this.props.currUser}
            currUserProjects={this.props.currUserProjects}
            suggestedParams={_.pick(this.props.location.query, suggestedParamNames)}
          />
        </Container>
      </Segment>
    )
  },
})

export default AssetCreateNewRoute
