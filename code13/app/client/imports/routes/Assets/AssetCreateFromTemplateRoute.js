import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import Helmet from 'react-helmet'
import AssetFromTemplate from '/client/imports/components/Assets/NewAsset/AssetFromTemplate'
import { Container, Segment } from 'semantic-ui-react'
import Hotjar from '/client/imports/helpers/hotjar.js'

// Default params we will accept in ? params on url
const suggestedParamNames = 'projectName,assetName,assetKind'.split(',')

export default class AssetCreateFromTemplateRoute extends React.PureComponent{
  static propTypes = {
    params: PropTypes.object, // .id (LEGACY /user/:id routes), or .username (current /u/:username routes) Maybe absent if route is /assets
    user: PropTypes.object, // Maybe absent if route is /assets
    currUser: PropTypes.object, // Currently Logged in user
    currUserProjects: PropTypes.array,
    ownsProfile: PropTypes.bool,
    location: PropTypes.object, // We get this from react-router
  }

  componentDidMount() {
    // setTimeout just to be sure that everything is loaded
    setTimeout(() => Hotjar('trigger', 'asset-create-from-template', this.props.currUser), 200)
  }

  render() {
    return (
      <Segment basic>
        <Helmet title="Create Asset from Template" meta={[{ name: 'description', content: 'Assets' }]} />
        <Container>
          <AssetFromTemplate
            currUser={this.props.currUser}
            currUserProjects={this.props.currUserProjects}
            suggestedParams={_.pick(this.props.location.query, suggestedParamNames)}
          />
        </Container>
      </Segment>
    )
  }
}
