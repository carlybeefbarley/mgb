import React from 'react'
import '../home.css'
import QLink from '../QLink'
import Footer from '/client/imports/components/Footer/Footer'
import { Segment, Header, Container, Button, Message, Divider } from 'semantic-ui-react'

const NotFoundRoute = ({ currUser }) => (
  <div>
    <Segment className="vertical masthead center aligned">
      <Container text>
        <Header as="h1" content="My Game Builder" />
        <Header as="h2" content="Page Not Found" />
        <Message
          warning
          compact
          header="You are in a maze of twisty passages, all alike..."
          content="How did you even get here!?"
        />
        <Divider clearing />
        {currUser ? (
          <QLink to={`/u/${currUser.profile.name}/assets`}>
            <Button size="huge" primary content="Keep Going" icon="right arrow" />
          </QLink>
        ) : (
          <QLink to="/learn/get-started">
            <Button size="huge" primary content="Get Started" icon="right arrow" />
          </QLink>
        )}
      </Container>
    </Segment>
    <Footer />
  </div>
)

export default NotFoundRoute
