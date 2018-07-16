import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Card, Button } from 'semantic-ui-react'
import Thumbnail from '/client/imports/components/Assets/Thumbnail'
import { utilPushTo } from '/client/imports/routes/QLink'
import QLink from '/client/imports/routes/QLink'
import { showToast } from '/client/imports/modules'

export default class TemplateCard extends React.Component{
  static propTypes = {
    codeAssetId: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    imageId: PropTypes.string,
    currUser: PropTypes.object, // currently logged in user (if any)
  }

  state ={
      isForkPending: false,
    }

  handleForkClick = () => {
    if (!this.state.isForkPending) {
      Meteor.call('Azzets.fork', this.props.codeAssetId, this.forkResultCallback)
      this.setState({ isForkPending: true })
    }
  }

  forkResultCallback = (error, result) => {
    if (error) showToast.error(`Unable to create a forked copy of this asset: '${error.toString()}'`)
    else {
      const url = `/u/${this.props.currUser.profile.name}/asset/` + result.newId
      utilPushTo(null, url)
      this.setState({ isForkPending: false })
    }
  }

  render() {
    return (
      <Card link color={'green'} key={this.props.assetId}>
        <Card.Content onMouseUp={this.handleForkClick} onTouchEnd={this.handleForkClick}>
          <Card.Header>{this.props.name}</Card.Header>
          <Thumbnail constrainHeight="155px" assetId={this.props.imageId} />
          <Card.Description>{this.props.description}</Card.Description>
        </Card.Content>
      </Card>
    )
  }
}