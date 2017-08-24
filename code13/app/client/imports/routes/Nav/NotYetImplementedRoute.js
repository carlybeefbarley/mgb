import React from 'react'
import '../home.css'
import QLink from '../QLink'
import Footer from '/client/imports/components/Footer/Footer'
import { Segment, Header, Container, Button, Message, Divider } from 'semantic-ui-react'

const NotYetImplementedRoute = ({ currUser, params }) => (
  <div>
    <Segment className="vertical masthead center aligned">
      <Container text>
        <Header as="h1" content="My Game Builder" />
        <Header as="h2" content="Not yet implemented" />
        <Message
          warning
          icon="warning sign"
          compact
          header="Soon, soon!"
          content={`We are hard at work on '${params.featureName}'`}
        />
        <Divider clearing />
        {currUser ? (
          <QLink to={`/u/${currUser.profile.name}/assets`}>
            <Button size="huge" primary content="Keep Going" icon="right arrow icon" />
          </QLink>
        ) : (
          <QLink to="/assets">
            <Button size="huge" primary content="Get Started" icon="right arrow icon" />
          </QLink>
        )}
      </Container>
    </Segment>
    <Footer />
  </div>
)

export default NotYetImplementedRoute
