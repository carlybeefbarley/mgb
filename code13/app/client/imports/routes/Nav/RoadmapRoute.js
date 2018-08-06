import React from 'react'
import Footer from '/client/imports/components/Footer/Footer'
import QLink from '/client/imports/routes/QLink'
import { Segment, Container, Header, List, Grid, Image } from 'semantic-ui-react'
import AboutHeader from './AboutHeader'

// New imports for updated roadmap/info sections
import HeroLayout from '/client/imports/layouts/HeroLayout'
import HeaderImage from '/client/imports/components/HeaderImage/HeaderImage'

const RenderRoadmap = () => (
  <div>
    <h2>Features Planned for 2018</h2>
    <List>
      <List.Item
        icon={{ color: 'green', name: 'plus' }}
        header="Work with Class over Summer"
        description="Testing our education views with an actual classroom of kids using MGB to create games"
      />
    </List>
    <p>
      Please make suggestions on our{' '}
      <a href="https://trello.com/b/Fg0EcntK/my-game-builder" target="_blank" rel="noopener noreferrer">
        Trello work proposals list
      </a>.
    </p>
  </div>
)

const RoadmapRoute = () => (
  <HeroLayout
    heroContent={
      <Grid>
        <Grid.Column width={3} />
        <Grid.Column width={10}>
          <Header inverted style={titleStyle} as="h1">
            <HeaderImage name="javascript-logo" />
            My Game Builder Roadmap
            <HeaderImage name="phaserLogo" />
            <Header.Subheader>Keep up to date with our latest changes and additions</Header.Subheader>
          </Header>

          <Segment raised color="blue">
            {/* Old Roadmap content...needs a lot of work */}

            {/* <Segment basic>
          <Container>
            <Header as="h1" icon="road" content="Roadmap" />
            <p>
              See the latest changes on the <QLink to="/whats-new">What's New</QLink> page.
            </p>
            <AboutHeader />
            <RenderRoadmap />
          </Container>
        </Segment> 
        <Footer /> */}
          </Segment>
        </Grid.Column>
        <Grid.Column width={3} />
      </Grid>
    }
  />
)

export default RoadmapRoute

const titleStyle = {
  fontSize: '3em',
  textAlign: 'center',
}

/* More stuff to add to displayed roadmap in future *

      <li>Test runner for MGB Code Assets</li>

Flagging (description, accounts.. penalties like timeouts)
Cutscenes
Documents (and Cheat sheets. and presentations?)
Tagging
  project goals: ProjectGoal: [scratch/learn/jam/resume/showcase/product]
Test reporting
  Playtest reporting
  Feature coverae reporting
  Code coverage
MGB feature usage
MGB plugin tools (graphic edit etc)
MCB (MyCodeBuilder) skin + Interface designer / React Storybook /
Javascript - Katas & Koans
Quotas
Tokens
*/
