import React from 'react'
import Footer from '/client/imports/components/Footer/Footer'
import QLink from '/client/imports/routes/QLink'
import { Segment, Container, Header } from 'semantic-ui-react'
import AboutHeader from './AboutHeader'

const RenderRoadmap = () => (
  <div>
    <h2>Features planned for July 2017</h2>
    <ul>
      <li>(@levithomason + team) UI Cleanup</li>
      <li>(@Bouhm) ActorMap game improvements</li>
      <li>
        (@leah) Moderation (Deep flagging & moderation features, including the Skills tracks for Community
        management)
      </li>
      <li>(@stauzs) Mobile App (Focused on notification, chat and play)</li>
      <li>(@guntis) Dashboard</li>
      <li>(@guntis) Build a game with the MGB community (probably tower defense-ish)</li>
      <li>(@DSeedman) Revamp the Badge system - define badges, get cleaned up art</li>
    </ul>
    <h2>Features coming later in 2017</h2>
    <ul>
      <li>Major Feature 'epics' which will each take a couple of months:</li>
      <ol>
        <li>MyCodeBuilder variant of the site + React-based Interface designer + tutorials</li>
        <li>Multiplayer game support (Save game, highscores, rooms, low-latency-multiplayer)</li>
        <li>
          Modularity (plugin interface for asset editors, asset tools, etc.. allowing MGB/MCB to be extended
          by the user community)
        </li>
      </ol>
      <li>Full forum-type functionality for the Chat system (topics, search etc)</li>
      <li>Asset management features</li>
      <ul>
        <li>TODO/Issues system for user projects (probably as a Kanban-style tracker like Trello)</li>
        <li>Asset Tags & Tag search</li>
        <li>Stock/sample assets system</li>
        <li>Asset Versioning/Publishing system</li>
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
        <li>Documents (and Cheat sheets. and presentations?)</li>
        <li>Cutscene Editor</li>
      </ul>
      <li>Test reporting</li>
      <ul>
        <li>Playtest reporting</li>
        <li>Feature coverage reporting</li>
        <li>Code coverage reporting</li>
      </ul>
      <li>Account/Content flagging (content, accounts.. penalties like timeouts)</li>
      <li>MGB feature usage reporting</li>
      <li>
        (postponed) Direct Messages - we decided to prioritize wall first, especially since project chat
        provides group or 1:1 private chat
      </li>
      <li>
        ...We are also going to be working with the community on their thoughts on "monetization".. What
        advanced features they would feel are WORTH paying for, and what ways users might want to make
        payments to each other (asset stores etc). We are not going to nickel+dime and a HUGE amount of MGB's
        features will always be free. Feel free to come and chat to us about your thoughts.
      </li>
    </ul>
    Please make suggestions on our{' '}
    <a href="https://trello.com/b/Fg0EcntK/my-game-builder" target="_blank" rel="noopener noreferrer">
      Trello work proposals list
    </a>
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
