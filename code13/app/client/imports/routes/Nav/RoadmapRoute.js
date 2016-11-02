import React from 'react'
import Footer from '/client/imports/components/Footer/Footer'

const RenderRoadmap = () => (
  <div>
    <h2>Features planned for October 2016</h2>
    <ul>
      <li>(IN PROGRESS) Even more Code Editor code-assist features</li>
      <li>(IN PROGRESS) Tutorial and progression systems to help learn how to make games</li>
      <li>(*COMPLETED*) A new 'Game' asset will provide a way to promote games and track plays</li>
      <li>(*COMPLETED*) MGBv1 asset migration (tiles, actors, maps)</li>
      <li>(*COMPLETED*) MGBv1-style 'Actor' assets which enable game building without coding</li>
    </ul>
    <h2>Features coming later in 2016</h2>
    <ul>
      <li>Chat improvements (notifications, DMs etc)</li>
      <li>Asset Versioning/Publishing system</li>
      <li>Clone Asset / Clone Project</li>
      <li>Email for password reset, notifications etc</li>
      <li>Game Discovery, Management and Analytics</li>
      <li>Further Improve UI for touch-only devices like iPads</li>
      <li>Keyboard shortcut editor and help</li>
      <li>Mentoring and AskForhelp systems</li>
      <li>Project rename</li>
      <li>Test runner for MGB Code Assets</li>
      <li>Tutorials and Tutorial editor</li>
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

Flagging (content, accounts.. penalties like timeouts)
Cutscenes
Documents (and Cheat sheets. and presentations?)
License handling & Attribution of sources
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
Pro accounts (private projects, ...)
Quotas
*/
