import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Message, Header, Button, Icon } from 'semantic-ui-react'

import QLink from '/client/imports/routes/QLink'

export default class VideoAction extends React.Component {
  static propTypes = {}

  render() {
    return (
      <Message info icon>
        <Icon name="video" />
        <Message.Content>
          <Header>MGB video</Header>

          <p>
            <Button as={QLink} primary to="/video" floated="right" content="Watch video" />
            Learn tips and tricks of using MyGameBuilder!
          </p>
        </Message.Content>
      </Message>
    )
  }
}
