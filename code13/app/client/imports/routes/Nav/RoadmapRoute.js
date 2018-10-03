import React from 'react'
import Footer from '/client/imports/components/Footer/Footer'
import QLink from '/client/imports/routes/QLink'
import { Segment, Container, Header, List } from 'semantic-ui-react'
import AboutHeader from './AboutHeader'

const RenderRoadmap = () => (
  <div>
    <h2>Features Planned for 2018 Q1</h2>
    <List>
      <List.Item
        icon={{ color: 'green', name: 'plus' }}
        header="Tutorial Overhaul"
        description="Better interface, reduce popups, reduce steps, and more robust navigation control."
      />
      <List.Item
        icon={{ color: 'green', name: 'plus' }}
        header="Starter Assets/Projects"
        description="New accounts will include default projects. !vault will include forkable projects."
      />
      <List.Item
        icon={{ color: 'green', name: 'plus' }}
        header="Produce Videos"
        description="Help and tutorial videos. Deep link into related sections of the app."
      />
      <List.Item
        icon={{ color: 'green', name: 'plus' }}
        header="Notification System"
        description="We'll begin by streamlining the activity feed from a global feed to more relevant updates."
      />
      <List.Item
        icon={{ color: 'green', name: 'plus' }}
        header="Better Project Experience"
        description="Allow opening/editing multiple assets simultaneously.  Quickly add new assets to a project."
      />
      <List.Item
        icon={{ color: 'green', name: 'plus' }}
        header="Chat Overhaul"
        description="Better interface, longer messages, better formatting, autocomplete, emojis, and more :)"
      />
      <List.Item
        icon={{ color: 'green', name: 'plus' }}
        header="Squelch Spam and Bots"
        description="Improve spam and bot prevention and removal mechanisms."
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
  <div>
    <Segment basic>
      <Container>
        <Header as="h1" icon="road" content="Roadmap" />
        <AboutHeader />
        <p>
          See the latest changes on the <QLink to="/whats-new">What's New</QLink> page.
        </p>
        <RenderRoadmap />
      </Container>
    </Segment>
    <Footer />
  </div>
)

export default RoadmapRoute

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
