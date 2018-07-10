import PropTypes from 'prop-types'
import React from 'react'
import Helmet from 'react-helmet'
import { Container, Segment, Message } from 'semantic-ui-react'

const ForumRoute = () => (
  <Container text>
    <Segment padded>
      <Helmet title={`MGB Forums?`} meta={[{ name: `MGB`, content: 'forum' }]} />
      <Message info>
        <Message.Header content="MGB Forums" />
        <p>
          The old MGBv1 forums are at{' '}
          <a href="http://v1.mygamebuilder.com/forum" target="_blank" rel="noopener noreferrer">
            http://v1.mygamebuilder.com/forum
          </a>
        </p>
        <Message.List>
          <Message.Item>
            For this new MGBv2 system, the plan is to support forum-style chat within the system so that
            chatting and making are united in a single user experience.
          </Message.Item>
          <Message.Item>
            This integrated approach will makes it much simpler to coordinate project membership and ensure
            members have access to project chat, etc.
          </Message.Item>
          <Message.Item>
            For now, the chat FlexPanel has part of this functionality, but we intend to implement threads,
            DMs and search 'soon'.
          </Message.Item>
        </Message.List>
      </Message>
    </Segment>
  </Container>
)

export default ForumRoute
