import React from 'react'
import Footer from '/client/imports/components/Footer/Footer'

export default Roadmap = React.createClass({

  render: function() {
    return (
      <div>
        <div className="ui basic segment">
          <div className="ui container">
            <h2 className="ui header"><i className="map icon" />Feature Roadmap</h2>
            { this.renderRoadmap() }
          </div>
        </div>
        <Footer />
      </div>
    )
  },

  renderRoadmap: function() {
    return (
      <div>
        <h2>Features planned for September 2016</h2>
        <ul>
          <li>(DONE) Allow project members to edit assets in your projects</li>
          <li>(DONE) Avatars for users and projects (drag graphic asset from FlexPanel)</li>
          <li>(DONE) Multi-channel/track music editing/mixing</li>
          <li>(IN PROGRESS) Code Editor code-assist features</li>
          <li>(IN PROGRESS) Tutorial and progression systems to help learn how to make games</li>
          <li>MGBv1 asset migration (tiles, actors, maps)</li>
          <li>MGBv1-style 'Actor' assets which enable game building without coding</li>
          <li>Chat improvements (notifications, DMs etc)</li>
          <li>A new 'Game' asset will provide a way to promote games and track plays</li>
        </ul>
        <h2>Features coming later in 2016</h2>
        <ul>
          <li>Asset Versioning/Publishing system</li>
          <li>Clone Asset / Clone Project</li>
          <li>Easier Asset referencing from source code</li>
          <li>Email for password reset, notifications etc</li>
          <li>Game Discovery, Management and Analytics</li>
          <li>Improved UI for touch-only devices like iPads</li>
          <li>Keyboard shortcut editor and help</li>
          <li>Mentoring and AskForhelp systems</li>
          <li>Project rename/delete</li>
          <li>Test runner for MGB Code Assets</li>
          <li>TODO tracker</li>
          <li>Skills tracker</li>
          <li>Stock/sample assets system</li>
        </ul>
      </div>
    )
  }


/* More stuff to add to displayed roadmap in future *

Flagging (content, accounts.. penalties like timeouts)
Cutscenes
Documents
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

})