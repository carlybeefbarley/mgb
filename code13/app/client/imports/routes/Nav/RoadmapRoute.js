import React from 'react'
import Footer from '/client/imports/components/Footer/Footer'
import QLink from '/client/imports/routes/QLink'
import { Segment, Container, Header, Icon } from 'semantic-ui-react'
import AboutHeader from './AboutHeader'

const RenderRoadmap = () => (
  <div>
    <h2>Features planned for April 2017</h2>
    <ul>
      <li>(<small>Nearly complete</small>) MGBv1 asset migration (tiles, actors, maps)</li>
      <li>Direct Messages</li>
      <li>Launch on April 25th</li>
    </ul>
    <p>See the <QLink to='/whatsnew'>What's new</QLink> page for the lists of recent changes</p>
    <h2>Features coming in Summer 2017</h2>
    <ul>
      <li>Mobile Apps</li>
      <li>Full forum-type functionality for the Chat system (topics, search etc)</li>
      <li>Multiplayer game support</li>
      <li>Asset management features</li>
      <ul>
        <li>Asset Tags & Tag search</li>
        <li>Stock/sample assets system</li>
        <li>Asset Versioning/Publishing system</li>
        <li>TODO tracker</li>
      </ul>
      <li>Help and Education systems</li>
      <ul>
        <li>Keyboard shortcut editor and help</li>
        <li>Mentoring and AskForhelp systems</li>
        <li>Game design skills and tutorials</li>
        <li>Javascript - Katas & Koans</li>
      </ul>
      <li>Project features:</li>
        <ul>
          <li>Project Tags & Tag search</li>
          <li>Improved Game Discovery, Management and Analytics</li>
          <li>Project rename</li>
          <li>Project goals: ProjectGoal: [scratch/learn/jam/resume/showcase/product]</li>
        </ul>
      <li>New Asset types</li>
      <ul>
        <li>Cutscene Editor</li>
        <li>Documents (and Cheat sheets. and presentations?)</li>
      </ul>
      <li>Test reporting </li>
      <ul>
        <li>Playtest reporting</li>
        <li>Feature coverage reporting</li>
        <li>Code coverage reporting</li>
      </ul>
      <li>Account/Content flagging (content, accounts.. penalties like timeouts)</li>
      <li>MGB feature usage reporting</li>
      <li>MGB plugin tools (graphic edit etc)</li>
      <li>MCB (MyCodeBuilder) skin + Interface designer / React Storybook / </li>
      <li>Quotas</li>
      <li>Tokens</li>
    </ul>
  </div>
)

export default RoadmapRoute = () => (
  <div>
    <Segment basic>
      <Container>
        <Header as='h2'><Icon name='info circle' />Roadmap</Header>
        <AboutHeader />
          <p>
            See the latest changes on the <QLink to="/whatsnew">What's New</QLink> page.
          </p>          
        <RenderRoadmap />
      </Container>
    </Segment>
    <Footer />
  </div>
)

/* More stuff to add to displayed roadmap in future *

      <li>Test runner for MGB Code Assets</li>

Flagging (content, accounts.. penalties like timeouts)
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
