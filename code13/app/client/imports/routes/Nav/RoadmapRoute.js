import React from 'react'
import Footer from '/client/imports/components/Footer/Footer'
import QLink from '/client/imports/routes/QLink'

const RenderRoadmap = () => (
  <div>
    <h2>Features planned for November 2016</h2>
    <ul>
      <li>(<small>IN PROGRESS</small>) Yet more Code Editor code-assist features</li>
      <li>(<small>IN PROGRESS</small>) Tutorial and progression content to help learn how to make games</li>
      <li>(<small>IN COMPAT TEST</small>) MGBv1 asset migration (tiles, actors, maps)</li>
      <li>Chat improvements (notifications, DMs etc)</li>
      <li>Clone Asset (DONE) / Clone Project</li>
      <li>(DONE) Further Improve UI for touch-only devices like iPads and narrower screen</li>
      <li>(IN PROGRESS) Scalability config/work required for launch</li>
    </ul>
    <p>See the <QLink to='/whatsnew'>What's new</QLink> page for the lists of recent changes</p>
    <h2>Features coming later in 2016</h2>
    <ul>
      <li>December Launch - GO GO GO</li>
      <li>Asset Versioning/Publishing system</li>
      <li>Email for password reset, notifications etc</li>
      <li>Improved Game Discovery, Management and Analytics</li>
      <li>Keyboard shortcut editor and help</li>
      <li>Mentoring and AskForhelp systems</li>
      <li>Project rename</li>
      <li>Stock/sample assets system</li>
      <li>TODO tracker</li>
      <li>Skills tracker</li>
    </ul>
  </div>
)

export default RoadmapRoute = () => (
  <div>
    <div className="ui basic segment">
      <div className="ui container">
        <h2 className="ui header"><i className="map icon" />Feature Roadmap</h2>
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
