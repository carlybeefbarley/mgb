import React from 'react'
import Footer from '/client/imports/components/Footer/Footer'
import QLink from '/client/imports/routes/QLink'

const RenderRoadmap = () => (
  <div>
    <h2>Features planned for Feb 2017</h2>
    <ul>
      <li>(<small>Nearly complete</small>) Tutorial and progression content to help learn how to make games</li>
      <li>(<small>Nearly complete</small>) Scalability config/work required for launch</li>
      <li>(<small>Nearly complete</small>) MGBv1 asset migration (tiles, actors, maps)</li>
      <li>Clone Project</li>
      <li>Chat improvements (notifications, DMs etc)</li>
      <li>Goal for Launch: <strong>During last week of Feb 2017</strong></li>
    </ul>
    <p>See the <QLink to='/whatsnew'>What's new</QLink> page for the lists of recent changes</p>
    <h2>Features coming in Q1 2017</h2>
    <ul>
      <li>TODO tracker</li>
      <li>Asset Versioning/Publishing system</li>
      <li>Improved Game Discovery, Management and Analytics</li>
      <li>Keyboard shortcut editor and help</li>
      <li>Mentoring and AskForhelp systems</li>
      <li>Project rename</li>
      <li>Stock/sample assets system</li>
    </ul>
  </div>
)

export default RoadmapRoute = () => (
  <div>
    <div className="ui container">
      <div className="ui basic segment">
        <RenderRoadmap />
      </div>
    </div>
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
